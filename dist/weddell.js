'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var deepEqual = _interopDefault(require('fast-deep-equal'));
var events = require('events');
var h = _interopDefault(require('virtual-dom/h'));

var generateId = () => {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

var difference = (arr1, arr2) => arr1.filter(v => !arr2.includes(v));

const PROPS = Symbol('props');
const CONSTS = Symbol('consts');
const BIND_EVENT_HANDLERS = Symbol('bindEventHandlers');
const ASSIGN_PROPS = Symbol('assignProps');
const RENDER_STYLES = Symbol('renderStyles');
const INLINE_EVENT_HANDLERS = Symbol('inlineEventHandlers');
const BIND_TEMPLATE_FUNCTION = Symbol('bindTemplateFunction');
const RENDERERS = Symbol('renderers');
const RENDER_RESULTS = Symbol('renderResults');
const REQUEST_PATCH = Symbol('requestPatch');
const COMPONENT_CLASSES = Symbol('components');
const COMPONENT_INSTANCES = Symbol('componentInstances');
const GET_COMPONENT_INSTANCE = Symbol('getComponentInstance');
const MAKE_COMPONENT_INSTANCE = Symbol('makeComponentInstance');
const PREV_RENDERED_COMPONENTS = Symbol('prevRenderedComponents');
const MOUNT = Symbol('mount');
const UNMOUNT = Symbol('unmount');
const INIT = Symbol('init');
const ASSIGN_RESERVED_STORE_PROPERTIES = Symbol('assignReservedStoreProperties');

var createComponentClass = ({ EventEmitter, domAttributes, Store }) => class Component extends EventEmitter {
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
                        val.on('renderfinish', ({result}) => this.emit('renderfinish', {result}));
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
            .reduce((acc, input) => Object.assign(acc, {[input]: null}), {});

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
            });
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

        await component[INIT]();

        return component;
    }

    async [INIT]() {
        await this.onInit();
    }
};

const EVENT_PROXIES = Symbol('eventProxies');

var createEventEmitterClass = ({EventTarget, CustomEvent}) => {
    class EventObject extends CustomEvent {
        constructor(evtName, evtObj) {
            super(evtName, evtObj);
            this.eventName = this.type;
            Object.assign(this, evtObj.detail || null);
        }
    }
    
    class EventEmitter extends EventTarget {
        constructor() {
            super(...arguments);
            this[EVENT_PROXIES] = [];
        }
        once(evtName, callback) {
            this.on(evtName, () => this.off(evtName, callback));
            return this.on(evtName, callback);
        }
        
        dispatchEvent(evtName, detail) {
            var res = super.dispatchEvent(new EventObject(evtName, {detail}));
            this[EVENT_PROXIES].forEach(proxy => proxy.dispatchEvent(evtName, {detail}));
            return res;
        }

        proxyEvents(emitter) {
            this[EVENT_PROXIES].push(emitter);
        }
    }
    var p = EventEmitter.prototype;
    [['dispatchEvent',['trigger', 'emit']], ['removeEventListener',['off', 'removeListener']], ['addEventListener', ['on', 'addListener']]]
        .forEach(([k, als]) => als.forEach(al => p[al] = p[k]));

    return EventEmitter;
};

var createAppClass = ({EventEmitter}) => class Renderer extends EventEmitter {
    request(request) {
        this.renderRequests.push(request);
        if (!this.renderPromise) {
            this.renderPromise = this.queueRender();
        }
        return this.renderPromise;
    }

    queueRender(rerenders=0) {
        if (rerenders > 100) throw new Error('Too many rerenders');

        return new Promise(resolve => setTimeout(async () => {
            var result;
            result = await this.render(this.renderRequests.splice(0, this.renderRequests.length));
            result = (this.onRender ? await this.onRender(result) : result);
            if (this.renderRequests.length > 0) {
                result = await this.queueRender(rerenders + 1);
            }
            this.renderPromise = null;
            this.emit('renderfinish', {result});
            resolve(this.lastResult = result);
        }, this.renderInterval));
    }

    render() {}

    constructor({
        onRender,
        renderInterval=0
    }={}) {
        super(...arguments);
        Object.defineProperties(this, {
            onRender: { value: onRender },
            renderInterval: {value: renderInterval},
            renderPromise: {value: null, writable: true },
            renderRequests: { value: [] },
            lastResult: { value: null, writable: true }
        });
    }
};

