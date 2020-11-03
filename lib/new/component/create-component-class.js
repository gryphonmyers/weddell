export const QUEUE_RENDER = Symbol();
export const RENDER_STATE = Symbol();
export const RENDER_QUEUED = Symbol();
export const RENDER = Symbol();
export const IS_DIRTY = Symbol();
export const RENDERING = Symbol();
export const RENDER_PROMISE = Symbol();
export const RENDER_RESULT = Symbol();
export const RENDER_STATUS = Symbol();
export const KEY_DEPS = Symbol();
export const STORE = Symbol();
export const RESOLVE_COMPONENT = Symbol();
export const PARENT = Symbol();
export const GENERATE_ID = Symbol();
export const MOUNT = Symbol();
export const UNMOUNT = Symbol();
export const SET_CONTEXT = Symbol();
export const ATTRS = Symbol();
export const RENDER_CONTEXT = Symbol();
export const CONTENT = Symbol();
export const PROCESS_RENDER_RESULT = Symbol();

import createHtmlTemplateTag from "../create-html-template-tag.js";
import createComponentDirective from "../render-result/directives/create-component-directive";
import unescape from "../render-result/directives/unescape";

function difference(setA, setB) {
    if (Array.isArray(setB)) setB = new Set(setB);
    let newSet = new Set(setA)
    for (let elem of setB) {
        newSet.delete(elem)
    }
    return newSet
}

/**
 * @typedef {ReturnType<createComponentClass>} BaseComponent
 */

export const createComponentClass = ({
    RenderResult,
    Slot,
    ComponentRenderHandle,
    EventEmitter, 
    Error, 
    Store
}) => {
    
    
    // const componentDirective = ?

    return class Component extends EventEmitter {

        // [QUEUE_RENDER]() {
        //     if (this[RENDER_STATE] !== RENDER_QUEUED) {
        //         this[RENDER_STATE] = RENDER_QUEUED;
        //         setTimeout(() => {
        //             this[RENDER]()
        //         }, renderInterval);
        //     }
        // }

        get [RENDER_CONTEXT]() {
            return {
                // slot: (name='default', defaultContent=null) => {
                //     if (name instanceof RenderResult) {
                //         defaultContent = name;
                //         name = 'default'
                //     }
                //     return new Slot({ name, defaultContent, component: this })
                // },
                unescape,
                component: this.componentDirective,
                html: createHtmlTemplateTag({ RenderResult, parent: this }), 
                state: this[STORE].readOnly
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

            const result = this.template(this[RENDER_CONTEXT]);

            this[STORE].internal.off('getstate', onGetState);

            // const patch = result.diff(this[RENDER_RESULT]);

            // result.patchArtifact(this[RENDER_ARTIFACT], patch);


            const artifact = (await result.renderComponentArtifacts())
                .reduce((acc, [expression, artifact]) =>
                    result.constructor.patchRenderArtifact(acc, expression, artifact)
                , result.childRenderResults.reduce((acc, curr) =>
                    result.constructor.patchRenderArtifact(acc, curr, curr.toArtifact())
                , result.toArtifact()));


            const componentsByExpression = new Map(await Promise.all(
                result.componentExpressions
                    // .map(async createComponentDirective({RenderResult});
                    // })
            ));

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

        async [RESOLVE_COMPONENT]({ componentName, attrs, content, key }) {
            let ComponentClass = (this.constructor.components || {})[componentName];

            if (!ComponentClass) {
                return this[PARENT] 
                    ? this[PARENT][RESOLVE_COMPONENT]({ componentName, attrs, content, key })
                    : null;
            }

            /* Support async component class factory functions */

            if (!(ComponentClass.prototype instanceof Component)) {
                ComponentClass = await ComponentClass(componentName);
            }

            let components = this[CHILD_COMPONENT_INSTANCES].get(ComponentClass);

            if (!components) {
                components = this[CHILD_COMPONENT_INSTANCES].set(ComponentClass, []).get(ComponentClass);
            }

            let component = key == null 
                ? components.find(comp => !comp[CLAIMED]) 
                : components[key];

            if (!component) {
                component = new ComponentClass({ attrs, content, parent: this})
            } else {
                component[SET_CONTEXT]({ attrs, content, parent: this})
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
            this[STORE] = new Store(
                ({ReactiveState, ComputedState}) => 
                    this.store({
                        reactive: val => new ReactiveState(val),
                        computed: func => new ComputedState(func)
                    })
            );

            this.componentDirective = createComponentDirective({ 
                RenderResult, 
                parentComponent: this
            });

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
}