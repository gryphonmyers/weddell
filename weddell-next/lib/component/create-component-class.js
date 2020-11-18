export const QUEUE_RENDER = Symbol();
export const RENDER_STATE = Symbol();
export const RENDER_QUEUED = Symbol();
export const RENDER = Symbol();
export const IS_DIRTY = Symbol();
export const RENDERING = Symbol();
export const RENDER_PROMISE = Symbol();
export const RENDER_RESULT = Symbol();
export const KEY_DEPS = Symbol();
export const STORE = Symbol();
export const RESOLVE_COMPONENT = Symbol();
export const PARENT = Symbol();
export const GENERATE_ID = Symbol();
export const MOUNT = Symbol();
export const UNMOUNT = Symbol();
export const SET_CONTEXT = Symbol();
export const PROPS = Symbol();
export const RENDER_CONTEXT = Symbol();
export const CONTENT = Symbol();
export const PROCESS_RENDER_RESULT = Symbol();
export const DIRTY_STATE = Symbol();
export const ARTIFACT = Symbol();
export const ID = Symbol();
export const IDLE = Symbol();
export const CLAIMED = Symbol();
export const HTML = Symbol();
export const CHILD_COMPONENT_INSTANCES = Symbol();
export const ON_CHILD_RENDER_RESULTS_CHANGE = Symbol();
export const ON_RENDER_FINISH = Symbol();
export const SUBSCRIBERS_BY_COMPONENT = Symbol();
export const DEPTH = Symbol();

import createHtmlTemplateTag from "../create-html-template-tag.js";
import createComponentDirective from "../render-result/directives/create-component-directive.js";
import unescape from "../render-result/directives/unescape.js";
import { READ_ONLY, WRITABLE } from "../store/create-store-class.js";

const MAX_RERENDERS = 50;
/**
 * @typedef {Object} CreateComponentClassOptions
 * @property {import("../render-result/create-base-render-result-class").BaseRenderResult} RenderResult
 * @property {import("../observable/create-pushable-observable-class").PushableObservable} PushableObservable
 * @property {import("../store/create-store-class").BaseStoreClass} Store
 * @property {Error} Error
 */
/**
 * @typedef {ReturnType<createComponentClass>} BaseComponent
 */