const CHANGED_KEYS = Symbol('changedKeys');
const FUNC_KEY_DEPS = Symbol('keyDeps');
const FUNC_KEYS_BY_DEP_KEY = Symbol('funcKeysByDepKey');
const EXECUTE_FUNCTION_PROPERTY = Symbol('executeFunctionProperty');
const FUNC_KEY_VALUES = Symbol('funcKeyValues');
const STALE_FUNC_KEYS = Symbol('staleFuncKeys');

function isSerializable(val) {
    return val && typeof val === 'object' ?
        (Array.isArray(val) || val.constructor === Object || Object.getPrototypeOf(val) === null) && Object.values(val).every(isSerializable) :
        (val == null || typeof val === 'string' || typeof val === 'boolean' || typeof val === 'number');
}

var createStoreClass = ({EventEmitter}) => class Store extends EventEmitter {
    constructor(data, {
        shouldExecFuncs=true, 
        shouldMonitorChanges=true, 
        shouldEnforceSerializable=true, 
        immutable=false,
        fallbacks=[],
        overrides=[]
    }={}) {
        super();

        [...overrides, ...fallbacks]
            .forEach(store => {
                Object.assign(this, 
                    Object.keys(store)
                        .reduce((acc, curr) => 
                            Object.assign(acc, {[curr]: null})
                        , {})
                );
                store.proxyEvents(this);
            });
        
        Object.assign(this, data);

        [
            FUNC_KEYS_BY_DEP_KEY, 
            STALE_FUNC_KEYS, 
            FUNC_KEY_VALUES, 
            FUNC_KEY_DEPS
        ].forEach(key => this[key] = {});

        this[CHANGED_KEYS] = [];

        Object.defineProperty(this, 'proxy', {
            value: new Proxy(this, {
                get: (obj, key) => {
                    if (!obj.propertyIsEnumerable(key)) {
                        return obj[key];
                    }
    
                    var value = [...overrides, obj, ...fallbacks]
                        .reduce((acc, curr) => {
                            return acc != null ? 
                                acc :
                                (shouldExecFuncs ? curr[EXECUTE_FUNCTION_PROPERTY](curr[key], key) : curr[key])
                        }, null);

                    this.emit('get', {key, value});
    
                    return value;
                },
                set: (obj, key, newValue) => {
                    if (!obj.propertyIsEnumerable(key)) {
                        obj[key] = newValue;
                        return true;
                    }
                    if (immutable) {
                        throw new Error(`Can't set key ${key}, as store is immutable.`);
                    }
                    if (shouldEnforceSerializable && !isSerializable(newValue)) {
                        throw new Error(`Value being set to ${key} is not serializable`);
                    }
                    const oldValue = obj[key];
                    
                    if (shouldMonitorChanges && !deepEqual(newValue, oldValue)) {
                        this[CHANGED_KEYS].push(key);
                        if (shouldExecFuncs && this[FUNC_KEYS_BY_DEP_KEY][key]) {
                            for (var funcKey in this[FUNC_KEYS_BY_DEP_KEY][key]) {
                                this[STALE_FUNC_KEYS][funcKey] = 1;
                            }
                        }
                        this.emit('change', {
                            target: this, 
                            changedKey: key,
                            newValue,
                            oldValue
                        });
                    }
    
                    obj[key] = newValue;
                    return true;
                }
            })
        });
        Object.seal(this);
        return this.proxy;
    }

    [EXECUTE_FUNCTION_PROPERTY](value, funcKey) {
        if (typeof value !== 'function') {
            return value;
        }

        if (!(funcKey in this[FUNC_KEY_VALUES]) || funcKey in this[STALE_FUNC_KEYS]) {
            const accKeys = {};

            for (var depKey in this[FUNC_KEY_DEPS][funcKey] || {}) {
                if (depKey in this[FUNC_KEYS_BY_DEP_KEY]) {
                    delete this[FUNC_KEYS_BY_DEP_KEY][depKey][funcKey];
                }
            }
            var onGet = ({key}) => {
                accKeys[key] = 1;
                if (!(key in this[FUNC_KEYS_BY_DEP_KEY])) this[FUNC_KEYS_BY_DEP_KEY][key] = {};
                this[FUNC_KEYS_BY_DEP_KEY][key][funcKey] = 1;
            };
            this.on('get', onGet);
            value = value.call(this.proxy);
            this.off('get', onGet);

            this[FUNC_KEY_DEPS][funcKey] = accKeys;
            
            delete this[STALE_FUNC_KEYS][funcKey];

            return this[FUNC_KEY_VALUES][funcKey] = value;
        }
        
        return this[FUNC_KEY_VALUES][funcKey];
    }
};

