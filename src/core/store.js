var EventEmitterMixin = require('@weddell/event-emitter-mixin');
var deepEqual = require('deep-equal');
var defaults = require('defaults-es6');
var difference = require('../utils/difference');
var mix = require('@weddell/mixwith').mix;
var uniq = require('array-uniq');

var defaultOpts = {
    shouldMonitorChanges: true,
    shouldEvalFunctions: true,
    inputMappings: {},
    validators: {},
    requireSerializable: true
};

function isSerializable(val) {
    return val && typeof val === 'object' ? 
        (Array.isArray(val) || val.constructor === Object || Object.getPrototypeOf(val) === null) && Object.values(val).every(isSerializable) :
        (val == null || typeof val === 'string' || typeof val === 'boolean' || typeof val === 'number');
}

var Store = class extends mix(Store).with(EventEmitterMixin) {
    constructor(data, opts) {
        opts = defaults(opts, defaultOpts);
        super();

        Object.defineProperties(this, {
            _initialCalled: {value:{}, writable:true},
            shouldMonitorChanges: {value: opts.shouldMonitorChanges},
            shouldEvalFunctions: {value: opts.shouldEvalFunctions},
            requireSerializable: {value: opts.requireSerializable},
            _data: {configurable: false,value: {}},
            _initialState: { value: opts.initialState || {} },
            _cache: {value: {}, writable: true},
            _funcProps: {configurable: false,value: {}},
            _funcPropHandlerRemovers: {configurable: false,value: {}},
            _proxyObjs: {configurable: false,value: {}},
            _dependencyKeys: {configurable: false, value: []},
            _proxyProps: {configurable: false,value: {}},
            _changedKeys: {configurable: false, value: []},
            _firstGetComplete: {writable: true, value: false},
            _validators: {value: opts.validators},
            transform: { value: opts.transform },
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

    transformValue(key, val) {
        return this.transform ? this.transform.call(this, key, val) : val;
    }

    set(key, val, isReadOnly=false) {
        if (!(key in this)) {
            if (!isReadOnly) {
                var setter = function(newValue) {
                    if (this.shouldMonitorChanges) {
                        var oldValue = this._data[key];
                        if (oldValue && typeof oldValue === "object" && !Array.isArray(oldValue)) {
                            oldValue = Object.assign({}, oldValue);
                        }
                    }

                    if (this.shouldEvalFunctions && typeof newValue === 'function') {
                        this._funcProps[key] = newValue;
                    } else {
                        if (this.requireSerializable && !isSerializable(newValue)) {
                            throw new Error(`Setting value for key ${key} failed. Values must be serializable.`);
                        }
                        if (key in this._validators) {
                            var input = this._validators[key];
                            var val = newValue == null ? this.getValue(key) : newValue;
                            if (input.required && val == null) {
                                throw new Error(`Required component input missing: ${key}`);
                            }
                            if (input.validator && !input.validator(val)) {
                                throw new Error(`Input failed validation: ${key}. Received value: ${val}`);
                            }
                        }
                        this._data[key] = newValue;

                        if (this.shouldMonitorChanges) {

                            if (!deepEqual(newValue, oldValue)) {
                                this._changedKeys.push(key);
                                this.trigger('change', { target: this, changedKey: key, newValue: this.transformValue(key, newValue), oldValue: this.transformValue(key, oldValue) });
                            }
                        }
                    }

                }.bind(this);
            }

            Object.defineProperty(this, key, {
                configurable: false,
                enumerable: true,
                get: function() {
                    var value = this.transformValue(key, this.getValue(key));
                    this.trigger('get', {key, value});
                    return value;
                }.bind(this),
                set: setter
            });

            if (!isReadOnly) {
                var initialValue = this._initialState[key];
                if (initialValue != null) {
                    if (this.shouldEvalFunctions && typeof val === 'function') {
                        this[key] = val;
                    } else {
                        this[key] = initialValue;
                    }
                } else {
                    this[key] = val;
                }
            } else {
                this._data[key] = val;
            }
        }
    }

    collectChangedData(includeComputed=true, computedValueFormat='verbose') {
        return uniq(this._changedKeys).reduce((acc, curr) => {
            if (!this.shouldEvalFunctions || includeComputed || !this._funcProps[curr]) {
                if (this.shouldEvalFunctions && this._funcProps[curr]) {
                    switch (computedValueFormat) {
                        case 'verbose':
                            return Object.assign(acc, { 
                                [curr]: {
                                    isComputedValue: true,
                                    lastAccessedKeys: this._dependencyKeys[curr],
                                    value: this._data[curr] 
                                }
                            });
                        case 'simple':
                        default:
                            break;
                    }
                }
                return Object.assign(acc, { [curr]: this._data[curr] })
            }
            return acc;
        }, {})
    }

    getValue(key) {
        var i = 0;
        var val;

        if (this._cache[key]) {
            return this._cache[key];
        }
        if (this.shouldEvalFunctions && !this._firstGetComplete) {
            this._firstGetComplete = true;
            for (var propName in this._funcProps) {
                this[propName];
            }
        }
        if (key in this._funcProps && !this._initialCalled[key]) {
            this._initialCalled[key] = true;

            if (this._initialState[key]) {
                if (this._initialState[key].isComputedValue) {
                    val = this[key] = this._initialState[key].value;
                    this._dependencyKeys[key] = this._initialState[key].lastAccessedKeys;
                } else {
                    val = this[key] = this._initialState[key];
                }
            } else {
                val = this[key] = this.evaluateFunctionProperty(key);
            }
            this.on('change', evt => {
                if (this._dependencyKeys[key].includes(evt.changedKey)) {
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

    assign(data, initialState={}) {
        if (data) {
            if (Array.isArray(data)) {
                data.forEach(key => this.set(key, null));
            } else {
                Object.entries(data).forEach((entry) => {
                    this.set(entry[0], entry[1], false, initialState[entry[0]])
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
            if (key.includes(evt.changedKey)) {
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
