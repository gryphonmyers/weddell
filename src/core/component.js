var EventEmitterMixin = require('./event-emitter-mixin');
var defaults = require('object.defaults/immutable');
var generateHash = require('../utils/make-hash');
var mix = require('mixwith-es5').mix;
var DeDupe = require('mixwith-es5').DeDupe;
// var Sig = require('./sig');
var includes = require('../utils/includes');
var difference = require('../utils/difference');
var compact = require('array-compact');
var h = require('virtual-dom/h');
var svg = require('virtual-dom/virtual-hyperscript/svg');
// Sig.addTypeAlias('CSSString', 'String');

class VDOMWidget {

    constructor(opts) {
        this.type = 'Widget';
        // this.WeddellComponentClass = opts.WeddellComponentClass;
        this.weddellComponent = null;
        this.parentWeddellComponent = opts.parentWeddellComponent;
        this.weddellComponentName = opts.weddellComponentName;
        this.weddellComponentIndex = opts.weddellComponentIndex;
        this.content = opts.content;
        this.props = opts.props;

        this.vTree = opts.vTree;
        this.onUpdate = opts.onUpdate;
        this.onInit = opts.onInit;
        this.componentID = opts.componentID;
    }
    
    init() {
        this.weddellComponent = this.parentWeddellComponent
            .makeComponentInstance(this.weddellComponentName, this.weddellComponentIndex);

        this._componentInstances[this.weddellComponentName] = this.weddellComponent;

        this.parentWeddellComponent._componentInstances

            // node.properties.attributes[this.constructor.Weddell.consts.INDEX_ATTR_NAME]) || renderedComponents[componentEntry[0]].length

        var el = this.vTree ? createElement(this.vTree) : null;

        if (this.onInit) {
            this.onInit(el, this);
        }
        return el;
    }

    update(previousWidget, prevDOMNode) {
        if (Array.isArray(this.vTree)) {
            throw "Cannot render a component with multiple nodes at root!";
        }

        var patches = VDOMDiff(previousWidget.vTree, this.vTree);
        var el = VDOMPatch(prevDOMNode, patches);

        if (el && patches) {
            if (this.onUpdate) {
                this.onUpdate(el, this, patches)
            }
        }
        return el;
    }

    destroy(DOMNode) {

    }
}

var defaultOpts = {
    components: {},
    store: {},
    state: {},
    inputs: [],
    isRoot: false,
    // stylesFormat: 'CSSString'
};
var defaultInitOpts = {};
var _generatedComponentClasses = [];
var testElement = document.createElement('div');