const weddell = {};

const INSTALLED_PLUGINS = Symbol('installedPlugins');

// private properties
Object.defineProperties(weddell, { 
    cache: { value: {} }, 
    [INSTALLED_PLUGINS]: { value: new Map() }
});

// other public properties
Object.assign(weddell, {
    createComponentClass,
    createEventEmitterClass,
    createRendererClass: createAppClass,
    createAppClass,
    createStoreClass,
    EventTarget: null,
    CustomEvent: null,
    domAttributes: null,
    setLazyProperty(key, func) {
        Object.defineProperty(this, key, { 
            get: function(){
                return this.cache[key] || (this.cache[key] = func.call(this))
            }
        });
    },
    use: function() {
        var plugins = Array.from(arguments).flat();

        plugins.forEach(plugin => {
            if (this[INSTALLED_PLUGINS].has(plugin)) {
                return;
            }
    
            plugin(this);
    
            for (var prop in this.cache) {
                delete this.cache[prop];
            }
    
            this[INSTALLED_PLUGINS].set(plugin);
        });        

        return this;
    }
});

// class getters (public)
var handlers = [
    ['EventEmitter',function() {
        const { EventTarget, CustomEvent } = this;
        return this.createEventEmitterClass({ EventTarget, CustomEvent });
    }], 
    ['Store', function() {
        const { EventEmitter } = this;
        return this.createStoreClass({ EventEmitter });
    }], 
    ['Component', function() {
        const { EventEmitter, Store, domAttributes, Renderer } = this;
        return this.createComponentClass({ EventEmitter, Store, domAttributes, Renderer });
    }],
    ['Renderer', function() {
        const { EventEmitter } = this;
        return this.createRendererClass({ EventEmitter });
    }],
    ['App', function() {
        const { EventEmitter, Renderer } = this;
        return this.createAppClass({ EventEmitter, Renderer });
    }]
];
handlers.forEach(([k,v]) => {
    weddell.setLazyProperty(k, v);
});

class EventTarget extends events.EventEmitter {
    get addEventListener() { return super.addListener }
    get removeEventListener() { return super.removeListener }
    dispatchEvent(evtObj) {
        return super.emit(evtObj.type, evtObj.detail);
    }
    constructor() {
        super(...arguments);
        Object.defineProperties(this, {
            _maxListeners: { enumerable: false },
            _eventsCount: { enumerable: false },
            _events: { enumerable: false },
            domain: { enumerable: false }
        });
    }
}

class CustomEvent {
    constructor(evtName, evtObj) {
        this.type = evtName;
        this.detail = evtObj.detail;
    }
}

