const ERR_COMPONENT_CLAIMED = Symbol();
const ERR_COMP_HANDLE_UNRENDERED = Symbol();
const STORE = Symbol();
const RENDER_INTERVAL = 0.1667;
const RENDER_STATE = Symbol();
const IDLE = Symbol();
const RENDER_QUEUED = Symbol();
const RENDERING = Symbol();
const QUEUE_RENDER = Symbol();
const IS_DIRTY = Symbol();
const KEY_DEPS = Symbol();
const RENDER = Symbol();
const HTML = Symbol();
const MOUNT = Symbol();
const PARENT = Symbol();
const RESOLVE_COMPONENT = Symbol();
const CHILD_COMPONENT_INSTANCES = Symbol();
const ID = Symbol();
const RENDER_RESULT = Symbol();
const UNMOUNTED = Symbol();
const RENDER_PROMISE = Symbol();
const CLAIMED = Symbol();
const GENERATE_ID = Symbol();
const SET_CONTEXT = Symbol();
const ATTRS = Symbol();
const CONTENT = Symbol();
const RENDER_STATUS = Symbol();

function difference(setA, setB) {
    if (Array.isArray(setB)) setB = new Set(setB);
    let newSet = new Set(setA)
    for (let elem of setB) {
        newSet.delete(elem)
    }
    return newSet
}

class ComponentRenderHandle {

    constructor({ componentName, attrs, content, parent }) {
        this.attrs = attrs;
        this.key = attrs.key;
        this.content = content instanceof RenderResult
            ? { 'default' : content }
            : content;
        this.componentName = componentName;
        this.parent = parent;
        this.rendered = null;
        this.didRender = false;
        this.component = null;
    }

    async render() { 
        const { parent, componentName, key, attrs, content } = this;
        
        if (this.didRender) {
            return this;
        }

        this.component = await parent[RESOLVE_COMPONENT](componentName, key, {
            attrs,
            content
        });

        this.rendered = await this.component[RENDER]();
        this.didRender = true;

        return this;
    }
}

class ComponentDomRenderHandle extends ComponentRenderHandle {
    toString() {
        return `<template id="${this.component[ID]}"></template>`
    }


    mount(parent) {
        const newTemplate = document.createElement('template');
        newTemplate.innerHTML = this.result;
        this.component[DOM] = newTemplate;

        const templateMountPoint = parent[DOM].getElementByID(this.component[ID]);
        templateMountPoint.parentNode.insertBefore(newTemplate.content.cloneNode(true), templateMountPoint);
    }
}

class ComponentNodeRenderHandle extends ComponentRenderHandle {
    toString() {
        if (!this.didRender) {
            throw new Error(ERR_COMP_HANDLE_UNRENDERED);
        }
        return `<template id="${this.component[ID]}">${this.rendered}</template>`
    }
}

class RenderResult {

    constructor({component, segments, expressions}) {
        this.segments = segments;
        this.expressions = expressions;
        this.component = component;
    }
    
    async render() {
        const { component, expressions, segments} = this;

        var transformExpression = exp =>
            (exp instanceof Slot || exp instanceof RenderResult || exp instanceof ComponentRenderHandle)
                ? exp.render()
                : Array.isArray(exp)
                    ? Promise.all(exp.map(transformExpression))
                    : exp

        return new RenderResult({
            component,
            segments,
            expressions: await Promise.all(expressions.map(transformExpression))
        })
    }

    serializeExpression(exp) {
        //@TODO escape html in expressions without an override
        if (typeof exp === 'function') return `resolveWeddellComponentState('${this.id}').then(state => (${exp})(event))`;
        if (Array.isArray(exp)) return exp.map(this.serializeExpression.bind(this)).join('')
        return exp || ''
    }

    toString() {
        return this.segments.reduce((acc, curr, ii) => 
            `${acc}${curr}${this.serializeExpression(this.expressions[ii])}`, '');
    }
}

class Slot {
    constructor({name, defaultContent, component}) {
        this.name = name;
        this.defaultContent = defaultContent;
        this.component = component;
    }

    async render() {
        const { component, name, defaultContent } = this;
        const content = (component[CONTENT][name] || defaultContent);
        return content && content.render();
    }
}

