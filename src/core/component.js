var EventEmitterMixin = require('./event-emitter-mixin');
var defaults = require('object.defaults/immutable');
var generateHash = require('../utils/make-hash');
var mix = require('mixwith-es5').mix;
var DeDupe = require('mixwith-es5').DeDupe;
var Sig = require('./sig');
var includes = require('../utils/includes');

Sig.addTypeAlias('CSSString', 'String');

var defaultOpts = {
    components: {},
    store: {},
    state: {},
    inputs: [],
    isRoot: false,
    stylesFormat: 'CSSString'
};

var defaultInitOpts = {};

var _generatedComponentClasses = [];

var Component = class extends mix(Component).with(EventEmitterMixin) {
    constructor(opts) {
        opts = defaults(opts, defaultOpts);
        super(opts);
        Sig = this.constructor.Weddell.classes.Sig;
        var Pipeline = this.constructor.Weddell.classes.Pipeline;
        var Store = this.constructor.Weddell.classes.Store;

        Object.defineProperties(this, {
            isRoot: { value: opts.isRoot },
            _isMounted: {writable:true, value: false},
            _hasMounted: {writable:true, value: false},
            _isInit: { writable: true, value: false},
            defaultInitOpts: { value: defaults(opts.defaultInitOpts, defaultInitOpts) },
            _id : { value: generateHash() },
            inputs : { value: opts.inputs },
            renderers: { value: {} },
            _tagDirectives: { value: {} },
            _componentListenerCallbacks: {value:{}, writable:true}
        });

        var inputMappings = this.constructor._inputMappings ? Object.entries(this.constructor._inputMappings)
                .filter(entry => this.inputs.find(input => input === entry[0]))
                .reduce((final, entry) => {
                    final[entry[1]] = entry[0];
                    return final;
                }, {}) : {};

        Object.defineProperties(this, {
            props: {
                value: new Store(this.inputs, {
                    shouldMonitorChanges: true,
                    extends: (opts.parentComponent ? [opts.parentComponent.props, opts.parentComponent.state, opts.parentComponent.store] : null),
                    inputMappings,
                    shouldEvalFunctions: false
                })
            },
            store: {
                value: new Store(Object.assign({
                    $bind: this.bindEvent.bind(this),
                    $bindValue: this.bindEventValue.bind(this),
                    $act: this.createAction.bind(this)
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
                Object.keys(opts.components).reduce((final, key) => {
                    final[key] = {};
                    return final;
                }, {})
            },
            _locals: {value: new Store({}, { proxies: [this.state, this.store], shouldMonitorChanges: false, shouldEvalFunctions: false})}
        });

        Object.defineProperty(this, '_pipelines', {
            value: {
                markup: new Pipeline({
                    name: 'markup',
                    store: this._locals,
                    onRender: this.onRenderMarkup.bind(this),
                    isDynamic: !!opts.markupTemplate,
                    inputFormat: new Sig(opts.markupFormat),
                    transforms: opts.markupTransforms,
                    targetRenderFormat: opts.targetMarkupRenderFormat,
                    input: opts.markupTemplate || opts.markup || null
                }),
                styles: new Pipeline({
                    name: 'styles',
                    store: this._locals,
                    onRender: this.onRenderStyles.bind(this),
                    isDynamic: !!opts.stylesTemplate,
                    inputFormat: new Sig(opts.stylesFormat),
                    transforms: opts.stylesTransforms,
                    targetRenderFormat: opts.targetStylesRenderFormat,
                    input: opts.stylesTemplate || opts.styles || ' '
                })
            }
        });

        Object.defineProperty(this, 'components', {
            value: Object.entries(opts.components).reduce((final, entry) => {
                final[entry[0]] = this.createChildComponentClass(entry[0], entry[1])
                return final;
            }, {})
        })

        Object.entries(this._pipelines).forEach(entry =>
            entry[1].on('markeddirty', evt => {
                this.trigger('markeddirty', Object.assign({
                    pipeline: entry[1],
                    pipelineName: entry[0]
                }, evt))
            })
        );

        ['props', 'state'].forEach((propName) => {
            this[propName].on('change', evt => {
                this.markDirty(evt.changedKey);
            })
        });

        window[this.constructor.Weddell.consts.VAR_NAME].components[this._id] = this;
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
        return this.awaitEvent('renderdommarkup')
            .then(() => val);
    }

    createAction(actionName, actionData) {
        this.trigger('createaction', {actionName, actionData});
    }

    onInit() {
        //Default event handler, noop
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
        var targetMarkupRenderFormat = this._pipelines.markup.inputFormat.parsed.returns || this._pipelines.markup.inputFormat.parsed.type;
        var targetStylesRenderFormat = this._pipelines.styles.inputFormat.parsed.returns || this._pipelines.styles.inputFormat.parsed.type;
        var markupTransforms = this._pipelines.markup.transforms;
        var stylesTransforms = this._pipelines.styles.transforms;;

        var obj = {};

        obj[componentName] = class extends ChildComponent {
            constructor(opts) {
                super(defaults({
                    parentComponent,
                    targetMarkupRenderFormat,
                    targetStylesRenderFormat,
                    markupTransforms,
                    stylesTransforms
                }, opts))

                parentComponent.trigger('createcomponent', {component: this, parentComponent, componentName});

                this.on('createcomponent', evt => {
                    parentComponent.trigger('createcomponent', Object.assign({}, evt));
                });

                this.on('markeddirty', evt => {
                    parentComponent.markDirty();
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

    markDirty(changedKey) {
        return Object.values(this._pipelines).forEach((pipeline, pipelineType) => {
            pipeline.markDirty(changedKey);
        });
    }

    renderStyles() {
        this.trigger('beforerenderstyles');

        return this._pipelines.styles.render()
            .then(output => {
                return Promise.all(Object.entries(this.components).map(entry => {
                        var mountedComponents = Object.values(this._componentInstances[entry[0]]).filter(instance => instance._isMounted);

                        return Promise.all(mountedComponents.map(instance => instance.renderStyles()));
                    }))
                    .then(components => {
                        var evtObj = {
                            output,
                            staticStyles: this.constructor.styles || null,
                            component: this,
                            components,
                            wasRendered: true,
                            renderFormat: this._pipelines.styles.targetRenderFormat
                        };

                        this.trigger('renderstyles', Object.assign({}, evtObj));

                        return evtObj;
                    });
            });
    }

    render(pipelineType) {
        this.trigger('beforerender');

        if (!pipelineType) {
            return Promise.all(Object.keys(this._pipelines).map(pipelineType => this.render.call(this, pipelineType)));
        }
        var pipeline = this._pipelines[pipelineType];
        var args =  Array.from(arguments).slice(1);

        switch(pipelineType) {
            case 'markup':
                var output = this.renderMarkup.apply(this, args);
                break;
            case 'styles':
                output = this.renderStyles.apply(this, args);
                break;
            default:
        }

        return Promise.resolve(output)
            .then(evt => {
                this.trigger('render', Object.assign({}, evt));
                return evt;
            });
    }

    assignProps(props) {
        Object.assign(this.props, Object.entries(props)
            .filter(entry => includes(this.inputs, entry[0]))
            .reduce((finalObj, entry) => {
                finalObj[entry[0]] = entry[1]
                return finalObj
            }, {}));

        this.state.$attributes = Object.entries(props)
            .filter(entry => !includes(this.inputs, entry[0]))
            .reduce((finalObj, entry) => {
                finalObj[entry[0]] = entry[1]
                return finalObj
            }, {});
    }

    renderMarkup(content, props, targetFormat) {
        this.trigger('beforerendermarkup');

        var pipeline = this._pipelines.markup;

        if (!targetFormat) {
            targetFormat = pipeline.targetRenderFormat;
        }

        if (props) {
            this.assignProps(props)
        }

        var components = [];
        var off = this.on('rendercomponent', componentResult => {
            if (!(componentResult.componentName in components)) {
                components[componentResult.componentName] = [];
            }
            components[componentResult.componentName].push(componentResult)
            components.push(componentResult);
        });
        return Promise.resolve((!this._isMounted && this.onMount) ? this.onMount.call(this) : null)
            .then(() => (!this._hasMounted && this.onFirstMount) ? this.onFirstMount.call(this) : null)
            .then(() => {
                if (!this._isMounted) this._isMounted = true;
                if (!this._hasMounted) this._hasMounted = true;
                return pipeline.render(targetFormat);
            })
            .then(output => {
                var renderFormat = targetFormat.val;
                if (!(renderFormat in this.renderers)) {
                    throw "No appropriate component markup renderer found for format: " + renderFormat;
                }
                return this.renderers[renderFormat].call(this, output, content)
                    .then(output => {
                        off();
                        var evObj = {
                            output,
                            component: this,
                            id: this._id,
                            components,
                            renderFormat
                        };

                        return Promise.all(
                                Object.entries(this._componentInstances)
                                    .reduce((finalArr, entry) => {
                                        var componentInstances = Object.values(entry[1]);
                                        var componentName = entry[0];
                                        var renderedComponents = (components[componentName] || components[componentName.toUpperCase()] || []);
                                        return finalArr.concat(componentInstances.filter(instance => renderedComponents.every(renderedComponent => {
                                            return renderedComponent.componentOutput.component !== instance
                                        })));
                                    }, [])
                                    .map(unrenderedComponent => unrenderedComponent.unmount())
                            )
                            .then(() => {
                                this.trigger('rendermarkup', Object.assign({}, evObj));
                                return evObj;
                            });
                    });
            });
    }

    addComponentEvents(componentName, childComponent, index) {
        if (this.constructor.componentEventListeners && this.constructor.componentEventListeners[componentName]) {
            if (!(componentName in this._componentListenerCallbacks)) {
                this._componentListenerCallbacks[componentName] = {}
            }
            this._componentListenerCallbacks[componentName][index] = Object.entries(this.constructor.componentEventListeners[componentName])
                .map(entry => {
                    return childComponent.on(entry[0], function() {
                        if (childComponent._isMounted) {
                            entry[1].apply(this, Array.from(arguments).concat(childComponent));
                        }
                    }.bind(this))
                })
        }
    }

    unmount() {
        return Promise.all(
                Object.values(this._componentInstances)
                    .reduce((finalArr, components) => {
                        return finalArr.concat(Object.values(components));
                    }, [])
                    .map(component => component.unmount())
            )
            .then(() => {
                if (this._isMounted) {
                    this._isMounted = false;
                    this.trigger('unmount');
                    if (this.onUnmount) {
                        return this.onUnmount.call(this);
                    }
                }
            })
    }

    makeComponentInstance(componentName, index, opts) {
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
        var instances = this._componentInstances[componentName]
        if (instances && !(index in instances)) {
            this.markDirty(); //TODO right now we just assume that if the desired component instance doesn't exist that we should mark the whole component dirty. There is a possible optimization in here somewhere.

            return (instances[index] = this.makeComponentInstance(componentName, index)).init(this.components[componentName]._initOpts);
        }
        return Promise.resolve(instances ? instances[index] : null);
    }

    cleanupComponentInstances() {
        //TODO right now, if a component becomes unused, it will continue to sit in memory and possibly generate events. We should probably clean them up.
    }
}

module.exports = Component;