var oncopy = 1;
var oncut = 1;
var onpaste = 1;
var onabort = 1;
var onblur = 1;
var oncancel = 1;
var oncanplay = 1;
var oncanplaythrough = 1;
var onchange = 1;
var onclick = 1;
var onclose = 1;
var oncontextmenu = 1;
var oncuechange = 1;
var ondblclick = 1;
var ondrag = 1;
var ondragend = 1;
var ondragenter = 1;
var ondragleave = 1;
var ondragover = 1;
var ondragstart = 1;
var ondrop = 1;
var ondurationchange = 1;
var onemptied = 1;
var onended = 1;
var onerror = 1;
var onfocus = 1;
var oninput = 1;
var oninvalid = 1;
var onkeydown = 1;
var onkeypress = 1;
var onkeyup = 1;
var onload = 1;
var onloadeddata = 1;
var onloadedmetadata = 1;
var onloadstart = 1;
var onmousedown = 1;
var onmouseenter = 1;
var onmouseleave = 1;
var onmousemove = 1;
var onmouseout = 1;
var onmouseover = 1;
var onmouseup = 1;
var onmousewheel = 1;
var onpause = 1;
var onplay = 1;
var onplaying = 1;
var onprogress = 1;
var onratechange = 1;
var onreset = 1;
var onresize = 1;
var onscroll = 1;
var onseeked = 1;
var onseeking = 1;
var onselect = 1;
var onstalled = 1;
var onsubmit = 1;
var onsuspend = 1;
var ontimeupdate = 1;
var ontoggle = 1;
var onvolumechange = 1;
var onwaiting = 1;
var onwheel = 1;
var onauxclick = 1;
var ongotpointercapture = 1;
var onlostpointercapture = 1;
var onpointerdown = 1;
var onpointermove = 1;
var onpointerup = 1;
var onpointercancel = 1;
var onpointerover = 1;
var onpointerout = 1;
var onpointerenter = 1;
var onpointerleave = 1;
var onselectstart = 1;
var onselectionchange = 1;
var domAttributes = {
	oncopy: oncopy,
	oncut: oncut,
	onpaste: onpaste,
	onabort: onabort,
	onblur: onblur,
	oncancel: oncancel,
	oncanplay: oncanplay,
	oncanplaythrough: oncanplaythrough,
	onchange: onchange,
	onclick: onclick,
	onclose: onclose,
	oncontextmenu: oncontextmenu,
	oncuechange: oncuechange,
	ondblclick: ondblclick,
	ondrag: ondrag,
	ondragend: ondragend,
	ondragenter: ondragenter,
	ondragleave: ondragleave,
	ondragover: ondragover,
	ondragstart: ondragstart,
	ondrop: ondrop,
	ondurationchange: ondurationchange,
	onemptied: onemptied,
	onended: onended,
	onerror: onerror,
	onfocus: onfocus,
	oninput: oninput,
	oninvalid: oninvalid,
	onkeydown: onkeydown,
	onkeypress: onkeypress,
	onkeyup: onkeyup,
	onload: onload,
	onloadeddata: onloadeddata,
	onloadedmetadata: onloadedmetadata,
	onloadstart: onloadstart,
	onmousedown: onmousedown,
	onmouseenter: onmouseenter,
	onmouseleave: onmouseleave,
	onmousemove: onmousemove,
	onmouseout: onmouseout,
	onmouseover: onmouseover,
	onmouseup: onmouseup,
	onmousewheel: onmousewheel,
	onpause: onpause,
	onplay: onplay,
	onplaying: onplaying,
	onprogress: onprogress,
	onratechange: onratechange,
	onreset: onreset,
	onresize: onresize,
	onscroll: onscroll,
	onseeked: onseeked,
	onseeking: onseeking,
	onselect: onselect,
	onstalled: onstalled,
	onsubmit: onsubmit,
	onsuspend: onsuspend,
	ontimeupdate: ontimeupdate,
	ontoggle: ontoggle,
	onvolumechange: onvolumechange,
	onwaiting: onwaiting,
	onwheel: onwheel,
	onauxclick: onauxclick,
	ongotpointercapture: ongotpointercapture,
	onlostpointercapture: onlostpointercapture,
	onpointerdown: onpointerdown,
	onpointermove: onpointermove,
	onpointerup: onpointerup,
	onpointercancel: onpointercancel,
	onpointerover: onpointerover,
	onpointerout: onpointerout,
	onpointerenter: onpointerenter,
	onpointerleave: onpointerleave,
	onselectstart: onselectstart,
	onselectionchange: onselectionchange
};