export const createComponentClass = ({ComponentRenderHandle=ComponentNodeRenderHandle, EventEmitter, Error, Store, renderInterval=RENDER_INTERVAL}) => class Component extends EventEmitter {

    [QUEUE_RENDER]() {
        if (this[RENDER_STATE] !== RENDER_QUEUED) {
            this[RENDER_STATE] = RENDER_QUEUED;
            setTimeout(() => {
                this[RENDER]()
            }, renderInterval);
        }
    }

    async [RENDER]() {
        //check if attributes or content changed. if only content changed that we can probably avoid rerender and just append the new content to the dom in the right place
        if (!this[IS_DIRTY]) {
            return this[RENDER_PROMISE];
        }
        this[RENDER_STATUS] = RENDERING;
        this[IS_DIRTY] = false;
        this[KEY_DEPS].clear();
        const onGetState = ({key, store}) => {
            if (!this[KEY_DEPS].has(store)) {
                this[KEY_DEPS].set(store, {});
            }
            this[KEY_DEPS].get(store)[key] = 1;
        }
        this[STORE].internal.on('getstate', onGetState);

        const result = this.template({
            slot: (name='default', defaultContent=null) => {
                if (name instanceof RenderResult) {
                    defaultContent = name;
                    name = 'default'
                }
                return new Slot({ name, defaultContent, component: this })
            },
            component: (componentName, attrs={}, content) => {
                if (attrs instanceof RenderResult) {
                    content = attrs;
                    attrs = {};
                }
                return new ComponentRenderHandle({
                    componentName, 
                    attrs, 
                    content,
                    parent: this
                })
            },
            html: (segments, ...expressions) =>
                new RenderResult({
                    component: this, 
                    segments, 
                    expressions
                })
            , 
            state: this[STORE].readOnly
        });
        this[STORE].internal.off('getstate', onGetState);

        return this[RENDER_PROMISE] = result.render()
            .then((val) => {
                if (this[IS_DIRTY]) {
                    return this[RENDER]()
                }
                this[RENDER_STATUS] = IDLE;
                return this[RENDER_RESULT] = val
            })
    }

    async [RESOLVE_COMPONENT](componentName, key, initOpts={}) {
        let ComponentClass = (this.constructor.components || {})[componentName];

        if (!ComponentClass) {
            return this[PARENT] 
                ? this[PARENT][RESOLVE_COMPONENT](componentName, key)
                : null;
        }

        if (!(ComponentClass.prototype instanceof Component)) {
            ComponentClass = await ComponentClass();
        }

        let components = this[CHILD_COMPONENT_INSTANCES].get(ComponentClass);

        if (!components) {
            components = this[CHILD_COMPONENT_INSTANCES].set(ComponentClass, []).get(ComponentClass);
        }

        let component = key == null 
            ? components.find(comp => !comp[CLAIMED]) 
            : components[key];

        if (!component) {
            component = new ComponentClass({...initOpts, parent: this})
        } else {
            component[SET_CONTEXT]({...initOpts, parent: this})
        }

        if (component[CLAIMED]) throw new Error(ERR_COMPONENT_CLAIMED);

        component[CLAIMED] = true;

        return component;
    }

    // [UNMOUNT]() {
    //     this[CLAIMED] = false;
    // }

    // [MOUNT]() {

    // }

    static [GENERATE_ID]() {
        return Math.random().toString(36).substring(7)
    }

    [SET_CONTEXT]({parent, attrs, id, content}) {
        this[PARENT] = parent;
        this[ATTRS] = attrs;
        this[CONTENT] = content;
        this[ID] = id || attrs.id || this.constructor[GENERATE_ID]();
    }

    store() {
        return () => {}
    }

    constructor({parent=null, id, attrs={}, content=null}={}) {
        super();
        this[STORE] = new Store(({ReactiveState, ComputedState}) => this.store({
            reactive: val => new ReactiveState(val),
            computed: func => new ComputedState(func)
        }));
        this[RENDER_PROMISE] = null;
        this[RENDER_STATUS] = IDLE;
        this[CLAIMED] = false;
        this[CHILD_COMPONENT_INSTANCES] = new Map;
        this[SET_CONTEXT]({attrs, id, content, parent});
        this[KEY_DEPS] = new Map;
        this[STORE].internal.on('statechange', ({key, val, store}) => {
            const deps = this[KEY_DEPS].get(store)

            if (deps && key in deps) {
                this[IS_DIRTY] = true;
            }
        });
        var html;
        var renderResult;
        var isDirty = true;

        const onChildRender = ({renderResult}) => {
            this[DOM].getElementByID(component[ID])
        }

        Object.defineProperties(this, {
            [HTML]: {
                set: (val) => {
                    html = val;
                    this.trigger('htmlchange', {html});
                },
                get: () => html
            },
            [IS_DIRTY]: {
                set: (val) => {
                    const wasDirty = isDirty;
                    isDirty = val;
                    if (wasDirty !== val && val && this[RENDER_STATUS] === IDLE) {
                        this[RENDER]();
                    }                    
                },
                get: () => isDirty
            },
            html: {
                get: () => html
            },
            [RENDER_RESULT]: {
                set: newRenderResult => {
                    // difference(newRenderResult.compHandles, renderResult.compHandles)
                    //     .forEach(handle => {
                    //         handle.component[MOUNT](RENDER_RESULT);
                    //         handle.component.on('render', onChildRender);
                    //     });
                    // difference(renderResult.compHandles, newRenderResult.compHandles)
                    //     .forEach(handle => {
                    //         handle.component[UNMOUNT](RENDER_RESULT);
                    //         handle.component.off('render', onChildRender);
                    //     });
                    renderResult = newRenderResult;
                    this[HTML] = `${renderResult}`;
                },
                get: () => renderResult
            }
        })
    }

    init() {
        return this[RENDER]()
    }

    get renderPromise() {
        return this[RENDER_PROMISE];
    }

    get state() {
        return this[STORE].writable;
    }
}

export default createComponentClass