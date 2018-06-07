const EventEmitterMixin = require('./event-emitter-mixin');
const defaults = require('object.defaults/immutable');
const generateHash = require('../utils/make-hash');
const mix = require('mixwith-es5').mix;
const DeDupe = require('mixwith-es5').DeDupe;
const difference = require('../utils/difference');
const compact = require('array-compact');
const h = require('virtual-dom/h');
const svg = require('virtual-dom/virtual-hyperscript/svg');
const VDOMWidget = require('./vdom-widget');

function flatten(arr) {
    return [].concat(...arr);
}

function uniq(arr) {
    return arr.reduce((acc, item) => acc.includes(item) ? acc : acc.concat(item), []);
}

function cloneVNode(vNode, newChildren=null, preserveIfUnchanged=false) {
    return preserveIfUnchanged && !newChildren && !vNode.namespace && false ? vNode : 
        (vNode.namespace ? svg : h)(vNode.tagName, Object.assign({}, vNode.properties, {
            key: vNode.key
        }), newChildren || vNode.children);
}

const defaultOpts = {
    store: {},
    inputs: [],
    isRoot: false
};
const defaultInitOpts = {};
const _generatedComponentClasses = {};
const testElement = document.createElement('div');

var Component = class extends mix(Component).with(EventEmitterMixin) {
    static get renderMethods() {
        return ['renderVNode', 'renderStyles'];
    }
    
    constructor(opts) {
        opts = defaults(opts, defaultOpts);
        super(opts);
        var Store = this.constructor.Weddell.classes.Store;

        Object.defineProperties(this, {
            id: { get: () => this._id },
            path: { get: () => this._path },
            classPath: { get: () => this._classPath },
            isRoot: { value: opts.isRoot },
            content: { value: [], writable: true},
            hasMounted: {get: () => this._hasMounted},
            isMounted: { get: () => this._isMounted },
            renderPromise: {get: () => this._renderPromise},
            hasRendered: {get: () => this._hasRendered},
            el: {get: () => this._el},
            isInit: { get: () => this._isInit },
            defaultInitOpts: { value: defaults(opts.defaultInitOpts, defaultInitOpts) },
            root: {value: opts.isRoot ? this : opts.root },
            inputs : { value: compact(opts.inputs) },

            renderers: { value: {} },

            _el: { value: null, writable: true },
            _lastAccessedStateKeys: { value: this.constructor.renderMethods
                .reduce((acc, key) => Object.assign(acc, {[key]: []}), {}) },
            _dirtyRenderers: { value: false, writable: true },
            _inlineEventHandlers: { writable: true, value: {} },
            _isMounted: {writable:true, value: false},
            _componentsRequestingPatch: {writable: true, value: []},
            _renderPromise: {writable:true, value: null},
            _lastRenderedComponentClasses: {writable: true, value:null},
            _hasMounted: {writable:true, value: false},
            _hasRendered: {writable:true, value: false},
            _isInit: { writable: true, value: false},            
            _id : { value: generateHash() },
            _tagDirectives: { value: {} },
            _componentListenerCallbacks: {value:{}, writable:true}
        });

        var inputMappings = this.constructor._inputMappings ? Object.entries(this.constructor._inputMappings)
            .filter(entry => this.inputs.find(input => input === entry[0] || input.key === entry[0]))
            .reduce((final, entry) => {
                final[entry[1]] = entry[0];
                return final;
            }, {}) : {};
            
        Object.defineProperties(this, {
            _path: { value: `${opts.parentComponent ? opts.parentComponent.path + '/': ''}${this.id}`},
            _classPath: { value: `${opts.parentComponent ? opts.parentComponent.classPath + '/': ''}${this.constructor.id}`},
            props: {
                value: new Store(this.inputs.map(input => typeof input === 'string' ? input : input.key ? input.key : null), {
                    shouldMonitorChanges: true,
                    extends: (opts.parentComponent ? [opts.parentComponent.props, opts.parentComponent.state, opts.parentComponent.store] : null),
                    inputMappings,
                    validators: this.inputs.filter(input => typeof input === 'object').reduce((final, inputObj) => Object.assign(final, {[inputObj.key]: {validator: inputObj.validator, required: inputObj.required}}), {}),
                    shouldEvalFunctions: false
                })
            },
            store: {
                value: new Store(Object.assign({
                    $bind: this.bindEvent.bind(this),
                    $bindValue: this.bindEventValue.bind(this)
                }, opts.store), {
                    shouldMonitorChanges: false,
                    shouldEvalFunctions: false
                })
            }
        });

        if (opts.state) {
            console.warn("opts.state is deprecated in favor of static 'state' getter. Update your code!");
        }
        var state = this.constructor.state || opts.state || {};
        
        Object.defineProperty(this, 'state', {
            value: new Store(defaults({
                $attributes: null,
                $id: () => this.id
            }, state), {
                overrides: [this.props],
                proxies: [this.store]
            })
        })

        if (opts.components) {
            console.warn("opts.components is deprecated in favor of static 'components' getter. Please update your code.");
        }
        var components = this.constructor.components || opts.components || {};
        
        Object.defineProperties(this, {
            _componentInstances: { value:
                Object.keys(components)
                    .map(key => key.toLowerCase())
                    .reduce((final, key) => {
                        final[key] = {};
                        return final;
                    }, {})
            },
            _locals: {value: new Store({}, { proxies: [this.state, this.store], shouldMonitorChanges: false, shouldEvalFunctions: false})}
        });

        Object.defineProperty(this, 'components', {
            value: Object.entries(components)
                .map(entry => [entry[0].toLowerCase(), entry[1]])
                .reduce((final, entry) => {
                    final[entry[0]] = this.createChildComponentClass(entry[0], entry[1])
                    return final;
                }, {})
        })

        // this.on('componentschange', evt => {
        //     this.markDirty(null, 'styles');
        // });

        this.getParent = () => opts.parentComponent || null;
        if (opts.markupTemplate) {
            console.warn("You are using deprecated syntax. 'markupTemplate' will be removed in the next major version. Use static 'markup' getter.");
        }
        if (opts.stylesTemplate) {
            console.warn("You are using deprecated syntax. 'stylesTemplate' will be removed in the next major version. Use static 'styles' getter for static styles, and instance 'styles' for runtime templates.");
        }
        this.vNodeTemplate = this.makeVNodeTemplate(this.constructor.markup, opts.markupTemplate);
        this.stylesTemplate = this.makeStylesTemplate(this.constructor.dynamicStyles || opts.stylesTemplate, this.constructor.styles);
        this.vTree = null;

        window[this.constructor.Weddell.consts.VAR_NAME].components[this._id] = this;
    }

    render(dirtyRenderers=null) {
        var promise = this.constructor.renderMethods
            .reduce((acc, method) => {
                return acc
                    .then(results => {
                        return Promise.resolve(this[method]())
                            .then(result => {
                                Object.defineProperty(results, method, { get: () => result, enumerable: true });
                                return results;
                            })
                    })
            }, Promise.resolve({}))
            .then(results => {
                return Promise.resolve(results)
                    .then(results => {
                        if (this._dirtyRenderers) {
                            this._dirtyRenderers = null;
                            return Promise.reject(this._dirtyRenderers);
                        }
                        return results;
                    })
                    .then(results => {
                        this._renderPromise = null;
                        this._hasRendered = true;
                        this.requestPatch(results);
                        return results;
                    }, dirtyRenderers => {
                        return this.render(dirtyRenderers);
                    })
            }, err => {
                throw err;
            })
            .then(results => Promise.resolve(this.onRender())
                .then(() => results))

        return !this._renderPromise ? (this._renderPromise = promise): promise;
    }

    onInit() {
        //noop
    }

    onFirstRender() {
        //noop
    }

    onRender() {
        //noop
    }

    onMove() {
        //noop
    }

    onMount() {
        //noop
    }

    onUnmount() {
        //noop
    }

    requestPatch(results) {
        this.trigger('requestpatch', {results: Object.create(results), id: this.id, classId: this.constructor.id, path: this.path, classPath: this.classPath });
    }

    static get mountedInstances() {
        return staticProps.mountedInstaces;
    }

    static get mountedComponents() {
        return {};
    }

    static set mountedComponents(val) {
        this._mountedComponents = {};
    }

    makeVNodeTemplate() {
        /*
        * Take instance and static template inputs, return a function that will generate the correct output.
        */

        return Array.from(arguments).reduce((acc, curr) => {
            if (!acc) {
                if (typeof curr === 'function') {
                    return this.wrapTemplate(curr, 'renderVNode', h);
                }
                if (typeof curr === 'string') {
                    //TODO support template string parser;
                }
            }
            return acc;
        }, null);
    }

    makeStylesTemplate(dynamicStyles, staticStyles='') {
        if (typeof dynamicStyles === 'function') {
               
        } else if (dynamicStyles) {
            throw new Error(`Only functions are supported for dynamic styles for now.`);
        }

        if (typeof staticStyles !== 'string') {
            throw new Error(`Only strings are supported for static component styles.`);
        }

        return this.wrapTemplate((locals) => {
            var styles = dynamicStyles ? dynamicStyles.call(this, locals) : null;
            return Object.defineProperties({}, {
                dynamicStyles: {
                    get: () => styles
                },
                staticStyles: {
                    get: () => staticStyles
                }
            })
        }, 'renderStyles');
    }

    wrapTemplate(func, renderMethodName) {
        return () => {
            var accessed = {};
        
            this.state.on('get', evt => {
                accessed[evt.key] = 1;
            });

            var result = func.apply(this, [this.state].concat(Array.from(arguments).slice(2)));

            this._lastAccessedStateKeys[renderMethodName] = accessed;

            return result;
        }        
    }

    renderStyles() {
        return this.stylesTemplate();
    }

    renderVNode() {
        var vTree = this.vNodeTemplate();

        if (Array.isArray(vTree)) {
            if (vTree.length > 1) {
                console.warn('Template output was truncated in', this.constructor.name, 'component. Component templates must return a single vNode!');
            }            
            vTree = vTree[0];
        }

        return this.replaceComponentPlaceholders(vTree)
            .then(vTree => {
                this.vTree = vTree;
                return this.onRenderMarkup();
            })
            .then(() => this.vTree)
    }

    replaceComponentPlaceholders(vNode, renderedComponents={}) {
        var components;
        var componentName;

        if (Array.isArray(vNode)) {
            return Promise.all(vNode.map(child => this.replaceComponentPlaceholders(child, renderedComponents)));
        } else if (!vNode.tagName) {
            return vNode;
        } else if ((componentName = vNode.tagName.toLowerCase()) === 'content') {
            return Promise.resolve(this.content);
        }

        if (vNode.children) {
            var promise = this.replaceComponentPlaceholders(vNode.children, renderedComponents)
                .then(children => {
                    if (children.some((child, ii) => vNode.children[ii] !== child)) {
                        return cloneVNode(vNode, flatten(children));
                    }
                    return vNode;
                })            
        } else {
            promise = Promise.resolve(vNode);
        }

        return promise
            .then(vNode => {
                if (componentName in (components = this.collectComponentTree())) {
                    var props = vNode.properties.attributes;
                    var content = vNode.children || [];
                    if (!(componentName in renderedComponents)) {
                        renderedComponents[componentName] = [];
                    }
                    var index = (vNode.properties.attributes && vNode.properties.attributes[this.constructor.Weddell.consts.INDEX_ATTR_NAME]) || renderedComponents[componentName].length;
                    var prom = this.getInitComponentInstance(componentName, index)
                    renderedComponents[componentName].push(prom);

                    return prom
                        .then(instance => {
                            return Promise.all(content.map(contentNode => {
                                    return instance.replaceComponentPlaceholders(contentNode)
                                }))
                                .then(content => {
                                    instance.content = content;
                                    instance.assignProps(props, this);
                                    return new VDOMWidget({weddellComponent: instance});
                                });
                        });        
                }

                return cloneVNode(vNode, null, true);
            });
    }

    refreshPendingWidgets() {
        var componentsToRefresh = uniq(this._componentsRequestingPatch);
        componentsToRefresh.forEach(instance => instance.refreshPendingWidgets());
        this.vTree = this.refreshWidgets(this.vTree, componentsToRefresh);
        this._componentsRequestingPatch = [];
    }

    refreshWidgets(vNode, targetComponents=[]) {
        if (targetComponents.length) {
            if (vNode.type === 'Widget') {
                if (targetComponents.includes(vNode.weddellComponent)) {
                    return new VDOMWidget({weddellComponent: vNode.weddellComponent});
                }
            } else if (vNode.children) {
                var children = vNode.children.map(child => this.refreshWidgets(child, targetComponents));
                if (children.some((child, ii) => child !== vNode.children[ii])) {
                    return cloneVNode(vNode, children);
                }
            }
        }
        return vNode;
    }

    walkComponents(callback, filterFunc=()=>true) {
        if (filterFunc(this)) {
            callback(this)
        }
        for (var componentName in this.components) {
            Object.values(this._componentInstances[componentName])
                .forEach(instance => instance.walkComponents(callback, filterFunc))
        }
    }

    checkChangedKey(key) {
        return Object.entries(this._lastAccessedStateKeys)
            .reduce((acc, entry) => key in entry[1] ? Object.assign(acc || {}, {[entry[0]]:1}) : acc, null);
    }

    collectComponentTree() {
        var parent = this.getParent();
        return Object.entries(this.components)
                .reduce((acc, entry) => {
                    return Object.assign(acc, {
                        [entry[0].toLowerCase()]: {
                            sourceInstance: this, 
                            componentClass: entry[1]
                        }
                    })
                }, parent ? parent.collectComponentTree() : {});
    }

    queryDOM(query) {
        return this.awaitRender()
            .then(() => document.querySelector(query));
    }

    queryDOMAll(query) {
        return this.awaitRender()
            .then(() => document.querySelectorAll(query));
    }

    awaitEvent(eventName, evtObjValidator) {
        var resolveProm;
        var promise = new Promise(function(resolve){
            resolveProm = resolve;
        });
        this.once(eventName, function(evt){
            resolveProm(evt);
        });
        return promise;
    }

    awaitRender(val) {
        return (this.renderPromise ? this.renderPromise : Promise.resolve())
            .then(() => val);
    }

    onRenderMarkup() {
        //Default event handler, noop
    }

    onRenderStyles() {
        //Default event handler, noop
    }

    addTagDirective(name, directive) {
        this._tagDirectives[name.toUpperCase()] = directive;
    }

    static get generatedComponentClasses() {
        return _generatedComponentClasses;
    }

    static set generatedComponentClasses(val) {
        return _generatedComponentClasses = val;
    }

    static makeComponentClass(ComponentClass) {
        if (typeof ComponentClass === 'function' && !ComponentClass.prototype) {
            // We got a non-Component class function, so we assume it is a component factory function
            var str = ComponentClass.toString();
            if (str in this.generatedComponentClasses) {
                return this.generatedComponentClasses[str];
            } else {
                return this.generatedComponentClasses[str] = this.bootstrapComponentClass(ComponentClass.call(this, this.Weddell.classes.Component));
            }
        } else {
            return this.bootstrapComponentClass(ComponentClass);
        }        
    }

    static bootstrapComponentClass(ComponentClass) {
        var WeddellComponent = this.Weddell.classes.Component;
        if (ComponentClass.prototype && (ComponentClass.prototype instanceof WeddellComponent || ComponentClass.prototype.constructor === WeddellComponent)) {
            if (!ComponentClass.id) {
                var id = generateHash();
                var BaseClass = ComponentClass;
                ComponentClass = class Component extends BaseClass {
                    static get id() {
                        return id;
                    }

                    static get BaseClass() {
                        return BaseClass;
                    }
                }
            }
            return ComponentClass;
        } else {
            //@TODO We may want to support plain objects here as well. Only problem is then we don't get the clean method inheritance and would have to additionally support passing method functions along as options, which is a bit messier.
            throw "Unsupported component input";
        }
    }

    createChildComponentClass(componentName, ChildComponent) {
        if (Array.isArray(ChildComponent)) {
            var initOpts = ChildComponent[2];
            var inputMappings = ChildComponent[1];
            ChildComponent = ChildComponent[0];
        }

        ChildComponent = this.constructor.makeComponentClass(ChildComponent);

        var parentComponent = this;
        var root = this.root;

        var obj = {};

        obj[componentName] = class extends ChildComponent {
            constructor(opts) {
                super(defaults({
                    root,
                    parentComponent,
                }, opts))

                parentComponent.trigger('createcomponent', {component: this, parentComponent, componentName});

                this.on('createcomponent', evt => {
                    parentComponent.trigger('createcomponent', Object.assign({}, evt));
                });
            }
        }

        this.trigger('createcomponentclass', { ComponentClass: obj[componentName] });

        Object.defineProperties(obj[componentName], {
            _initOpts: { value: initOpts },
            _inputMappings: { value: inputMappings }
        })

        return obj[componentName];
    }

    init(opts) {
        opts = defaults(opts, this.defaultInitOpts);
        if (!this._isInit) {
            this._isInit = true;

            ['props', 'state'].forEach((propName) => {
                this[propName].on('change', evt => {
                    if (evt.target === this[propName]) {
                        var dirtyRenderers = this.checkChangedKey(evt.changedKey);
                        if (dirtyRenderers) {
                            if (this.renderPromise) {
                                this._dirtyRenderers = Object.assign(this._dirtyRenderers || {}, dirtyRenderers);
                            } else {
                                this.render(dirtyRenderers);
                            }
                        }
                    }
                })
            });
            
            return this.render()
                .then(() => {
                    return Promise.resolve(this.onFirstRender(opts))
                })
                .then(() => {
                    return Promise.resolve(this.onInit(opts))
                })
                .then(() => {
                    this.trigger('init');
                    return this;
                });
        }
        return Promise.resolve(this);
    }

    bindEvent(funcText, opts) {
        var consts = this.constructor.Weddell.consts;
        return "(function(event){" +
            (opts && opts.preventDefault ? 'event.preventDefault();' : '') +
            (opts && opts.stopPropagation ? 'event.stopPropagation();' : '') +
            funcText + ";}.bind(window['" + consts.VAR_NAME + "'].components['" + this._id + "'], event)())";
    }

    bindEventValue(propName, opts) {
        return this.bindEvent("this.state['" + propName + "'] = event.target.value", opts);
    }

    getMountedChildComponents() {
        return Object.entries(this.components)
            .reduce((finalArr, entry) => {
                return Object.values(this._componentInstances[entry[0]])
                    .filter(instance => instance.isMounted)
                    .concat(finalArr);
            }, [])
    }

    assignProps(props, parentScope) {
        if (props) {
            this.inputs.filter(input => !(input in props || input.key in props))
            .forEach(input => {
                this.props[input.key || input] = null;
            });

            var parsedProps = Object.entries(props)
                .reduce((acc, entry) => {
                    if (this.inputs.some(input => input === entry[0] || input.key === entry[0])) {
                        acc[0][entry[0]] = entry[1];
                    } else if (entry[0].slice(0,2) === 'on' && !(entry[0] in testElement)) {
                        //TODO support more spec-compliant data- attrs
                        acc[1][entry[0]] = entry[1];
                    } else {
                        acc[2][entry[0]] = entry[1];
                    }
                    return acc;
                }, [{},{},{}]);//first item props, second item event handlers, third item attributes
            
            Object.assign(this.props, parsedProps[0]);
            this.bindInlineEventHandlers(parsedProps[1], parentScope);
            this.state.$attributes = parsedProps[2];
        }
    }

    bindInlineEventHandlers(handlersObj, scope) {
        var results = Object.entries(this._inlineEventHandlers)
            .reduce((acc, currHandlerEntry) => {
                if (currHandlerEntry[0] in acc[1]) {
                    if (currHandlerEntry[1].handlerString !== handlersObj[currHandlerEntry[0]]) {
                        //there is a new handler for this event, and it does not match existing handler. replace
                        acc[0].push(currHandlerEntry);
                    } else {
                        //there is a new handler for this event and it does match existing handler. Do nothing
                        delete acc[1][currHandlerEntry[0]];
                    }
                }
                return acc;
            }, [[], Object.assign({}, handlersObj)]); //arr[0] handlers to remove, arr[1] events to add

        var handlerEntriesToRemove = results[0];
        var handlersToAdd = results[1];

        handlerEntriesToRemove.forEach(handlerEntry => {
            handlerEntry[1].off()
            delete this._inlineEventHandlers[handlerEntry[0]];
        });

        for (var eventName in handlersToAdd) {
            var handlerString = handlersToAdd[eventName];
            this._inlineEventHandlers[eventName] = {handlerString};
            try {
                var callback = new Function('component', 'event', handlerString).bind(scope, this)
            } catch (err) {
                throw "Failed parsing event handler for component: " + err.stack;
            }
            this._inlineEventHandlers[eventName].off = this.on(eventName.slice(2), callback);
        }
    }

    addComponentEvents(componentName, childComponent, index) {
        var componentKeyIndex;
        if (this.constructor.componentEventListeners && (componentKeyIndex = Object.keys(this.constructor.componentEventListeners).map(key => key.toLowerCase()).indexOf(componentName)) > -1) {
            if (!(componentName in this._componentListenerCallbacks)) {
                this._componentListenerCallbacks[componentName] = {}
            }
            this._componentListenerCallbacks[componentName][index] = Object.entries(this.constructor.componentEventListeners[Object.keys(this.constructor.componentEventListeners)[componentKeyIndex]])
                .map(entry => {
                    return childComponent.on(entry[0], function() {
                        if (childComponent.isMounted) {
                            entry[1].apply(this, Array.from(arguments).concat(childComponent));
                        }
                    }.bind(this))
                })
        }
    }

    unmount() {
        for (var eventName in this._inlineEventHandlers) {
            this._inlineEventHandlers[eventName].off();
            delete this._inlineEventHandlers[eventName];
        }
        this._isMounted = false;
        this.trigger('unmount');
        this.onUnmount.call(this);
    }

    mount() {
        this._isMounted = true;
        this._hasMounted = true;
        this.trigger('mount');
        this.onMount.call(this);
    }

    makeComponentInstance(componentName, index, opts) {
        componentName = componentName.toLowerCase();
        var instance = new (this.components[componentName])({
            store: defaults({
                $componentID: this.components[componentName]._id,
                $instanceKey: index
            })
        });
        this.addComponentEvents(componentName, instance, index);

        instance.on('requestpatch', evt => {
            if (this.vTree) {
                this._componentsRequestingPatch.push(instance);
                this.trigger('requestpatch', Object.assign({}, evt));
            }
        });

        return instance;
    }

    getComponentInstance(componentName, index) {
        componentName = componentName.toLowerCase()
        var instances = this._componentInstances[componentName];
        return instances[index];
    }

    getInitComponentInstance(componentName, index) {
        var instance = this.getComponentInstance(componentName, index);
        if (!instance) {
            return (this._componentInstances[componentName][index] = this.makeComponentInstance(componentName, index))
                .init(this.components[componentName]._initOpts);
        }

        return Promise.resolve(instance);
    }

    cleanupComponentInstances() {
        //TODO right now, if a component becomes unused, it will continue to sit in memory and possibly generate events. We should probably clean them up.
    }
}

module.exports = Component;
