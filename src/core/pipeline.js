var EventEmitterMixin = require('./event-emitter-mixin');
var mix = require('mixwith').mix;

var inputCache = {};

var Pipeline = class extends mix(Pipeline).with(EventEmitterMixin) {
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
            _cache: {writable: true},
            _watchedProperties: {value: {}, writable: true},
            _promise: {value: Promise.resolve(), writable: true},
            _requestHandle: {value: null, writable: true},
            _currentResolve: {value: null, writable: true},
            inputFormat: { value: new Sig(opts.inputFormat) },
            _isDynamic: { value: opts.isDynamic, writable: true },
            transforms: { value: opts.transforms, writable: true },
            targetRenderFormat: { value: new Sig(opts.targetRenderFormat) }
        });
    }

    addTransform(transform) {
        if (this.transforms.indexOf(transform) === -1) {
            this.transforms = this.transforms.concat(transform);
        }
    }

    getTemplate(targetRenderFormat) {
        if (!(this.targetRenderFormat in inputCache)) {
            inputCache[this.targetRenderFormat] = {input:[], processed: [] };
        }
        
        if (this.input) {
            var ii = -1
            var ii = inputCache[this.targetRenderFormat].input.indexOf(this.input);
            if (ii === -1) {
                ii = inputCache[this.targetRenderFormat].input.length;
                inputCache[this.targetRenderFormat].input.push(this.input);
                inputCache[this.targetRenderFormat].processed.push(this.processInput(targetRenderFormat));
            }
            return inputCache[this.targetRenderFormat].processed[ii];
        }

        return null;        
    }

    processInput(targetRenderFormat) {
        var input = this.input;
        var Transform = this.constructor.Weddell.classes.Transform;
        var Sig = this.constructor.Weddell.classes.Sig;
        var transforms;
        var inputFormat = this.inputFormat;
        var template;
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
                        var result = Transform.getTransformPath(this.transforms, returnType, targetRenderFormat);
                        if (result) {
                            templateTransform = transform;
                        }
                    }
                    return finalVal || result;
                }, null);
            if (!transforms) {
                throw "Could not find a tranform path from " + this.inputFormat.validated + ' to ' + targetRenderFormat.validated;
            }
            template = Transform.compose(templateTransform.applyTransform(input), transforms);
        } else if (this._isDynamic && inputFormat.parsed.type === 'function') {
            var returnType = new Sig(this.inputFormat.parsed.returns);
            transforms = this.transforms
                .reduce((finalVal, transform) => {
                    return finalVal || Transform.getTransformPath(this.transforms, returnType, targetRenderFormat);
                }, null);
            template = Transform.compose(input, transforms);
        } else {
            transforms = Transform.getTransformPath(this.transforms, this.inputFormat, targetRenderFormat);

            if (!transforms){
                throw "Could not find appropriate transform for " + this.inputFormat.validated + " to " + targetRenderFormat.validated;
            }

            template = function(){ return Transform.applyTransforms(input, transforms) };
        }

        return template;
    }

    markDirty(changedKey) {
        if (!this.isDirty && (!changedKey || (changedKey in this._watchedProperties))) {
            this.isDirty = true;
            this.trigger('markeddirty', {changedKey});
            return true;
        }
        return false;
    }

    callTemplate(locals, template) {
        return template.call(this, locals);
    }

    render(targetFormat) {
        if (this.isDirty || typeof this._cache === 'undefined') {
            var Sig = this.constructor.Weddell.classes.Sig;
            var template = this.getTemplate(targetFormat ? new Sig(targetFormat) : this.targetRenderFormat);
            var accessed = {};
            var off = this._store.on('get', function(evt){
                accessed[evt.key] = 1;
            });
            var output = template ? this.callTemplate(this._store, template) : this.static || null;
            //TODO this could potentially miss some changed keys if they are accessed inside a promise callback within the template. We can't turn the event listener off later though, because then we might catch some keys accessed by other processes. a solution might be to come up with a way to only listen for keys accessed by THIS context
            off();
            this._watchedProperties = accessed;
            this.isDirty = false;
            return Promise.resolve(this.onRender ? this.onRender.call(this, output) : null)
                .then(() => output)
                .then(output => {
                    this._cache = output
                    this.trigger('render', {output});
                    return output;
                });
        }
        return Promise.resolve(this._cache);
    }
}

module.exports = Pipeline;
