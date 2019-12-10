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

var isArray = Array.isArray;
var keyList = Object.keys;
var hasProp = Object.prototype.hasOwnProperty;

var fastDeepEqual = function equal(a, b) {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    var arrA = isArray(a)
      , arrB = isArray(b)
      , i
      , length
      , key;

    if (arrA && arrB) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (!equal(a[i], b[i])) return false;
      return true;
    }

    if (arrA != arrB) return false;

    var dateA = a instanceof Date
      , dateB = b instanceof Date;
    if (dateA != dateB) return false;
    if (dateA && dateB) return a.getTime() == b.getTime();

    var regexpA = a instanceof RegExp
      , regexpB = b instanceof RegExp;
    if (regexpA != regexpB) return false;
    if (regexpA && regexpB) return a.toString() == b.toString();

    var keys = keyList(a);
    length = keys.length;

    if (length !== keyList(b).length)
      return false;

    for (i = length; i-- !== 0;)
      if (!hasProp.call(b, keys[i])) return false;

    for (i = length; i-- !== 0;) {
      key = keys[i];
      if (!equal(a[key], b[key])) return false;
    }

    return true;
  }

  return a!==a && b!==b;
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
                    
                    if (shouldMonitorChanges && !fastDeepEqual(newValue, oldValue)) {
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

function dom(weddell) {
    Object.assign(weddell, { 
        EventTarget: window.EventTarget, 
        CustomEvent: window.CustomEvent, 
        domAttributes: document 
    });
}

var nativeIsArray = Array.isArray;
var toString = Object.prototype.toString;

var xIsArray = nativeIsArray || isArray$1;

function isArray$1(obj) {
    return toString.call(obj) === "[object Array]"
}

var version = "2";

var isVnode = isVirtualNode;

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version
}

var isWidget_1 = isWidget;

function isWidget(w) {
    return w && w.type === "Widget"
}

var isThunk_1 = isThunk;

function isThunk(t) {
    return t && t.type === "Thunk"
}

var isVhook = isHook;

function isHook(hook) {
    return hook &&
      (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") ||
       typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"))
}

var vnode = VirtualNode;

var noProperties = {};
var noChildren = [];

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName;
    this.properties = properties || noProperties;
    this.children = children || noChildren;
    this.key = key != null ? String(key) : undefined;
    this.namespace = (typeof namespace === "string") ? namespace : null;

    var count = (children && children.length) || 0;
    var descendants = 0;
    var hasWidgets = false;
    var hasThunks = false;
    var descendantHooks = false;
    var hooks;

    for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            var property = properties[propName];
            if (isVhook(property) && property.unhook) {
                if (!hooks) {
                    hooks = {};
                }

                hooks[propName] = property;
            }
        }
    }

    for (var i = 0; i < count; i++) {
        var child = children[i];
        if (isVnode(child)) {
            descendants += child.count || 0;

            if (!hasWidgets && child.hasWidgets) {
                hasWidgets = true;
            }

            if (!hasThunks && child.hasThunks) {
                hasThunks = true;
            }

            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                descendantHooks = true;
            }
        } else if (!hasWidgets && isWidget_1(child)) {
            if (typeof child.destroy === "function") {
                hasWidgets = true;
            }
        } else if (!hasThunks && isThunk_1(child)) {
            hasThunks = true;
        }
    }

    this.count = count + descendants;
    this.hasWidgets = hasWidgets;
    this.hasThunks = hasThunks;
    this.hooks = hooks;
    this.descendantHooks = descendantHooks;
}

VirtualNode.prototype.version = version;
VirtualNode.prototype.type = "VirtualNode";

var vtext = VirtualText;

function VirtualText(text) {
    this.text = String(text);
}

VirtualText.prototype.version = version;
VirtualText.prototype.type = "VirtualText";

var isVtext = isVirtualText;

function isVirtualText(x) {
    return x && x.type === "VirtualText" && x.version === version
}

/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * ECMAScript compliant, uniform cross-browser split method
 */

/**
 * Splits a string into an array of strings using a regex or string separator. Matches of the
 * separator are not included in the result array. However, if `separator` is a regex that contains
 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
 * cross-browser.
 * @param {String} str String to split.
 * @param {RegExp|String} separator Regex or string to use for separating the string.
 * @param {Number} [limit] Maximum number of items to include in the result array.
 * @returns {Array} Array of substrings.
 * @example
 *
 * // Basic use
 * split('a b c d', ' ');
 * // -> ['a', 'b', 'c', 'd']
 *
 * // With limit
 * split('a b c d', ' ', 2);
 * // -> ['a', 'b']
 *
 * // Backreferences in result array
 * split('..word1 word2..', /([a-z]+)(\d+)/i);
 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
 */
