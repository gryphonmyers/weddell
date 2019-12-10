import generateId from './generate-id';
import difference from './difference';

import {
    PROPS,
    CONSTS,
    BIND_EVENT_HANDLERS,
    RENDERERS,
    ASSIGN_PROPS,
    REQUEST_PATCH,
    INLINE_EVENT_HANDLERS,
    RENDER_STYLES,
    RENDER_RESULTS,
    COMPONENT_CLASSES,
    COMPONENT_INSTANCES,
    GET_COMPONENT_INSTANCE,
    BIND_TEMPLATE_FUNCTION,
    MAKE_COMPONENT_INSTANCE,
    PREV_RENDERED_COMPONENTS,
    MOUNT,
    UNMOUNT,
    INIT,
    ASSIGN_RESERVED_STORE_PROPERTIES
} from './symbols/component';

export default ({ EventEmitter, domAttributes, Store }) => class Component extends EventEmitter {
    static get state() { return {}; }
    static get inputs() { return []; }
    static get consts() { return {}; }
    static get components() { return {}; }
    static get inputs() { return []; }

    async onRenderMarkup() {}
    async onInit() {}

    async awaitRender() {
        return Promise.all(
            Object.values(this[RENDERERS]).map(renderer => renderer.renderPromise)
        );
    }

    constructor({
        parent=null,
        state={},
        consts={},
        id=generateId(),
        components={}
    }={}) {
        super();

        const componentClasses = Object.assign({}, parent ? parent[COMPONENT_CLASSES] : null, components, this.constructor.components);

        Object.defineProperties(this, {
            id: { value: id },
            content: { value: [], writable: true },
            [INLINE_EVENT_HANDLERS]: { value: {} },
            [RENDER_RESULTS]: { value: {} },
            [PREV_RENDERED_COMPONENTS]: { value: new Map, writable: true },
            [COMPONENT_CLASSES]: { value: componentClasses },
            [COMPONENT_INSTANCES]: {
                value: Object.assign({}, 
                    parent ? parent[COMPONENT_INSTANCES] : null,
                    Object.keys(this.constructor.components)
                        .reduce((acc, key) => Object.assign(acc, { [key]: {} }), {})
                )
            },
            [RENDERERS]: { 
                value: new Proxy({}, {
                    get: (obj, key) => obj[key],
                    set: (obj, key, val) => {
                        val.on('renderfinish', ({result}) => this.emit('renderfinish', {rendererName: key, result}));
                        obj[key] = val;
                        return true;
                    }
                }) 
            },
            [ASSIGN_PROPS]: {
                value: (obj) => {
                    var didChange = false;
                    if (obj) {
                        const [ props, handlers, attrs ] = Object.entries(obj)
                            .reduce((acc, [key, val]) => {
                                (this.constructor.inputs.some(input => input === key || input.key === key) ?
                                    acc[0] :
                                    key.slice(0, 2) === 'on' && !(key in domAttributes) ?
                                        acc[1] :
                                        acc[2]
                                )[key] = val;
                                return acc;
                            }, [
                                this.constructor.inputs
                                    .reduce((acc, key) => 
                                        !(key in obj) ? 
                                            Object.assign(acc, {[key]: null}) : 
                                            acc
                                    , {}), {}, {}
                            ]);
                            
                        var onChange = () => didChange = true;
                        this[PROPS].on('change', onChange);
                        Object.assign(this[PROPS], props);
                        this[PROPS].off('change', onChange);
    
                        this[BIND_EVENT_HANDLERS](handlers, parent);
                        this.state.$attributes = Object.entries(attrs)
                            .filter(([key]) => typeof key === 'string')
                            .reduce((acc, [key, val]) => Object.assign(acc, {[key]: val}), {});
                    }
                    return didChange;
                }
            }
        });

        state = Object.assign({}, state, this.constructor.state);
        consts = Object.assign({}, consts, this.constructor.consts);
        const props = Object.values(this.constructor.inputs)
            .reduce((acc, input) => Object.assign(acc, {[input]: null}), {})

        const stores = [state, consts, props];
        stores.forEach(store => {
            for (var prop in store) {
                if (prop[0] === '$') throw new Error(`Component state keys may not start with the '$' character: "${prop}"`);
            }
        });

        this[ASSIGN_RESERVED_STORE_PROPERTIES]({consts, state, props});

        this.state = new Store(state, {
            overrides: [ this[PROPS] = new Store(props) ], 
            fallbacks: [ this[CONSTS] = new Store(consts, { immutable: true, shouldExecFuncs: false }) ] 
        });

        this.state.on('change', ({changedKey}) => {
            for (var rendererName in this[RENDER_RESULTS]) {
                const { accessedKeys } = this[RENDER_RESULTS][rendererName];
                if (changedKey in accessedKeys) {
                    this[RENDERERS][rendererName].request(this.state);
                }                
            }
        });
    }

    [ASSIGN_RESERVED_STORE_PROPERTIES]({consts, state}) {
        Object.assign(consts, { $id: this.id });
        Object.assign(state, { $attributes: {} }); //@TODO protect this from being written to by implementing apps
    }

    [REQUEST_PATCH](rendererName, result) {
        this.emit('requestpatch', {rendererName, result});
    }

    async [RENDER_STYLES]() {
        const styleBlocks = [].concat(this.constructor.styles).flat();
        return [
                ...styleBlocks
                    .filter(style => typeof style === 'string')
            ]
            .concat(
                this[EXEC_TEMPLATE_FUNCTION](RENDER_STYLES, 
                    styleBlocks
                        .filter(style => typeof style === 'function')
                )
            )
    }
    
    [BIND_TEMPLATE_FUNCTION](rendererName, func) {
        return function () {
            const timestamp = Date.now();
            const accessedKeys = {};
            const onGet = ({key}) => accessedKeys[key] = 1;
            this.state.on('get', onGet);
            const output = func(...arguments);
            this.state.off('get', onGet);

            this[RENDER_RESULTS][rendererName] = {
                accessedKeys,
                output,
                timestamp
            };

            return output;
        }.bind(this)
    }

    async triggerComponentMounts(renderedComponents) {
        const prevRenderedComponents = Array.from(this[PREV_RENDERED_COMPONENTS].keys());
        const mountedComponents = difference(renderedComponents, prevRenderedComponents);
        const unmountedComponents = difference(prevRenderedComponents, renderedComponents);
        
        await Promise.all(
            mountedComponents
                .map(comp => comp[MOUNT]()),
            unmountedComponents
                .map(comp => comp[UNMOUNT]())
        );
        
        this[PREV_RENDERED_COMPONENTS] = new Map(renderedComponents.map(comp => [comp, null]));
        
        return {mountedComponents, unmountedComponents};
    }

    bindEvent(funcText, opts = {}) {
        var consts = this.constructor.Weddell.consts;
        return `${opts.preventDefault ? `event.preventDefault();` : ''}${opts.stopPropagation ? `event.stopPropagation();` : ''}Promise.resolve((window['${consts.VAR_NAME}'] && window['${consts.VAR_NAME}'].app) || new Promise(function(resolve){ window.addEventListener('weddellinitbefore', function(evt) { resolve(evt.detail.app) }) })).then(function(app) { app.awaitComponentMount('${this.id}').then(function(component){ (function() {${funcText}}.bind(component))()})})`;
    }


    /**
     * @private
     */

    [BIND_EVENT_HANDLERS](handlersObj, scope) {
        Object.entries(handlersObj)
            .forEach(([key, string]) => {
                const evtName = key.slice(2);
                const currHandlers = this[INLINE_EVENT_HANDLERS];
                if ((key in currHandlers)) {
                    if (currHandlers[key].string === string) {
                        return;
                    } else {
                        this.off(evtName, currHandlers[key].func);
                        delete currHandlers[key];
                    }
                }

                const func = new Function('component', 'event', string).bind(scope, this);

                this[INLINE_EVENT_HANDLERS][key] = { string, func };

                this.on(evtName, func);
            })
    }

    async [MOUNT]() {
        // this[REQUEST_PATCH](RENDER_STYLES, )
    }

    async [UNMOUNT]() {

    }

    async [GET_COMPONENT_INSTANCE]({tagName, instanceKey}) {
        const instances = this[COMPONENT_INSTANCES][tagName];
        const key = instanceKey || instances.length;
        
        return instances[key] || (instances[key] = (await this[MAKE_COMPONENT_INSTANCE]({tagName}))); 
    }

    async setChildren(children) {
        const didChange =  this.content.length !== children.length || 
            this.content.some((comp, ii) => comp !== children[ii]);

        this.content = children;
        return didChange;
    }

   
    // if (!component[RENDER_RESULTS][RENDER_STYLES]) {
    //     await component[RENDER_STYLES]()
    // }
    // if (!this[PREV_RENDERED_COMPONENTS].has(component)) {
    //     await component[MOUNT]()
    // }

    async [MAKE_COMPONENT_INSTANCE]({tagName}) {
        const ComponentClass = this[COMPONENT_CLASSES][tagName];
        const component = new ComponentClass({parent: this});

        this.emit('createcomponent', { component, ComponentClass });
        component.on('createcommponent', ({component, ComponentClass}) => 
            this.emit('createcomponent', {component, ComponentClass}));        

        await component[INIT]();

        return component;
    }

    async [INIT]() {
        await this.onInit();
    }
}