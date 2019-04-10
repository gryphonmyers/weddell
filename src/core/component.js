const EventEmitterMixin = require('@weddell/event-emitter-mixin');
const defaults = require('defaults-es6');
const generateHash = require('../utils/make-hash');
const mix = require('@weddell/mixwith').mix;
const h = require('virtual-dom/h');
const VdomWidget = require('./vdom-widget');
const deepEqual = require('deep-equal');
const cloneVNode = require('../utils/clone-vnode');
const flatten = require('../utils/flatten');
const compact = require('../utils/compact');
const uniq = require('../utils/uniq');
const difference = require('../utils/difference');

const defaultOpts = {
    consts: {},
    inputs: null,
    isRoot: false
};
const defaultInitOpts = {};
var _generatedComponentClasses = {};
const testElement = document.createElement('div');

const renderInterval = 33.333;

var Component = class extends mix(Component).with(EventEmitterMixin) {
    static get renderMethods() {
        return ['renderVNode', 'renderStyles'];
    }

    static get isWeddellComponent() {
        return true;
    }

    constructor(opts) {
        opts = defaults(opts, defaultOpts);
        super(opts);
        var weddellGlobals = window[this.constructor.Weddell.consts.VAR_NAME];
        var Store = this.constructor.Weddell.classes.Store;
        if (weddellGlobals.verbosity > 0 && opts.inputs) {
            console.warn('you are using outdated syntax! opts.inputs is deprecated in favor of static getter.')
        }
        Object.defineProperties(this, {
            id: { get: () => this._id },
            isRoot: { value: opts.isRoot },
            _content: { value: [], writable: true },
            content: {
                get: () => {
                    return this._content;
                }, set: val => {
                    var oldContent = this._content;
                    this._content = val;
                    if (!deepEqual(oldContent, val)) {
                        this.markDirty();
                    }
                }
            },
            hasMounted: { get: () => this._hasMounted },
            isMounted: { get: () => this._isMounted },
            renderPromise: { get: () => this._renderPromise },
            childComponents: { get: () => this._childComponents },
            contentComponents: { get: () => this._contentComponents },
            hasRendered: { get: () => this._hasRendered },
            el: { get: () => this._el },
            isInit: { get: () => this._isInit },
            defaultInitOpts: { value: defaults(opts.defaultInitOpts, defaultInitOpts) },
            root: { value: opts.isRoot ? this : opts.root },
            inputs: { value: compact(this.constructor.inputs || opts.inputs || []) },
            //@TODO inputs don't need to be stored on isntance at all
            renderers: { value: {} },
            _el: { value: null, writable: true },
            _lastRenderTimeStamps: {
                value: this.constructor.renderMethods
                    .reduce((acc, key) => Object.assign(acc, { [key]: null }), {})
            },
            _lastAccessedStateKeys: {
                value: this.constructor.renderMethods
                    .reduce((acc, key) => Object.assign(acc, { [key]: [] }), {})
            },
            _componentSnapshots: { value: opts.componentSnapshots || null },
            _dirtyRenderers: { value: true, writable: true },
            _contentComponents: { value: [], writable: true },
            _inlineEventHandlers: { writable: true, value: {} },
            _isMounted: { writable: true, value: null },
            _lastRenderedComponents: { writable: true, value: null },
            _childComponents: { writable: true, value: {} },
            _componentsRequestingPatch: { writable: true, value: [] },
            _renderPromise: { writable: true, value: null },
            _hasMounted: { writable: true, value: false },
            _hasRendered: { writable: true, value: false },
            _widgetIsDirty: { writable: true, value: false },
            _vTree: { writable: true, value: null },
            _prevVTree: { writable: true, value: null },
            _prevWidget: { writable: true, value: null },
            _dirtyWidgets: { writable: true, value: {} },
            _renderCache: {
                value: this.constructor.renderMethods
                    .reduce((acc, key) => Object.assign(acc, { [key]: [] }), {})
            },
            _isInit: { writable: true, value: false },
            _id: { value: opts.id || generateHash() },
            _componentListenerCallbacks: { value: {}, writable: true }
        });

        var inputMappings = this.constructor._inputMappings ? Object.entries(this.constructor._inputMappings)
            .filter(entry => this.inputs.find(input => input === entry[0] || input.key === entry[0]))
            .reduce((final, entry) => {
                final[entry[1]] = entry[0];
                return final;
            }, {}) : {};


        if (weddellGlobals.verbosity > 0 && opts.store) {
            console.warn("opts.store is deprecated in favor of static 'consts' getter. Update your code!");
        }

        if (weddellGlobals.verbosity > 0 && this.store) {
            console.warn("'store' property on instance is deprecated in favor of static 'consts' getter. Update your code!");
        }

        if (weddellGlobals.verbosity > 0 && this.constructor.store) {
            console.warn("'store' static getter on instance is deprecated in favor of static 'consts' getter. Update your code!");
        }

        Object.defineProperties(this, {
            _widget: { writable: true, value: new VdomWidget({ component: this, childWidgets: {} }) },
            props: {
                value: new Store(this.inputs.map(input => typeof input === 'string' ? input : input.key ? input.key : null), {
                    shouldMonitorChanges: true,
                    extends: (opts.parentComponent ? [opts.parentComponent.props, opts.parentComponent.state, opts.parentComponent.store] : null),
                    inputMappings,
                    validators: this.inputs.filter(input => typeof input === 'object').reduce((final, inputObj) => Object.assign(final, { [inputObj.key]: { validator: inputObj.validator, required: inputObj.required } }), {}),
                    shouldEvalFunctions: false,
                    requireSerializable: false,
                })
            },
            consts: {
                value: new Store(defaults({
                    $bind: this.bindEvent.bind(this),
                    $bindValue: this.bindEventValue.bind(this)
                }, this.constructor.store || {}, this.constructor.consts || {}, this.store || {}, opts.store || opts.consts || {}), {
                        requireSerializable: false,
                        shouldMonitorChanges: false,
                        shouldEvalFunctions: false
                    })
            },
            store: { get: () => this.consts }
        });

        if (weddellGlobals.verbosity > 0 && opts.state) {
            console.warn("opts.state is deprecated in favor of static 'state' getter. Update your code!");
        }

        var state = Object.assign({}, opts.state || {}, this.constructor.state);
        var component = this;
        var serializers = component.constructor.serializers;
        var deserializers = component.constructor.deserializers || component.constructor.hydrators;

        Object.defineProperty(this, 'state', {
            value: new Store(defaults({
                $attributes: null,
                $id: () => this.id
            }, state), {
                    initialState: opts.initialState,
                    overrides: [this.props],
                    proxies: [this.consts],
                    setTransform: function (key, value) {
                        return serializers && serializers[key]
                            ? serializers[key].call(this, value)
                            : value;
                    },
                    getTransform: function (key, value) {
                        return deserializers && deserializers[key]
                            ? deserializers[key].call(this, value)
                            : value;
                    }
                })
        })

        if (weddellGlobals.verbosity > 0 && opts.components) {
            console.warn("opts.components is deprecated in favor of static 'components' getter. Please update your code.");
        }
        var components = this.constructor.components || opts.components || {};

        Object.defineProperties(this, {
            _componentInstances: {
                value:
                    Object.keys(components)
                        .map(key => key.toLowerCase())
                        .reduce((final, key) => {
                            final[key] = {};
                            return final;
                        }, {})
            },
            _locals: { value: new Store({}, { proxies: [this.state, this.consts], shouldMonitorChanges: false, shouldEvalFunctions: false }) }
        });

        Object.defineProperty(this, 'components', {
            value: Object.entries(components)
                .map(entry => [entry[0].toLowerCase(), entry[1]])
                .reduce((final, entry) => {
                    final[entry[0]] = { weddellClassInput: entry[1] };
                    return final;
                }, {})
        })

        this.getParent = () => opts.parentComponent || null;
        if (weddellGlobals.verbosity > 0 && opts.markupTemplate) {
            console.warn("You are using deprecated syntax. 'markupTemplate' will be removed in the next major version. Use static 'markup' getter.");
        }
        if (weddellGlobals.verbosity > 0 && (opts.stylesTemplate || this.constructor.dynamicStyles)) {
            console.warn("You are using deprecated syntax. 'stylesTemplate' and 'dynamicStyles' static getter will be removed in the next major version. Use static 'styles' getter for static styles, and instance 'styles' for runtime templates.");
        }
        this.vNodeTemplate = this.makeVNodeTemplate(this.constructor.markup, opts.markupTemplate);
        this.stylesTemplate = this.makeStylesTemplate(...[(this.constructor.dynamicStyles || opts.stylesTemplate)].concat(this.constructor.styles).filter(val => val));

        weddellGlobals.components[this._id] = this;
    }

    static get consts() {
        return {};
    }

    requestRender(dirtyRenderers) {
        var now = Date.now()
        var lastRenderTime = Object.values(this._lastRenderTimeStamps).reduce((acc, val) => isNaN(val) ? acc : Math.max(val, acc), 0)
        var dt = now - lastRenderTime;
        if (!this.hasRendered || dt >= renderInterval) {
            return this.render(dirtyRenderers);
        } else {
            return (this._renderPromise = new Promise(resolve => setTimeout(resolve, renderInterval - dt))
                .then(() => this.render(dirtyRenderers)));
        }
    }

    markDirty(dirtyRenderers = {}) {
        if (this.renderPromise || !this.isMounted) {
            this._dirtyRenderers = Object.assign(this._dirtyRenderers || {}, dirtyRenderers)
            return this.renderPromise;
        } else {
            return this.requestRender(dirtyRenderers);
        }
    }

    render(dirtyRenderers = null) {
        var promise = Promise.resolve()
            .then(() => {
                return this.constructor.renderMethods
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
                                    var dirtyRenderers = this._dirtyRenderers;
                                    this._dirtyRenderers = null;
                                    return Promise.reject(dirtyRenderers);
                                }
                                return results;
                            })
                            .then(results => {
                                this._renderPromise = null;
                                this.requestPatch(results);
                                return results;
                            }, dirtyRenderers => this.render(dirtyRenderers))
                    }, err => {
                        throw err;
                    })
                    .then(results => {
                        if (!this.hasRendered) {
                            this._hasRendered = true;
                            this.trigger('firstrender');
                            this.trigger('render');
                            return Promise.all([this.onRender(), this.onFirstRender()])
                                .then(() => results)
                        }
                        this.trigger('render');
                        return Promise.resolve(this.onRender()).then(() => results);
                    })
            })
        return !this._renderPromise ? (this._renderPromise = promise) : promise;
    }

    onInit() { }
    onFirstRender() { }
    onRender() { }
    onDOMCreate() { }
    onDOMMove() { }
    onDOMChange() { }
    onDOMCreateOrChange() { }
    onDOMDestroy() { }
    onMount() { }
    onUnmount() { }
    onFirstMount() { }
    onRenderMarkup() { }
    onRenderStyles() { }

    requestPatch(results) {
        this.trigger('requestpatch', { results: results ? Object.create(results) : {}, id: this.id, classId: this.constructor.id });
    }

    makeVNodeTemplate() {
        /*
        * Take instance and static template inputs, return a function that will generate the correct output.
        */

        return [...arguments].reduce((acc, curr) => {
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

    makeStylesTemplate() {
        var [instanceStyleBlocks, classStyleBlocks] = [...arguments]
            .reduce((acc, curr) =>
                typeof curr === 'function' ? [[...acc[0], curr], acc[1]] : [acc[0], [...acc[1], curr]], [[], []]);

        return this.wrapTemplate((locals) => {
            var instanceStyles = instanceStyleBlocks.map(styleBlock => styleBlock.call(this, locals));
            return Object.defineProperties({}, {
                dynamicStyles: {
                    get: () => instanceStyles
                },
                staticStyles: {
                    get: () => classStyleBlocks
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

            this._lastRenderTimeStamps[renderMethodName] = Date.now();
            this._renderCache[renderMethodName] = result;
            this._lastAccessedStateKeys[renderMethodName] = accessed;

            return result;
        }
    }

    renderStyles() {
        return Promise.resolve(this.stylesTemplate())
            .then(results => {
                return Promise.resolve(this.onRenderStyles())
                    .then(() => results);
            })
    }

    renderVNode() {
        var vTree = this.vNodeTemplate();

        if (Array.isArray(vTree)) {
            if (vTree.length > 1) {
                console.warn('Template output was truncated in', this.constructor.name, 'component. Component templates must return a single vNode!');
            }
            vTree = vTree[0];
        }

        var renderedComponents = [];

        return (vTree ? this.replaceComponentPlaceholders(vTree, renderedComponents)
            .then(vTree => {
                this._prevVTree = this._vTree;
                this._vTree = vTree;

                return Promise.all(renderedComponents)
                    .then(rendered => {
                        return Promise.all(difference(this._lastRenderedComponents || [], rendered).map(toUnmount => toUnmount.unmount()))
                            .then(() => {
                                this._lastRenderedComponents = rendered
                            })
                    })
                    .then(() => true)
            }) : this._vTree ? Promise.all((this._lastRenderedComponents || []).map(toUnmount => toUnmount.unmount()))
                .then(() => {
                    this._prevVTree = this._vTree;
                    this._lastRenderedComponents = null;
                    this.markWidgetDirty()
                    this._vTree = null;

                    return true;
                }) : Promise.resolve(false)
        )
            .then(didRender => {
                if (didRender) {
                    var evt = { components: renderedComponents };
                    this._childComponents = renderedComponents;
                    this.markWidgetDirty()
                    this.trigger('rendermarkup', evt);
                    this.onRenderMarkup(Object.assign({}, evt));
                }
            })
            .then(() => this._vTree)
    }

    refreshWidgets() {
        if (this._widgetIsDirty) {
            this.makeNewWidget();
        }
    }

    get state() {
        return {};
    }

    makeNewWidget() {
        this._prevWidget = this._widget;
        var newWidget = new VdomWidget({ component: this });
        newWidget.bindChildren(this);
        if (this._prevWidget) {
            this._prevWidget.unbindChildren();
        }
        this._widgetIsDirty = false;
        return this._widget = newWidget;
    }

    static get state() {
        return {};
    }

    static get tagDirectives() {
        return {
            content: function (vNode, children, props, renderedComponents) {
                return this.content;
            }
        }
    }

    replaceComponentPlaceholders(vNode, renderedComponents = []) {
        var components;
        var componentName;

        if (Array.isArray(vNode)) {
            return Promise.all(vNode.map(child => this.replaceComponentPlaceholders(child, renderedComponents)))
        } else if (!vNode.tagName) {
            return vNode;
        } else if ((componentName = vNode.tagName.toLowerCase()) in this.constructor.tagDirectives) {
            return Promise.resolve(this.constructor.tagDirectives[componentName].call(this, vNode, vNode.children || [], vNode.properties.attributes, renderedComponents));
        }

        return this.replaceComponentPlaceholders(vNode.children || [], renderedComponents)
            .then(children => {
                if (componentName in (components = this.collectComponentTree())) {
                    var props = vNode.properties.attributes;
                    var content = children || [];
                    if (!(componentName in renderedComponents)) {
                        renderedComponents[componentName] = [];
                    }
                    var index = (vNode.properties.attributes && vNode.properties.attributes[this.constructor.Weddell.consts.INDEX_ATTR_NAME]) || renderedComponents[componentName].length;

                    return this.makeChildComponentWidget(componentName, index, content, props, renderedComponents);
                }

                if (children.some((child, ii) => vNode.children[ii] !== child)) {
                    return cloneVNode(vNode, flatten(children));
                }
                return cloneVNode(vNode, null, true);
            })
    }

    makeChildComponentWidget(componentName, index, content, props, renderedComponents = []) {
        var parent = this.reduceParents((acc, component) => {
            return acc || (componentName in component.components ? component : acc);
        }, null);

        if (!parent) {
            throw new Error('Unrecognized component name:', componentName);
        }

        var prom = parent.getInitComponentInstance(componentName, index);
        if (!(componentName in renderedComponents)) {
            renderedComponents[componentName] = [];
        }
        renderedComponents[componentName].push(prom);
        renderedComponents.push(prom);
        return prom
            .then(component => {
                renderedComponents[componentName].splice(renderedComponents[componentName].indexOf(prom), 1, component);
                renderedComponents.splice(renderedComponents.indexOf(prom), 1, component);
                component.assignProps(props, this);
                var contentComponents = [];
                return component.replaceComponentPlaceholders(content, contentComponents)
                    .then(content => {
                        component.content = content;

                        if ((contentComponents.length !== component._contentComponents.length) || contentComponents.some((component, ii) => component._contentComponents[ii] !== component)) {
                            component.trigger('contentcomponentschange', { currentComponents: contentComponents, previousComponents: component._contentComponents })
                        }
                        component._contentComponents = contentComponents;

                        for (var propName in contentComponents) {
                            var contentComponent = contentComponents[propName];
                            if (!(propName in renderedComponents)) {
                                renderedComponents[propName] = [];
                            }
                            if (Array.isArray(contentComponents[propName])) {
                                renderedComponents[propName] = uniq(renderedComponents[propName].concat(contentComponents[propName]));
                            } else {
                                if (renderedComponents.indexOf(contentComponent) === -1) {
                                    renderedComponents.push(contentComponent);
                                }
                            }
                        }

                        return component.mount(this)
                            .then(didMount => {
                                parent.trigger('componentplaceholderreplaced', { component });
                                return component.makeNewWidget();
                            })
                    })
            });
    }

    walkComponents(callback, filterFunc = () => true) {
        if (filterFunc(this)) {
            callback(this)
        }
        for (var componentName in this._componentInstances) {
            Object.values(this._componentInstances[componentName])
                .forEach(instance => instance.walkComponents(callback, filterFunc))
        }
    }

    reduceComponents(callback, initialVal, filterFunc = () => true, depth = 0) {
        var acc = initialVal;
        if (filterFunc(this)) {
            acc = callback(acc, this, depth)
        }
        for (var componentName in this._componentInstances) {
            acc = Object.values(this._componentInstances[componentName])
                .reduce((acc, instance) => instance.reduceComponents(callback, acc, filterFunc, depth + 1), acc);
        }
        return acc;
    }

    checkChangedKey(key) {
        return Object.entries(this._lastAccessedStateKeys)
            .reduce((acc, entry) => key in entry[1] ? Object.assign(acc || {}, { [entry[0]]: 1 }) : acc, null);
    }

    reduceParents(callback, initialVal) {
        var parent = this.getParent();
        var shouldRecurse = true;
        initialVal = callback.call(this, initialVal, this, () => shouldRecurse = false);
        return parent && shouldRecurse ? parent.reduceParents(callback, initialVal) : initialVal;
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
        return this.awaitDom()
            .then(el => el.querySelector(query));
    }

    queryDOMAll(query) {
        return this.awaitDom()
            .then(el => el.querySelectorAll(query));
    }

    awaitEvent(eventName) {
        var resolveProm;
        //@TODO add evt obj filter
        var promise = new Promise(function (resolve) {
            resolveProm = resolve;
        });
        this.once(eventName, function (evt) {
            resolveProm(evt);
        });
        return promise;
    }

    awaitPatch() {
        return this.awaitRender().then(() => (this.root || this).awaitEvent('patch'));
    }

    awaitMount() {
        return this.isMounted ? Promise.resolve() : this.awaitEvent('mount');
    }

    awaitDom() {
        return this.el ? Promise.resolve(this.el) : this.awaitEvent('domcreate').then(evt => evt.el);
    }

    awaitRender(val) {
        return (this.renderPromise ? this.renderPromise : Promise.resolve())
            .then(() => val);
    }

    static get generatedComponentClasses() {
        return _generatedComponentClasses;
    }

    static set generatedComponentClasses(val) {
        return _generatedComponentClasses = val;
    }

    static async makeComponentClass(ComponentClass) {
        await ComponentClass;
        if (typeof ComponentClass === 'function' && !ComponentClass.isWeddellComponent) {
            //@TODO this is unreliable
            // We got a non-Component class function, so we assume it is a component factory function
            var str = ComponentClass.toString();
            if (str in this.generatedComponentClasses) {
                return this.generatedComponentClasses[str];
            } else {
                var result = await ComponentClass.call(this, this.Weddell.classes.Component);
                return this.generatedComponentClasses[str] = this.bootstrapComponentClass(result);
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

    async createChildComponentClass(componentName, ChildComponent) {
        if (Array.isArray(ChildComponent)) {
            var initOpts = ChildComponent[2];
            var inputMappings = ChildComponent[1];
            ChildComponent = ChildComponent[0];
        }
        ChildComponent = await this.constructor.makeComponentClass(ChildComponent);

        var parentComponent = this;
        var root = this.root;

        var obj = {};

        obj[componentName] = class extends ChildComponent {
            constructor(opts) {
                super(defaults({
                    root,
                    parentComponent,
                }, opts))

                parentComponent.trigger('createcomponent', { component: this, parentComponent, componentName });

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
                    // if (evt.target === this[propName]) {
                    var dirtyRenderers = this.checkChangedKey(evt.changedKey);
                    if (dirtyRenderers) {
                        this.markDirty(dirtyRenderers);
                    }
                    // }
                })
            });

            if (this.constructor.watchers) {
                this.constructor.watchers
                    .forEach(entry => this.state.watch(...entry))
            }

            return Promise.resolve(this.onInit(opts))
                .then(() => {
                    this.trigger('init');
                    return this;
                });
        }
        return Promise.resolve(this);
    }

    bindEvent(funcText, opts = {}) {
        var consts = this.constructor.Weddell.consts;
        return `${opts.preventDefault ? `event.preventDefault();` : ''}${opts.stopPropagation ? `event.stopPropagation();` : ''}Promise.resolve((window['${consts.VAR_NAME}'] && window['${consts.VAR_NAME}'].app) || new Promise(function(resolve){ window.addEventListener('weddellinitbefore', function(evt) { resolve(evt.detail.app) }) })).then(function(app) { app.awaitComponentMount('${this.id}').then(function(component){ (function() {${funcText}}.bind(component))()})})`;
    }

    bindEventValue(propName, opts) {
        return this.bindEvent("this.state['" + propName + "'] = event.target.value", opts);
    }

    getMountedChildComponents() {
        return this.reduceComponents((acc, component) =>
            acc.concat(component), [], component =>
                component !== this && component._isMounted);
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
                    } else if (entry[0].slice(0, 2) === 'on' && !(entry[0] in testElement)) {
                        //TODO support more spec-compliant data- attrs
                        acc[1][entry[0]] = entry[1];
                    } else {
                        acc[2][entry[0]] = entry[1];
                    }
                    return acc;
                }, [{}, {}, {}]);//first item props, second item event handlers, third item attributes

            Object.assign(this.props, parsedProps[0]);
            this.bindInlineEventHandlers(parsedProps[1], parentScope);
            this.state.$attributes = Object.entries(parsedProps[2])
                .filter(entry => typeof entry[1] === 'string')
                .reduce((acc, curr) => Object.assign(acc, { [curr[0]]: curr[1] }), {});
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
            this._inlineEventHandlers[eventName] = { handlerString };
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
                    return childComponent.on(entry[0], function () {
                        if (childComponent.isMounted) {
                            entry[1].apply(this, Array.from(arguments).concat(childComponent));
                        }
                    }.bind(this))
                })
        }
    }

    unmount() {
        if (this._isMounted === true) {
            for (var eventName in this._inlineEventHandlers) {
                this._inlineEventHandlers[eventName].off();
                delete this._inlineEventHandlers[eventName];
            }
            this._isMounted = false;

            return Promise.resolve(this.onUnmount())
                .then(() => {
                    return Promise.all((this._lastRenderedComponents || []).map(component => component.unmount()))
                })
                .then(() => {
                    this.markWidgetDirty()
                    return true;
                });
        }
        return Promise.resolve(false);
    }

    mount(domParent) {
        if (!this._isMounted) {
            return this._isMounted = this.render()
                .then(() => {
                    this._isMounted = true;
                    var hadMounted = this.hasMounted;
                    if (!this.hasMounted) {
                        this._hasMounted = true;
                        this.trigger('firstmount');
                    }
                    this.trigger('mount');

                    return hadMounted ? this.onMount() : Promise.all([this.onMount(), this.onFirstMount()])
                })
                .then(() => {
                    this.markWidgetDirty()
                    return true;
                });
        }
        return Promise.resolve(false);
    }

    markWidgetDirty() {
        this._widgetIsDirty = true;

        this.trigger('widgetdirty');
    }

    extractSnapshotOpts(snapshot) {
        if (!snapshot || !snapshot.id) {
            throw new Error(`Malformed snapshot: id is missing`)
        }

        return ['state', 'componentSnapshots', 'el']
            .reduce((acc, curr) =>
                snapshot[curr] ? Object.assign(acc, { [curr === 'state' ? 'initialState' : curr]: snapshot[curr] }) : acc, { id: snapshot.id });

    }

    async makeComponentInstance(componentName, index, componentOpts = {}) {
        componentName = componentName.toLowerCase();

        if (!componentName in this.components) {
            throw new Error(`${componentName} is not a recognized component name for component type ${this.constructor.name}`);
        }

        if (this.components[componentName].weddellClassInput) {
            this.components[componentName] = this.createChildComponentClass(componentName, this.components[componentName].weddellClassInput);
        }
        var ComponentClass = await this.components[componentName];

        var opts = defaults({
            consts: defaults({
                $componentID: ComponentClass._id,
                $instanceKey: index
            })
        }, componentOpts);

        var snapshot;

        if (this._componentSnapshots && this._componentSnapshots[componentName] && (snapshot = this._componentSnapshots[componentName][index])) {
            Object.assign(opts, this.extractSnapshotOpts(snapshot));
        }

        var instance = new ComponentClass(opts);
        this.addComponentEvents(componentName, instance, index);

        instance.on('requestpatch', evt => {
            this._componentsRequestingPatch.push(instance);
            this.trigger('requestpatch', Object.assign({}, evt));
        });

        return instance;
    }

    getComponentInstance(componentName, index) {
        componentName = componentName.toLowerCase()
        var instances = this._componentInstances[componentName];
        return instances[index];
    }

    async getInitComponentInstance(componentName, index) {
        componentName = componentName.toLowerCase()
        var instance = this.getComponentInstance(componentName, index);
        if (!instance) {
            var instance = this._componentInstances[componentName][index] = await this.makeComponentInstance(componentName, index);
            return instance
                .init(this.components[componentName]._initOpts);
        }

        return instance
    }

    cleanupComponentInstances() {
        //TODO right now, if a component becomes unused, it will continue to sit in memory and possibly generate events. We should probably clean them up.
    }
}

module.exports = Component;
