var EventEmitterMixin = require('./event-emitter-mixin');
var defaults = require('object.defaults/immutable');
var generateHash = require('../utils/make-hash');
var mix = require('mixwith-es5').mix;
var DeDupe = require('mixwith-es5').DeDupe;
var uniq = require('array-uniq');
var compact = require('array-compact');
var Sig = require('./sig');

Sig.addTypeAlias('HTMLString', 'String');
Sig.addTypeAlias('CSSString', 'String');

var defaultOpts = {
    components: {},
    store: {},
    state: {},
    inputs: [],
    outputs: [],
    passthrough: [],
    markupFormat: 'HTMLString',
    stylesFormat: 'CSSString'
};

var defaultInitOpts = {
};

var Component = class extends mix(Component).with(EventEmitterMixin) {
    constructor(opts) {
        opts = defaults(opts, defaultOpts);
        super(opts);
        var Store = this.constructor.Weddell.classes.Store;
        var Pipeline = this.constructor.Weddell.classes.Pipeline;
        this.state = new Store(opts.state);
        this.store = new Store(Object.assign({
            $bind: this.bindEvent.bind(this),
            $component: this.importComponent.bind(this, 'markup')
        }, opts.store), {shouldMonitorChanges: false, shouldEvalFunctions: false});
        this.onInit = opts.onInit;
        this.markupFormat = opts.markupFormat;
        this.components = opts.components;
        this.defaultInitOpts = defaults(opts.defaultInitOpts, defaultInitOpts);

        Object.defineProperties(this, {
            _transformers: {value: []},
            _inputs : {value: opts.inputs},
            _outputs : {value: opts.outputs},
            _passthrough : {value: opts.passthrough},
            inputs: {get: () => uniq(compact(this._inputs.concat(this._passthrough))) },
            outputs: {get: () => uniq(compact(this._outputs.concat(this._passthrough))) },
            _locals : {value: new Store(null, {shouldMonitorChanges: false, shouldEvalFunctions: false})},
            _id : {value: generateHash()},
            _isInit: {writable: true,value: false}
        });
        Object.defineProperty(this, '_pipelines', {
            value: {
                styles: new Pipeline({
                    name: 'styles',
                    inputFormat: opts.stylesFormat,
                    targetRenderFormat: opts.targetStylesRenderFormat,
                    isDynamic: !!opts.stylesTemplate,
                    store: this._locals,
                    transforms: opts.stylesTransforms,
                    input: opts.stylesTemplate || opts.styles || null
                }),
                markup: new Pipeline({
                    name: 'markup',
                    inputFormat: opts.markupFormat,
                    targetRenderFormat: opts.targetMarkupRenderFormat,
                    isDynamic: !!opts.markupTemplate,
                    transforms: opts.markupTransforms,
                    store: this._locals,
                    input: opts.markupTemplate || opts.markup || null
                })
            },
            writable: true
        });
    }

    getOutput(pipelineName) {
        //TODO this should only output currently rendered components, or include a flag indicating whether or not they are rendered
        return {
            output: this._pipelines[pipelineName].import(),
            id: this._id,
            components: Object.values(this.components).map(comp => comp.getOutput(pipelineName))
        };
    }

    init(opts) {
        opts = defaults(opts, this.defaultInitOpts);

        var consts = this.constructor.Weddell.consts;

        if (!('components' in window[consts.VAR_NAME])) {
            Object.defineProperty(window[consts.VAR_NAME], 'components', {value: {}});
        }
        window[consts.VAR_NAME].components[this._id] = this;

        this.state.on('change', this.react.bind(this));
        this.state.proxy([this._locals, this.store], null, null, false);
        this.store.proxy([this._locals, this.state], null, null, true);
        this._locals.proxy([this, this.store, this.state], null, null, true);

        var promise = Promise.resolve();

        if (this.onInit) {
            promise = promise.then(() => {
                return this.onInit.call(this, opts)
            });
        }

        Object.entries(this._pipelines).forEach((entry) => {
            entry[1].on('render', (rendered) => {
                var output = this.getOutput(entry[0]);
                this.trigger('render' + entry[0], output);
                this.trigger('render', Object.assign({pipelineName: entry[0]}, output));
            });
            entry[1].init();
            //TODO bugfix: pipelines are initting twice
        });

        promise = promise
            .then(function(){
                return Promise.all(
                    Object.entries(this.components).map((entry) => {
                        var componentName = entry[0];
                        var component = entry[1];

                        if (Array.isArray(component)) {
                            var componentOpts = component[2];
                            var inputs = component[1];
                            component = component[0];
                        }
                        component = defaults(component, {
                            targetMarkupRenderFormat: this._pipelines.markup.targetRenderFormat,
                            targetStylesRenderFormat: this._pipelines.styles.targetRenderFormat,
                            markupTransforms: this._pipelines.markup.transforms,
                            stylesTransforms: this._pipelines.styles.transforms
                        });

                        component = new this.constructor(component);
                        this.trigger('createcomponent', {component, componentName});

                        component.on(['exit', 'enter'], this.render.bind(this));
                        this.components[componentName] = component;

                        component.on('render', (evt) => {
                            this.render(evt.pipelineName);
                        });

                        return component.init.call(component, componentOpts)
                            .then(function(){
                                if (inputs) {
                                    var prop;
                                    var inputTarget;
                                    var inputTargetKey;
                                    for (var key in inputs) {
                                        prop = inputs[key];
                                        key = key.split('.');
                                        inputTarget = component;

                                        if (this.outputs.indexOf(prop) == -1) {
                                            throw "Attempted to pass invalid output, '" + prop + "' from " + componentName;
                                        }

                                        while (key.length > 1) {
                                            inputTargetKey = key.shift();
                                            inputTarget = inputTarget.components[inputTargetKey];

                                            if (!inputTarget) {
                                                throw "Invalid input path supplied to component with name " + inputTargetKey;
                                            }

                                            if (inputTarget.inputs.indexOf(prop) == -1) {
                                                throw "Attempted to pass protected or nonexistent input, " + prop + " to component, " + inputTargetKey;
                                            }
                                        }

                                        this._locals.proxy([inputTarget._locals, inputTarget.state, inputTarget], prop, key[0], true);
                                    }
                                }
                            }.bind(this));
                    })
                );
            }.bind(this))
            .then(function(){
                this.render();
                this._isInit = true;
            }.bind(this));

        return promise;
    }

    bindEvent(funcText, opts) {
        var consts = this.constructor.Weddell.consts;
        return "(function(event){" +
            (opts && opts.preventDefault ? 'event.preventDefault();' : '') +
            (opts && opts.stopPropagation ? 'event.stopPropagation();' : '') +
            funcText + ";}.bind(window['" + consts.VAR_NAME + "'].components['" + this._id + "'], event)())";
    }

    importComponent(pipelineName, componentName) {
        if (!componentName in this.components) {
            console.warn("No component with name", componentName);
            return;
        }
        return this.components[componentName]._pipelines[pipelineName].import();
    }

    react(evt) {
        this.render(null, evt.changedKey);
    }

    render(pipelineName, changedKey) {
        var pipelines = pipelineName ? [this._pipelines[pipelineName]] : Object.values(this._pipelines);
        pipelines.forEach((pipeline) => pipeline.render(changedKey));
    }
}

module.exports = Component;