var Component = class extends mix(Component).with(EventEmitterMixin) {
    constructor(opts) {
        opts = defaults(opts, defaultOpts);
        super(opts);
        // Sig = this.constructor.Weddell.classes.Sig;
        // var Pipeline = this.constructor.Weddell.classes.Pipeline;
        var Store = this.constructor.Weddell.classes.Store;

        Object.defineProperties(this, {
            isRoot: { value: opts.isRoot },
            root: {value: opts.isRoot ? this : opts.root },
            _renderMethods: {writeable:true, value: {
                markup: 'renderMarkup',
                styles: 'renderStyles'
            }},
            _inlineEventHandlers: { writable: true, value: {} },
            _isMounted: {writable:true, value: false},
            _renderPromise: {writable:true, value: null},
            _lastRenderedComponentClasses: {writable: true, value:null},
            renderPromise: {get: () => {
                return this._renderPromise || (opts.parentComponent ? opts.parentComponent.renderPromise : null)
            }},
            _hasMounted: {writable:true, value: false},
            _hasRendered: {writable:true, value: false},
            _isInit: { writable: true, value: false},
            defaultInitOpts: { value: defaults(opts.defaultInitOpts, defaultInitOpts) },
            _id : { value: generateHash() },
            inputs : { value: compact(opts.inputs) },
            renderers: { value: {} },
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
        
        Object.defineProperty(this, 'state', {
            value: new Store(defaults({
                $attributes: null,
                $id: () => this._id
            }, opts.state), {
                overrides: [this.props],
                proxies: [this.store]
            })
        })

        Object.defineProperties(this, {
            _componentInstances: { value:
                Object.keys(opts.components)
                    .map(key => key.toLowerCase())
                    .reduce((final, key) => {
                        final[key] = {};
                        return final;
                    }, {})
            },
            _locals: {value: new Store({}, { proxies: [this.state, this.store], shouldMonitorChanges: false, shouldEvalFunctions: false})}
        });

        // Object.defineProperty(this, '_pipelines', {
        //     value: {
        //         markup: new Pipeline({
        //             name: 'markup',
        //             store: this._locals,
        //             onRender: this.onRenderMarkup.bind(this),
        //             isDynamic: !!opts.markupTemplate,
        //             inputFormat: new Sig(opts.markupFormat),
        //             transforms: opts.markupTransforms,
        //             targetRenderFormat: opts.targetMarkupRenderFormat,
        //             input: opts.markupTemplate ? opts.markupTemplate.bind(this) : (opts.markup || null)
        //         }),
        //         styles: new Pipeline({
        //             name: 'styles',
        //             store: this._locals,
        //             onRender: this.onRenderStyles.bind(this),
        //             isDynamic: !!opts.stylesTemplate,
        //             inputFormat: new Sig(opts.stylesFormat),
        //             transforms: opts.stylesTransforms,
        //             targetRenderFormat: opts.targetStylesRenderFormat,
        //             input: opts.stylesTemplate ? opts.stylesTemplate.bind(this) : (opts.styles || ' ')
        //         })
        //     }
        // });

        Object.defineProperty(this, 'components', {
            value: Object.entries(opts.components)
                .map(entry => [entry[0].toLowerCase(), entry[1]])
                .reduce((final, entry) => {
                    final[entry[0]] = this.createChildComponentClass(entry[0], entry[1])
                    return final;
                }, {})
        })

        // Object.entries(this._pipelines).forEach(entry =>
        //     entry[1].on('markeddirty', evt => {
        //         this.trigger('markeddirty', Object.assign({
        //             pipeline: entry[1],
        //             pipelineName: entry[0]
        //         }, evt))
        //     })
        // );

        ['props', 'state'].forEach((propName) => {
            this[propName].on('change', evt => {
                if (evt.target !== this[propName]) {
                    if (this.checkChangedKey(evt.changedKey)) {
                        this.scheduleRender();
                    }
                }
            })
        });

        this.on('componentschange', evt => {
            this.markDirty(null, 'styles');
        });

        // this.on('markeddirty', evt => {
        //     //if it's a markup render, render both
        //     this.scheduleRender(evt.pipelineName === 'markup' ? null : evt.pipelineName);
        // });

        this.getParent = () => opts.parentComponent || null;

        this.vNodeTemplate = this.constructor.makeVNodeTemplate(opts.markup, this.constructor.markup);
        this.stylesTemplate = this.constructor.makeStylesTemplate(opts.styles, this.constructor.styles);
        this.vTree = null;
        this.vDOMWidget = null;
        // this.constructor.mountedInstances = ;
        
        this.constructor.instances[this._id] = this;

        window[this.constructor.Weddell.consts.VAR_NAME].components[this._id] = this;
    }

    static get mountedInstances() {
        return staticProps.mountedInstaces;
    }


    static get mountedComponents() {
        return {};
        return this._
    }

    static set mountedComponents(val) {
        this._mountedComponents = {};
    }

    static makeVNodeTemplate(input, staticInput) {
        /*
        * Take instance and static template inputs, return a function that will generate the correct output.
        */

        return [input, staticInput].reduce((acc, curr) => {
            if (!acc) {
                if (typeof curr === 'function') {
                    return curr;
                }
                if (typeof curr === 'string') {
                    //TODO support template string parser;
                }
            }
            return acc;
        }, null);
    }

    static makeStylesTemplate(input) {
        if (this.constructor.styles) {

        }
    }

    renderVNode() {
        var accessed = {};
        
        this.state.on('get', evt => {
            accessed[evt.changedKey] = 1;
        });

        var vTree = this.vNodeTemplate.call(this, this.store, h);

        if (Array.isArray(vTree)) {
            if (vTree.length > 1) {
                console.warn('Template output was truncated in', this.constructor.name, 'component. Component templates must return a single vNode!');
            }            
            vTree = vTree[0];
        }
        
        this.vTree = this.replaceComponentPlaceholders(vTree);
    }

    replaceComponentPlaceholders(vNode) {
        var components;
        var componentName = vNode.tagName.toLowerCase();

        if (componentName === 'content') {
            return this.vDOMWidget.content;
        } else if (componentName in (components = this.collectComponentTree())) {
            var props = vNode.properties.attributes;
            var content = vNode.children;

            return this.getInitComponentInstance()
                .then(instance => {
                    return new VDOMWidget({
                        parentWeddellComponent: this,
                        weddellComponentName: componentName,
                        content,
                        props
                    });
                });
                            
        } else if (vNode.children) {
            var didChange = false;
            var children = vNode.children.reduce((acc, child) => {
                var newChild = this.replaceComponentPlaceholders(child);
                if (newChild !== child) {
                    didChange = true;
                }
                if (newChild) {
                    return acc.concat(newChild);
                }
                return acc;
            }, []);

            if (didChange) {
                var properties = Object.assign({}, vNode.properties, {
                    key: vNode.key
                });
                var hfunc = vNode.namespace ? svg : h;
                //TODO convert h nodes with namespace even if no children
                return hfunc(vNode.tagName, properties, children);
            }
        }
        return vNode;
    }

    renderStyles() {
        this.constructor.styles

        //Render static styles

    }

    checkChangedKey(key) {
        
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

    onInit() {
        //Default event handler, noop
    }

    // onRenderMarkup() {
    //     //Default event handler, noop
    // }

    // onRenderStyles() {
    //     //Default event handler, noop
    // }

    addTagDirective(name, directive) {
        this._tagDirectives[name.toUpperCase()] = directive;
    }

    static get generatedComponentClasses() {
        return _generatedComponentClasses;
    }

    static set generatedComponentClasses(val) {
        return _generatedComponentClasses = val;
    }

    makeComponentClass(ComponentClass) {
        if (ComponentClass.prototype && (ComponentClass.prototype instanceof this.constructor.Weddell.classes.Component || ComponentClass.prototype.constructor === this.constructor.Weddell.classes.Component)) {
            return ComponentClass;
        } else if (typeof ComponentClass === 'function') {
            // We got a non-Component class function, so we assume it is a component factory function
            var match = this.constructor.generatedComponentClasses.find(compClass => compClass.func === ComponentClass);
            if (match) {
                return match.class;
            } else {
                var newClass = ComponentClass.call(this, this.constructor.Weddell.classes.Component)
                this.constructor.generatedComponentClasses.push({
                    func: ComponentClass,
                    class: newClass
                });
                newClass._id = generateHash();
                return newClass;
            }
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

        ChildComponent = this.makeComponentClass(ChildComponent);

        var parentComponent = this;
        var root = this.root;
        // var targetMarkupRenderFormat = this._pipelines.markup.inputFormat.parsed.returns || this._pipelines.markup.inputFormat.parsed.type;
        // var targetStylesRenderFormat = this._pipelines.styles.inputFormat.parsed.returns || this._pipelines.styles.inputFormat.parsed.type;
        // var markupTransforms = this._pipelines.markup.transforms;
        // var stylesTransforms = this._pipelines.styles.transforms;

        var obj = {};

        obj[componentName] = class extends ChildComponent {
            constructor(opts) {
                super(defaults({
                    root,
                    parentComponent,
                    // targetMarkupRenderFormat,
                    // targetStylesRenderFormat,
                    // markupTransforms,
                    // stylesTransforms
                }, opts))

                parentComponent.trigger('createcomponent', {component: this, parentComponent, componentName});

                this.on('createcomponent', evt => {
                    parentComponent.trigger('createcomponent', Object.assign({}, evt));
                });
            }
        }

        this.trigger('createcomponentclass', { ComponentClass: obj[componentName] });
        obj[componentName]._BaseClass = ChildComponent;
        obj[componentName]._initOpts = initOpts;
        obj[componentName]._inputMappings = inputMappings;
        obj[componentName]._id = generateHash();

        return obj[componentName];
    }

    init(opts) {
        opts = defaults(opts, this.defaultInitOpts);
        if (!this._isInit) {
            this._isInit = true;
            return Promise.resolve(this.onInit(opts))
                .then(() => {
                    this.trigger('init');
                    return this;
                });
        }
        return Promise.resolve(this);
    }

    requestRender() {
        this.trigger('wantsrender')
        var parent = this.getParent();
        if (parent) {
            parent.requestRender();
        }
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

    // scheduleRender(pipelineName) {
    //     return (pipelineName ? [pipelineName] : Object.keys(this._pipelines))
    //         .map((pipelineName) => {
    //             return this.trigger('wantsrender', {pipelineName});
    //         });   
    // }

    // markDirty(changedKey, pipelineName) {
    //     return (pipelineName ? [[pipelineName, this._pipelines[pipelineName]]] : Object.entries(this._pipelines))
    //         .map((entry) => {
    //             return entry[1].markDirty(changedKey);
    //         });
    // }

    // renderStyles() {
    //     this.trigger('beforerenderstyles');

    //     return this._pipelines.styles.render()
    //         .then(output => {
    //             return Promise.all(this.getMountedChildComponents().map(instance => instance.renderStyles()))
    //                 .then(components => {
    //                     var evtObj = {
    //                         component: this,
    //                         components,
    //                         wasRendered: true,
    //                         renderFormat: this._pipelines.styles.targetRenderFormat
    //                     };

    //                     Object.defineProperties(evtObj, {
    //                         staticStyles: {
    //                             enumerable: true,
    //                             get: function(){
    //                                 return this.constructor.styles || null;
    //                             }.bind(this)
    //                         },
    //                         output: {
    //                             enumerable: true,
    //                             get: function(){
    //                                 return output
    //                             }
    //                         }
    //                     })

    //                     this.trigger('renderstyles', evtObj);

    //                     return evtObj;
    //                 });
    //         });
    // }

    getMountedChildComponents() {
        return Object.entries(this.components)
            .reduce((finalArr, entry) => {
                return Object.values(this._componentInstances[entry[0]])
                    .filter(instance => instance._isMounted)
                    .concat(finalArr);
            }, [])
    }

    // render(pipelineType) {
    //     this.trigger('beforerender');

    //     if (!pipelineType) {
    //         return Promise.all(Object.keys(this._pipelines).map(pipelineType => this.render.call(this, pipelineType)));
    //     }
    //     var pipeline = this._pipelines[pipelineType];
    //     var args =  Array.from(arguments).slice(1);

    //     var output = this[this._renderMethods[pipelineType]].apply(this, args);

    //     return Promise.resolve(output)
    //         .then(evt => {
    //             this.trigger('render', Object.assign({}, evt));
    //             return evt;
    //         });
    // }

    assignProps(props, parentScope) {
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

    // renderMarkup(content, props, targetFormat, parentScope) {
    //     this.trigger('beforerendermarkup');

    //     var pipeline = this._pipelines.markup;

    //     if (!targetFormat) {
    //         targetFormat = pipeline.targetRenderFormat;
    //     }
        
    //     if (props) {
    //         this.assignProps(props, parentScope)
    //     }

    //     var components = [];
    //     var off = this.on('rendercomponent', componentResult => {
    //         if (!(componentResult.componentName in components)) {
    //             components[componentResult.componentName] = [];
    //         }
    //         components[componentResult.componentName].push(componentResult)
    //         components.push(componentResult);
    //     });
    //     return new Promise((resolve, reject) => {
    //         requestAnimationFrame(() => {
    //             Promise.resolve()
    //                 .then(() => {
    //                     if (!this._isMounted) {
    //                         this._isMounted = true;
    //                         return this.onMount ? this.onMount.call(this) : null;
    //                     }
    //                 })
    //                 .then(() => {
    //                     if (!this._hasMounted) {
    //                         this._hasMounted = true;
    //                         return this.onFirstMount ? this.onFirstMount.call(this) : null;
    //                     }
    //                 })
    //                 .then(() => pipeline.render(targetFormat))
    //                 .then(output => {
    //                     var renderFormat = targetFormat.val;
    //                     if (!(renderFormat in this.renderers)) {
    //                         throw "No appropriate component markup renderer found for format: " + renderFormat;
    //                     }
    //                     return this.renderers[renderFormat].call(this, output, content)
    //                         .then(output => {
    //                             off();
    //                             var evObj = {
    //                                 output,
    //                                 component: this,
    //                                 id: this._id,
    //                                 components,
    //                                 renderFormat
    //                             };
        
    //                             var componentClasses = components.map(comp => comp.componentOutput.component.constructor._BaseClass);
        
    //                             if (this._lastRenderedComponentClasses  && this._lastRenderedComponentClasses.length && difference(componentClasses, this._lastRenderedComponentClasses).length) {
    //                                 this.trigger("componentschange", {componentClasses, components})
    //                             }
    //                             this._lastRenderedComponentClasses = componentClasses;
        
    //                             return Promise.all(
    //                                     Object.entries(this._componentInstances)
    //                                         .reduce((finalArr, entry) => {
    //                                             var componentInstances = Object.values(entry[1]);
    //                                             var componentName = entry[0];
    //                                             var renderedComponents = (components[componentName] || components[componentName.toUpperCase()] || []);
        
    //                                             return finalArr.concat(
    //                                                 componentInstances.filter(instance => renderedComponents.every(renderedComponent => {
    //                                                     return renderedComponent.componentOutput.component !== instance
    //                                                 }))
    //                                             );
    //                                         }, [])
    //                                         .map(unrenderedComponent => unrenderedComponent.unmount())
    //                                 )
    //                                 .then(() => {
    //                                     this.trigger('rendermarkup', Object.assign({}, evObj));
    //                                     return evObj;
    //                                 });
    //                         });
    //                 })
    //                 .then(output => {
    //                     if (!this._hasRendered) {
    //                         this._hasRendered = true;
    //                         return Promise.resolve(this.onFirstRender ? this.onFirstRender.call(this) : null)
    //                             .then(() => output);
    //                     }
    //                     return output;
    //                 })
    //                 .then(resolve);
    //         })
    //     })
    // }

    addComponentEvents(componentName, childComponent, index) {
        var componentKeyIndex;
        if (this.constructor.componentEventListeners && (componentKeyIndex = Object.keys(this.constructor.componentEventListeners).map(key => key.toLowerCase()).indexOf(componentName)) > -1) {
            if (!(componentName in this._componentListenerCallbacks)) {
                this._componentListenerCallbacks[componentName] = {}
            }
            this._componentListenerCallbacks[componentName][index] = Object.entries(this.constructor.componentEventListeners[Object.keys(this.constructor.componentEventListeners)[componentKeyIndex]])
                .map(entry => {
                    return childComponent.on(entry[0], function() {
                        if (childComponent._isMounted) {
                            entry[1].apply(this, Array.from(arguments).concat(childComponent));
                        }
                    }.bind(this))
                })
        }
    }

    markRendering(promise) {
        this._renderPromise = promise ? promise : null;
    }

    // unmount() {
    //     return Promise.all(
    //             Object.values(this._componentInstances)
    //                 .reduce((finalArr, components) => {
    //                     return finalArr.concat(Object.values(components));
    //                 }, [])
    //                 .map(component => component.unmount())
    //         )
    //         .then(() => {
    //             for (var eventName in this._inlineEventHandlers) {
    //                 this._inlineEventHandlers[eventName].off();
    //                 delete this._inlineEventHandlers[eventName];
    //             }
    //             if (this._isMounted) {
    //                 this._isMounted = false;
    //                 this.trigger('unmount');
    //                 if (this.onUnmount) {
    //                     return this.onUnmount.call(this);
    //                 }
    //             }
    //         })
    // }

    makeComponentInstance(componentName, index, opts) {
        componentName = componentName.toLowerCase();
        var instance = new (this.components[componentName])({
            store: defaults({
                $componentID: this.components[componentName]._id,
                $instanceKey: index
            })
        });
        this.addComponentEvents(componentName, instance, index);
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
                .init(this.components[componentName]._initOpts)
                .then(() => instance);
        }

        return Promise.resolve(instance);
    }

    cleanupComponentInstances() {
        //TODO right now, if a component becomes unused, it will continue to sit in memory and possibly generate events. We should probably clean them up.
    }
}

module.exports = Component;