var browserSplit = (function split(undef) {

  var nativeSplit = String.prototype.split,
    compliantExecNpcg = /()??/.exec("")[1] === undef,
    // NPCG: nonparticipating capturing group
    self;

  self = function(str, separator, limit) {
    // If `separator` is not a regex, use `nativeSplit`
    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
      return nativeSplit.call(str, separator, limit);
    }
    var output = [],
      flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + // Proposed for ES6
      (separator.sticky ? "y" : ""),
      // Firefox 3+
      lastLastIndex = 0,
      // Make `global` and avoid `lastIndex` issues by working with a copy
      separator = new RegExp(separator.source, flags + "g"),
      separator2, match, lastIndex, lastLength;
    str += ""; // Type-convert
    if (!compliantExecNpcg) {
      // Doesn't need flags gy, but they don't hurt
      separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
    }
    /* Values for `limit`, per the spec:
     * If undefined: 4294967295 // Math.pow(2, 32) - 1
     * If 0, Infinity, or NaN: 0
     * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
     * If negative number: 4294967296 - Math.floor(Math.abs(limit))
     * If other: Type-convert, then use the above rules
     */
    limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
    limit >>> 0; // ToUint32(limit)
    while (match = separator.exec(str)) {
      // `separator.lastIndex` is not reliable cross-browser
      lastIndex = match.index + match[0].length;
      if (lastIndex > lastLastIndex) {
        output.push(str.slice(lastLastIndex, match.index));
        // Fix browsers whose `exec` methods don't consistently return `undefined` for
        // nonparticipating capturing groups
        if (!compliantExecNpcg && match.length > 1) {
          match[0].replace(separator2, function() {
            for (var i = 1; i < arguments.length - 2; i++) {
              if (arguments[i] === undef) {
                match[i] = undef;
              }
            }
          });
        }
        if (match.length > 1 && match.index < str.length) {
          Array.prototype.push.apply(output, match.slice(1));
        }
        lastLength = match[0].length;
        lastLastIndex = lastIndex;
        if (output.length >= limit) {
          break;
        }
      }
      if (separator.lastIndex === match.index) {
        separator.lastIndex++; // Avoid an infinite loop
      }
    }
    if (lastLastIndex === str.length) {
      if (lastLength || !separator.test("")) {
        output.push("");
      }
    } else {
      output.push(str.slice(lastLastIndex));
    }
    return output.length > limit ? output.slice(0, limit) : output;
  };

  return self;
})();