export const createComponentClass = ({
    RenderResult,
    Error, 
    PushableObservable,
    Store
}) => {

    return class Component extends PushableObservable {



        // get [RENDER_CONTEXT]() {
        //     return {
        //         // slot: (name='default', defaultContent=null) => {
        //         //     if (name instanceof RenderResult) {
        //         //         defaultContent = name;
        //         //         name = 'default'
        //         //     }
        //         //     return new Slot({ name, defaultContent, component: this })
        //         // },
        //         unescape,
        //         component: (...args) => componentDirective(this[DEPTH], ...args),
        //         html: (...args) => htmlTemplateTag(this, ...args), 
        //         // @ts-ignore
        //         state: this[STORE]?.[READ_ONLY]
        //     }
        // }

        async [PROCESS_RENDER_RESULT]() {
            throw new Error('Not implemented');
        }

        async [RENDER]() {
            // @ts-ignore
            return this[RENDER_PROMISE] ||
                // @ts-ignore
                (this[RENDER_PROMISE] = new Promise(async resolve => {            
                    let renders = 0;
                    // @ts-ignore
                    await Promise.resolve();
                    // @ts-ignore
                    var renderResult,
                        mountedRenderResultsByComponent,
                        componentExpressionsByComponent;
                    

                    while (this[IS_DIRTY]) {
                        // @ts-ignore
                        this[IS_DIRTY] = false;

                        await Promise.resolve();

                        if (renders++ >= MAX_RERENDERS) {
                            throw new Error(`Render loop detected in component ${this.constructor.name}`);
                        }

                        // @ts-ignore
                        this[KEY_DEPS].clear();

                        // @ts-ignore
                        var sub = this[STORE]?.filter(evt => evt.eventName === 'get')
                            .subscribe({
                                // @ts-ignore
                                next: ({stateRef}) => this[KEY_DEPS].add(stateRef)
                            });
                        
                        // @ts-ignore
                        renderResult = this.constructor.template(this[RENDER_CONTEXT]);

                        sub?.unsubscribe();

                        // await this[ON_RENDER_RESULT_CHANGE](renderResult); 
                        
                        const prevSubscribersByComponent = this[SUBSCRIBERS_BY_COMPONENT];
                        this[SUBSCRIBERS_BY_COMPONENT] = new Map;

                        const toResolve = renderResult.componentExpressions
                            .map(async (exp, ii) =>
                                [ii, await this[RESOLVE_COMPONENT](exp), exp]
                            )
                        let resolved = new Set;
                        let renderPromisesByComponent = new Map;
                        componentExpressionsByComponent = new Map;

                        while (resolved.size < toResolve.length) {
                            const [ii, component, exp] = await Promise.race(toResolve.filter((v,ii) => !resolved.has(ii)));
                            
                            resolved.add(ii);
                            componentExpressionsByComponent.set(component, exp);
                            //Unsubscribe from change events for the duration of this render
                            prevSubscribersByComponent?.get(component)?.unsubscribe();

                            renderPromisesByComponent.set(component, component[RENDER]());                            
                        }

                        mountedRenderResultsByComponent = new Map(
                            await Promise.all(
                                Array.from(renderPromisesByComponent
                                    .entries())
                                    .map(async ([comp,prom]) => [comp, await prom])
                            )
                        )

                        mountedRenderResultsByComponent.forEach((result, comp) => {
                            this[SUBSCRIBERS_BY_COMPONENT].set(
                                comp, 
                                comp
                                    .filter(evt => evt.eventName === 'renderfinish')
                                    .subscribe({
                                        next({ renderResult: childRenderResult }) {
                                            mountedRenderResultsByComponent.set(comp, childRenderResult);
                                            this[ON_CHILD_RENDER_RESULTS_CHANGE](renderResult, mountedRenderResultsByComponent, componentExpressionsByComponent);
                                        }
                                    })
                            )
                        })

                        if (prevSubscribersByComponent && prevSubscribersByComponent.size !== this[SUBSCRIBERS_BY_COMPONENT].size) {
                            prevSubscribersByComponent.forEach((sub, comp) => {
                                if (!this[SUBSCRIBERS_BY_COMPONENT].has(comp)) {
                                    sub.unsubscribe();
                                }
                                comp[CLAIMED] = false; 
                            });
                        }
                    }

                    await this[ON_RENDER_FINISH](renderResult, mountedRenderResultsByComponent, componentExpressionsByComponent);

                    this.push({ eventName: 'renderfinish', renderResult })
                    
                    // @ts-ignore
                    this[RENDER_PROMISE] = null;

                    resolve(renderResult);
                }));
        }

        async [RESOLVE_COMPONENT]({ componentName, props, content, key }) {
            // @ts-ignore
            let ComponentClass = (this.constructor.components || {})[componentName];

            if (!ComponentClass) {
                // @ts-ignore
                return this[PARENT] 
                    // @ts-ignore
                    ? this[PARENT][RESOLVE_COMPONENT]({ componentName, props, content, key })
                    : null;
            }

            /* Support async component class factory functions */

            if (!(ComponentClass.prototype instanceof Component)) {
                ComponentClass = await ComponentClass(componentName);
            }

            // @ts-ignore
            let components = this[CHILD_COMPONENT_INSTANCES].get(ComponentClass);

            if (!components) {
                // @ts-ignore
                components = this[CHILD_COMPONENT_INSTANCES].set(ComponentClass, []).get(ComponentClass);
            }

            let component = key == null 
                // @ts-ignore
                ? components.find(comp => !comp[CLAIMED]) 
                : components[key];

            if (!component) {
                component = new ComponentClass({ props, content, parent: this})
            } else {
                component[SET_CONTEXT]({ props, content, parent: this})
            }

            // @ts-ignore
            if (component[CLAIMED]) throw new Error(ERR_COMPONENT_CLAIMED);

            // @ts-ignore
            component[CLAIMED] = true;

            return component;
        }

        static [GENERATE_ID]() {
            return Math.random().toString(36).substring(7)
        }

        [SET_CONTEXT]({parent, props, content}) {
            // @ts-ignore
            this[PARENT] = parent;
            // @ts-ignore
            this[PROPS] = props;
            // @ts-ignore
            this[CONTENT] = content;
        }

        set [IS_DIRTY] (val) {
            // @ts-ignore
            const wasDirty = this[DIRTY_STATE];
            // @ts-ignore
            this[DIRTY_STATE] = val;

            // @ts-ignore
            if (wasDirty !== val && val) {
                // @ts-ignore
                this[RENDER]();
            }
        }

        get [IS_DIRTY]() {
            // @ts-ignore
            return this[DIRTY_STATE];
        }

        get [DEPTH]() {
            return this[PARENT]
                ? this[PARENT][DEPTH] + 1
                : 0;
        }

        // @ts-ignore
        constructor({ parent=null, id, classId, props={}, content=null }={}) {
            super();

            const propRefs = new Set;
            // @ts-ignore
            this[STORE] = this.constructor.state
                ? new Store(
                    ({ReactiveState, ComputedState}) => 
                        // @ts-ignore
                        this.constructor.state({
                            reactive: val => new ReactiveState(val),
                            computed: func => new ComputedState(func),
                            prop: (defaultVal, validator) => {
                                const prop = new ReactiveState(defaultVal);
    
                                propRefs.add([prop, validator]);
                                
                                return prop;
                            }
                            //@TODO async state
                        })
                )
                : null;

            this[STORE]?.filter(evt => evt.eventName === 'valuechange' && this[KEY_DEPS].has(evt.stateRef))
                .subscribe({
                    // @ts-ignore
                    next: () => this[IS_DIRTY] = true
                });

           

            // @ts-ignore
            this[ID] = id || props.classId || this.constructor[GENERATE_ID]();
            // @ts-ignore
            this[DIRTY_STATE] = true;
            // @ts-ignore
            if (!this.constructor[ID]) this.constructor[ID] = classId || props.classId || this.constructor[GENERATE_ID]();

            // @ts-ignore
            this[RENDER_PROMISE] = null;
            this[SUBSCRIBERS_BY_COMPONENT] = new Map;
            // @ts-ignore
            this[CLAIMED] = false;
            // @ts-ignore
            this[CHILD_COMPONENT_INSTANCES] = new Map;
            // @ts-ignore
            this[SET_CONTEXT]({props, id, content, parent});

            // this[COMPONENT_DIRECTIVE] = 
            // @ts-ignore
            this[KEY_DEPS] = new Set;

            this[RENDER_CONTEXT] = {
                state: this[STORE]?.[READ_ONLY],
                unescape,
                component: createComponentDirective({  RenderResult, depth: this[DEPTH] }),
                html: createHtmlTemplateTag({ RenderResult, parent: this })
            }

            // return new Proxy(this, {
            //     get: (obj, key) => 
            //         obj[STORE] 
            //             ? key in obj[STORE]
            //                 ? obj[STORE][key]
            //                 : obj[key]
            //             : obj[key],
            //     set: (obj, key, val) =>

            // })
        }

        /**
         * Initializes the component and renders it.
         * 
         * @returns {Promise<void>}
         */

        init() {
            // @ts-ignore
            return this[RENDER]()
        }

        get renderPromise() {
            // @ts-ignore
            return this[RENDER_PROMISE];
        }

        get state() {
            // @ts-ignore
            return this[STORE]?.[WRITABLE];
        }
    }
}