function node(weddell) {
    Object.assign(weddell, { EventTarget, CustomEvent, domAttributes });
}

class VdomWidget {
    constructor({tagName, properties={}, children=[], component=null}) {
        this.type = 'Widget';
        this.properties = properties;
        this.children = children;
        this.vdomKey = properties.key || 
            (properties.attributes && 
                (properties.attributes['data-component-key'] ||
                properties.attributes.id)
            );
        this.tagName = tagName;
        this.timestamp = Date.now();
        this.component = component;
    }

    refresh() {
        const {tagName, properties, children, component } = this;
        return new (this.constructor)({tagName, properties, children, component });
    }

    ['setComponent'](component) {
        return this.component = component;
    }

    update() {

    }

    destroy() {

    }

    init() {

    }

    render() {
        return this.component[RENDER_RESULTS].vdom.output;
    }
}

const WIDGET = Symbol('widget');

var createVdomRendererClass = ({Renderer}) => class VdomRenderer extends Renderer {

    constructor({ template, getComponentClass, getComponentInstance, getContent }={}) {
        super(...arguments);
        this.getComponentClass = getComponentClass;
        this.getComponentInstance = getComponentInstance;
        this.getContent = getContent;
        this.template = template;
    }

    h(renderedWidgets, tagName, properties={}, children=[]) {
        if (Array.isArray(properties)) {
            children = properties;
            properties = {};
        }
        
        tagName = tagName.toLowerCase();

        if (this.getComponentClass(tagName)) {
            const widget = new VdomWidget({ tagName, properties, children });
            renderedWidgets.push(widget);
            return widget;
        } else if (tagName === 'content') {
            return this.getContent();
        }
        
        return h(tagName, properties, new Proxy(children.flat(), { 
            get: (obj, key) => {
                if (obj[key] instanceof VdomWidget) {
                    return obj[key].component ? obj[key].component[WIDGET] : obj[key];
                }
                return obj[key];
            }
        }));
    }

    async render([locals]) {
        const renderedWidgets = [];

        const markup = this.template(locals, this.h.bind(this, renderedWidgets));

        const renderedComponents = await Promise.all(
            renderedWidgets
                .map(async widget => {
                    const component = await this.getComponentInstance({instanceKey: widget.vdomKey, tagName: widget.tagName});

                    component[WIDGET] = widget;
                    widget.setComponent(component);

                    const propsDirty = await component[ASSIGN_PROPS](widget.properties.attributes);
                    const childrenDirty = component.setChildren(widget.children);

                    if (!component[RENDER_RESULTS].vdom || propsDirty || childrenDirty) {
                        await component[RENDERERS].vdom.request(component.state);
                    }

                    return component;
                })
        );

        return { renderedComponents, markup };
    }
};

function vdom(weddell) {
    const { createComponentClass } = weddell;

    Object.assign(weddell, { 
        createComponentClass: function () {
            return class extends createComponentClass(...arguments) {

                constructor() {
                    super(...arguments);
                    
                    var widget = null;
                    Object.defineProperties(this, {
                        [WIDGET]: {
                            get: () => widget && widget.timestamp < this[RENDER_RESULTS].vdom.timestamp ? (widget = widget.refresh()) : widget, 
                            set: (val) => widget = val
                        },
                    });
                    this[RENDERERS].vdom = new weddell.VdomRenderer({
                        template: this[BIND_TEMPLATE_FUNCTION]('vdom', this.constructor.markup),
                        getComponentInstance: this[GET_COMPONENT_INSTANCE].bind(this),
                        getComponentClass: (name) => {
                            return this[COMPONENT_CLASSES][name];
                        },
                        onRender: async ({renderedComponents, markup}) => {
                            await this.triggerComponentMounts(renderedComponents);
                            await this.onRenderMarkup();
                            return markup;
                        },
                        getContent: () => this.content
                    });
                }
            }
        },
        createVdomRendererClass
    });
    weddell.setLazyProperty('VdomRenderer', function () {
        const { Renderer } = this;
        return this.createVdomRendererClass({ Renderer });
    });
}

weddell.use(node, vdom);

module.exports = weddell;
