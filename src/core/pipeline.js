var EventEmitterMixin = require('./event-emitter-mixin');
var mix = require('mixwith-es5').mix;

var Renderer = class extends mix(Renderer).with(EventEmitterMixin) {
    constructor(opts) {
        super(opts);
        var Sig = this.constructor.Weddell.classes.Sig;
        Object.defineProperties(this, {
            isDirty: {value: false, writable: true},
            name: {value: opts.name},
            template: {value: null, writable: true},
            input: {value: opts.input, writable: true},
            static: {value: null, writable: true},
            onRender: {value: opts.onRender},
            _store: {value: opts.store},
            _cache: {value: null, writable: true},
            _watchedProperties: {value: {}, writable: true},
            _promise: {value: Promise.resolve(), writable: true},
            _requestHandle: {value: null, writable: true},
            _currentResolve: {value: null, writable: true},
            inputFormat: { value: new Sig(opts.inputFormat) },
            _isDynamic: { value: opts.isDynamic, writable: true },
            transforms: {value: opts.transforms, writable: true},
            targetRenderFormat: {value: new Sig(opts.targetRenderFormat) }
        });
    }

    init() {
        if (this.input) {
            this.processInput();
        }
    }

    processInput(input) {
        var input = this.input;
        var Transform = this.constructor.Weddell.classes.Transform;
        var Sig = this.constructor.Weddell.classes.Sig;
        var transforms;
        var inputFormat = this.inputFormat;
        //TODO clean up this mess of a function
        if (this._isDynamic && inputFormat.parsed.type !== 'function') {
            var transforms = Transform.getMatchingTransforms(this.transforms, inputFormat, '(locals:Object, ...Any)=>Any')
            if (!transforms) {
                throw "Could not find appropriate transform to turn " + this.inputFormat + " into a template function.";
            }
            var templateTransform;
            transforms = transforms
                .reduce((finalVal, transform) => {
                    if (!finalVal) {
                        var returnType = new Sig(transform.to.parsed.returns);
                        var result = Transform.getTransformPath(this.transforms, returnType, this.targetRenderFormat);
                        if (result) {
                            templateTransform = transform;
                        }
                    }
                    return finalVal || result;
                }, null);
            if (!transforms) {
                throw "Could not find a tranform path from " + this.inputFormat.validated + ' to ' + this.targetRenderFormat.validated;
            }
            this.template = Transform.compose(templateTransform.applyTransform(input), transforms);
        } else if (this._isDynamic && inputFormat.parsed.type === 'function') {
            var returnType = new Sig(this.inputFormat.parsed.returns);
            transforms = this.transforms
                .reduce((finalVal, transform) => {
                    return finalVal || Transform.getTransformPath(this.transforms, returnType, this.targetRenderFormat);
                }, null);

            if (!this.targetRenderFormat.checkIfMatch(returnType)) {
                if (!transforms) {
                    throw "Could not find a tranform path from " + returnType.validated + ' to ' + this.targetRenderFormat.validated;
                }
                this.template = Transform.compose(input, transforms);
            } else {
                this.template = input;
            }
        } else {
            transforms = Transform.getTransformPath(this.transforms, this.inputFormat, this.targetRenderFormat);

            if (!transforms){
                throw "Could not find appropriate transform for " + this.inputFormat.validated + " to " + this.targetRenderFormat.validated;
            }

            this.static = Transform.applyTransforms(input, transforms);
        }
    }

    markDirty(changedKey) {
        if (!this.isDirty && (!changedKey || changedKey in this._watchedProperties)) {
            this.isDirty = true;
            this.trigger('markeddirty', {changedKey});
            return true;
        }
        return false;
    }

    callTemplate(locals) {
        return this.template.call(this, locals);
    }

    render() {
        if (this.isDirty || !this._cache) {
            var accessed = {};
            var off = this._store.on('get', function(evt){
                accessed[evt.key] = 1;
            });
            var output = this.template ? this.callTemplate(this._store) : this.static;
            //TODO this could potentially miss some changed keys if they are accessed inside a promise callback within the template. We can't turn the event listener off later though, because then we might catch some keys accessed by other processes. a solution might be to come up with a way to only listen for keys accessed by THIS context
            off();
            this._watchedProperties = accessed;

            return Promise.resolve(output ? Promise.resolve(this.onRender ? this.onRender.call(this, output) : output)
                    .then(() => {
                        this.isDirty = false;
                        this._cache = output
                        this.trigger('render', {output});
                        return output;
                    }) : null);
        }
        return Promise.resolve(this._cache);
    }

    import() {
        return this._cache;
    }
}

module.exports = Renderer;