var classIdSplit = /([\.#]?[a-zA-Z0-9\u007F-\uFFFF_:-]+)/;
var notClassId = /^\.|#/;

var parseTag_1 = parseTag;

function parseTag(tag, props) {
    if (!tag) {
        return 'DIV';
    }

    var noId = !(props.hasOwnProperty('id'));

    var tagParts = browserSplit(tag, classIdSplit);
    var tagName = null;

    if (notClassId.test(tagParts[1])) {
        tagName = 'DIV';
    }

    var classes, part, type, i;

    for (i = 0; i < tagParts.length; i++) {
        part = tagParts[i];

        if (!part) {
            continue;
        }

        type = part.charAt(0);

        if (!tagName) {
            tagName = part;
        } else if (type === '.') {
            classes = classes || [];
            classes.push(part.substring(1, part.length));
        } else if (type === '#' && noId) {
            props.id = part.substring(1, part.length);
        }
    }

    if (classes) {
        if (props.className) {
            classes.push(props.className);
        }

        props.className = classes.join(' ');
    }

    return props.namespace ? tagName : tagName.toUpperCase();
}

var softSetHook = SoftSetHook;

function SoftSetHook(value) {
    if (!(this instanceof SoftSetHook)) {
        return new SoftSetHook(value);
    }

    this.value = value;
}

SoftSetHook.prototype.hook = function (node, propertyName) {
    if (node[propertyName] !== this.value) {
        node[propertyName] = this.value;
    }
};

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

/*global window, global*/

var root = typeof window !== 'undefined' ?
    window : typeof commonjsGlobal !== 'undefined' ?
    commonjsGlobal : {};

var individual = Individual;

function Individual(key, value) {
    if (key in root) {
        return root[key];
    }

    root[key] = value;

    return value;
}

var oneVersion = OneVersion;

function OneVersion(moduleName, version, defaultValue) {
    var key = '__INDIVIDUAL_ONE_VERSION_' + moduleName;
    var enforceKey = key + '_ENFORCE_SINGLETON';

    var versionValue = individual(enforceKey, version);

    if (versionValue !== version) {
        throw new Error('Can only have one copy of ' +
            moduleName + '.\n' +
            'You already have version ' + versionValue +
            ' installed.\n' +
            'This means you cannot install version ' + version);
    }

    return individual(key, defaultValue);
}

var MY_VERSION = '7';
oneVersion('ev-store', MY_VERSION);

var hashKey = '__EV_STORE_KEY@' + MY_VERSION;

var evStore = EvStore;

function EvStore(elem) {
    var hash = elem[hashKey];

    if (!hash) {
        hash = elem[hashKey] = {};
    }

    return hash;
}

var evHook = EvHook;

function EvHook(value) {
    if (!(this instanceof EvHook)) {
        return new EvHook(value);
    }

    this.value = value;
}

EvHook.prototype.hook = function (node, propertyName) {
    var es = evStore(node);
    var propName = propertyName.substr(3);

    es[propName] = this.value;
};

EvHook.prototype.unhook = function(node, propertyName) {
    var es = evStore(node);
    var propName = propertyName.substr(3);

    es[propName] = undefined;
};

var virtualHyperscript = h;

function h(tagName, properties, children) {
    var childNodes = [];
    var tag, props, key, namespace;

    if (!children && isChildren(properties)) {
        children = properties;
        props = {};
    }

    props = props || properties || {};
    tag = parseTag_1(tagName, props);

    // support keys
    if (props.hasOwnProperty('key')) {
        key = props.key;
        props.key = undefined;
    }

    // support namespace
    if (props.hasOwnProperty('namespace')) {
        namespace = props.namespace;
        props.namespace = undefined;
    }

    // fix cursor bug
    if (tag === 'INPUT' &&
        !namespace &&
        props.hasOwnProperty('value') &&
        props.value !== undefined &&
        !isVhook(props.value)
    ) {
        props.value = softSetHook(props.value);
    }

    transformProperties(props);

    if (children !== undefined && children !== null) {
        addChild(children, childNodes, tag, props);
    }


    return new vnode(tag, props, childNodes, key, namespace);
}

function addChild(c, childNodes, tag, props) {
    if (typeof c === 'string') {
        childNodes.push(new vtext(c));
    } else if (typeof c === 'number') {
        childNodes.push(new vtext(String(c)));
    } else if (isChild(c)) {
        childNodes.push(c);
    } else if (xIsArray(c)) {
        for (var i = 0; i < c.length; i++) {
            addChild(c[i], childNodes, tag, props);
        }
    } else if (c === null || c === undefined) {
        return;
    } else {
        throw UnexpectedVirtualElement({
            foreignObject: c,
            parentVnode: {
                tagName: tag,
                properties: props
            }
        });
    }
}

function transformProperties(props) {
    for (var propName in props) {
        if (props.hasOwnProperty(propName)) {
            var value = props[propName];

            if (isVhook(value)) {
                continue;
            }

            if (propName.substr(0, 3) === 'ev-') {
                // add ev-foo support
                props[propName] = evHook(value);
            }
        }
    }
}

function isChild(x) {
    return isVnode(x) || isVtext(x) || isWidget_1(x) || isThunk_1(x);
}

function isChildren(x) {
    return typeof x === 'string' || xIsArray(x) || isChild(x);
}

function UnexpectedVirtualElement(data) {
    var err = new Error();

    err.type = 'virtual-hyperscript.unexpected.virtual-element';
    err.message = 'Unexpected virtual child passed to h().\n' +
        'Expected a VNode / Vthunk / VWidget / string but:\n' +
        'got:\n' +
        errorString(data.foreignObject) +
        '.\n' +
        'The parent vnode is:\n' +
        errorString(data.parentVnode);
    err.foreignObject = data.foreignObject;
    err.parentVnode = data.parentVnode;

    return err;
}

function errorString(obj) {
    try {
        return JSON.stringify(obj, null, '    ');
    } catch (e) {
        return String(obj);
    }
}

var h_1 = virtualHyperscript;

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
        
        return h_1(tagName, properties, new Proxy(children.flat(), { 
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

weddell.use(dom, vdom);

export default weddell;
