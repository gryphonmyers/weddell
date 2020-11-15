import { 
    QUEUE_RENDER,
    RENDER_STATE,
    RENDER_QUEUED,
    RENDER,
    IS_DIRTY,
    RENDERING,
    RENDER_PROMISE,
    RENDER_RESULT,
    RENDER_STATUS,
    RENDERING,
    KEY_DEPS,
    STORE,
    RESOLVE_COMPONENT,
    PARENT,
    GENERATE_ID,
    MOUNT,
    UNMOUNT,
    SET_CONTEXT,
    ATTRS,
    CONTENT,
    PROCESS_RENDER_RESULT,
} from "./component-symbols.js";

function difference(setA, setB) {
    if (Array.isArray(setB)) setB = new Set(setB);
    let newSet = new Set(setA)
    for (let elem of setB) {
        newSet.delete(elem)
    }
    return newSet
}

export const createComponentClass = ({
    RenderResult,
    Slot,
    ComponentRenderHandle,
    EventEmitter, 
    Error, 
    Store, 
    renderInterval=RENDER_INTERVAL
}) => class Component extends EventEmitter {

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
            .then((renderResult) => {
                if (this[IS_DIRTY]) {
                    return this[RENDER]()
                }
                this[RENDER_STATUS] = IDLE;
                this[RENDER_RESULT] = renderResult;
                this.trigger('render', {renderResult, component: this});
                return renderResult;
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

    [UNMOUNT]() {
        this[CLAIMED] = false;
    }

    [MOUNT]() {

    }

    static [GENERATE_ID]() {
        return Math.random().toString(36).substring(7)
    }

    [SET_CONTEXT]({parent, attrs, content}) {
        this[PARENT] = parent;
        this[ATTRS] = attrs;
        this[CONTENT] = content;
    }

    store() {
        return () => {}
    }

    [PROCESS_RENDER_RESULT](renderResult) {

    }

    constructor({parent=null, id, classId, attrs={}, content=null}={}) {
        super();
        this[STORE] = new Store(({ReactiveState, ComputedState}) => this.store({
            reactive: val => new ReactiveState(val),
            computed: func => new ComputedState(func)
        }));
        this[ID] = id || attrs.id || this.constructor[GENERATE_ID]();
        if (!this.constructor[ID]) this.constructor[ID] = classId || attrs.classId || this.constructor[GENERATE_ID]();
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
        var componentHandles = new Set();
        var isDirty = true;

        const onChildRender = ({renderResult, component}) => {
            // this[DOM].getElementByID(component[ID])
            this.trigger('childrender', {renderResult, component});
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
                    const newComponentHandles = new Set(newRenderResult.getChildComponentHandles(this));
                    renderResult = newRenderResult;
                    this[HTML] = `${renderResult}`;
                    this[PROCESS_RENDER_RESULT](newRenderResult);

                    difference(newComponentHandles, componentHandles)
                        .forEach(({component}) => {
                            component[MOUNT](newRenderResult);
                            component.on('render', onChildRender);
                        });

                    difference(componentHandles, newComponentHandles)
                        .forEach(({component}) => {
                            component[UNMOUNT](newRenderResult);
                            component.off('render', onChildRender);
                        });

                    componentHandles = newComponentHandles;
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