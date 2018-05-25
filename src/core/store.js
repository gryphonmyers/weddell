var EventEmitterMixin = require('./event-emitter-mixin');
var deepEqual = require('deep-equal');
var defaults = require('object.defaults/immutable');
var includes = require('../utils/includes');
var difference = require('../utils/difference');
var generateHash = require('../utils/make-hash');
var mix = require('mixwith-es5').mix;
var uniq = require('array-uniq');

var defaultOpts = {
    shouldMonitorChanges: true,
    shouldEvalFunctions: true,
    inputMappings: {},
    validators: {}
};

var Store = class extends mix(Store).with(EventEmitterMixin) {
    constructor(data, opts) {
        opts = defaults(opts, defaultOpts);
        super();

        Object.defineProperties(this, {
            _initialCalled: {value:{}, writable:true},
            shouldMonitorChanges: {value: opts.shouldMonitorChanges},
            shouldEvalFunctions: {value: opts.shouldEvalFunctions},
            _data: {configurable: false,value: {}},
            _cache: {value: {}, writable: true},
            _funcProps: {configurable: false,value: {}},
            _funcPropHandlerRemovers: {configurable: false,value: {}},
            _proxyObjs: {configurable: false,value: {}},
            _dependencyKeys: {configurable: false, value: []},
            _proxyProps: {configurable: false,value: {}},
            _firstGet: {writable: true, value: false},
            _validators: {value: opts.validators},
            overrides: { value: Array.isArray(opts.overrides) ? opts.overrides : opts.overrides ? [opts.overrides] : [] },
            proxies: { value: Array.isArray(opts.proxies) ? opts.proxies : opts.proxies ? [opts.proxies] : [] },
            extends: { value: Array.isArray(opts.extends) ? opts.extends : opts.extends ? [opts.extends] : [] },
            inputMappings: { value: opts.inputMappings }
        });

        difference(Object.values(this.inputMappings), Object.keys(data)).forEach(key => {
            this.set(key, null);
        });

        if (data) {
            this.assign(data);
        }

        this.extends.forEach(obj => {
            obj.on('change', function(evt){
                if (evt.changedKey in this.inputMappings) {
                    evt = Object.assign({}, evt);
                    evt.changedKey = this.inputMappings[evt.changedKey];
                    this.trigger('change', evt);
                }
            }.bind(this));

            obj.on('get', function(evt){
                if (evt.key in this.inputMappings) {
                    evt = Object.assign({}, evt);
                    evt.key = this.inputMappings[evt.key];
                    this.trigger('get', evt);
                }
            }.bind(this));
        });

        Object.keys(this.inputMappings).forEach(key => {
            this.set(key, null, true);
        });

        this.proxies.concat(this.overrides).forEach(obj => {
            Object.keys(obj).forEach(key => {
                this.set(key, null, true);
            });

            obj.on('change', evt => {
                this.trigger('change', Object.assign({}, evt));
            });

            obj.on('get', evt => {
                this.trigger('get', Object.assign({}, evt));
            });
        });

        this.on('change', evt => {
            delete this._cache[evt.changedKey];
        });

        Object.seal(this);
    }

    set(key, val, isReadOnly) {
        if (!(key in this)) {
            if (!isReadOnly) {
                var setter = function(newValue) {
                    if (this.shouldMonitorChanges) {
                        var oldValue = this._data[key];
                        if (oldValue && typeof oldValue === "object") {
                            oldValue = Object.assign({}, oldValue);
                        }
                    }

                    if (this.shouldEvalFunctions && typeof newValue === 'function') {
                        this._funcProps[key] = newValue;
                    } else {
                        if (key in this._validators) {
                            var input = this._validators[key];
                            var val = newValue == null ? this.getValue(key) : newValue;
                            if (input.required && val == null) {
                                throw `Required component input missing: ${key}`;
                            }
                            if (input.validator && !input.validator(val)) {
                                throw `Input failed validation: ${key}. Received value: ${val}`;
                            }
                        }
                        this._data[key] = newValue;

                        if (this.shouldMonitorChanges) {

                            if (!deepEqual(newValue, oldValue)) {
                                this.trigger('change', {target: this, changedKey: key, newValue, oldValue});
                            }
                        }
                    }

                }.bind(this);
            }

            Object.defineProperty(this, key, {
                configurable: false,
                enumerable: true,
                get: function() {
                    var value = this.getValue(key);
                    this.trigger('get', {key, value});
                    return value;
                }.bind(this),
                set: setter
            });

            if (!isReadOnly) {
                this[key] = val;
            } else {
                this._data[key] = val;
            }
        }
    }

    getValue(key) {
        var i = 0;
        var val;

        if (this._cache[key]) {
            return this._cache[key];
        }
        if (this.shouldEvalFunctions && !this._firstGet) {
            this._firstGet = true;
            for (var propName in this._funcProps) {
                this[propName];
            }
        }
        if (key in this._funcProps && !this._initialCalled[key]) {
            this._initialCalled[key] = true;
            val = this[key] = this.evaluateFunctionProperty(key);
            this.on('change', evt => {
                if (includes(this._dependencyKeys[key], evt.changedKey)) {
                    this[key] = this.evaluateFunctionProperty(key);
                }
            });
        }
        
        while (this.overrides[i] && (typeof val === 'undefined' || val === null)) {
            val = this.overrides[i][key];
            i++;
        }

        i = 0;
        if (typeof val === 'undefined' || val === null) {
            val = this._data[key];
        }
        
        var mappingEntry = Object.entries(this.inputMappings).find(entry => key === entry[1]);

        while(mappingEntry && this.extends[i] && (typeof val === 'undefined' || val === null)) {
            val = this.extends[i][mappingEntry[0]];
            i++;
        }
        i = 0;
        while (this.proxies[i] && (typeof val === 'undefined' || val === null)) {
            val = this.proxies[i][key];
            i++;
        }
        return val;
    }

    assign(data) {
        if (data) {
            if (Array.isArray(data)) {
                data.forEach(key => this.set(key, null));
            } else {
                Object.entries(data).forEach((entry) => {
                    this.set(entry[0], entry[1])
                });
            }
        }
    }

    await(key) {
        if (Array.isArray(key)) {
            return Promise.all(key.map(subKey => this.await(subKey)));
        }
        return Promise.resolve(this.getValue(key) || new Promise(resolve => {
            var off = this.watch(key, vals => {
                off();
                resolve(vals);
            }, true, true);
        }))
    }

    evaluateFunctionProperty(key) {
        var dependencyKeys = [];
        var off = this.on('get', function(evt){
            dependencyKeys.push(evt.key);
        });
        var result = this._funcProps[key].call(this);
        off();
        this._dependencyKeys[key] = uniq(dependencyKeys);
        return result;
    }

    watch(key, func, shouldWaitForDefined, invokeImmediately) {
        if (typeof shouldWaitForDefined == 'undefined') shouldWaitForDefined = true;
        if (!Array.isArray(key)) {
            key = [key];
        }
        var checkKeys = function(){
            var vals = key.map(currKey=>this[currKey]);
            if (!shouldWaitForDefined || vals.every(val=>typeof val !== 'undefined')) {
                func.apply(this, vals);
            }
        };

        var off = this.on('change', function(evt){
            if (includes(key, evt.changedKey)) {
                checkKeys.call(this);
            }
        });
        if (invokeImmediately) {
            checkKeys.call(this);
        }
        return off;
    }
}

module.exports = Store;
