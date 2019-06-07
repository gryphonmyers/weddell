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
    propertySets: {},
    requireSerializable: true
};

function isSerializable(val) {
    return val && typeof val === 'object' ?
        (Array.isArray(val) || val.constructor === Object || Object.getPrototypeOf(val) === null) && Object.values(val).every(isSerializable) :
        (val == null || typeof val === 'string' || typeof val === 'boolean' || typeof val === 'number');
}

/**
 * Class representing a store of key/value pairs. The store class is primarily used to model application state.
 * 
 * @alias Store
 * @static
 * @memberOf Weddell
 */

class WeddellStore extends mix().with(EventEmitterMixin) {

    /**
     * Constructs a store object. One does not generally require or implement the store module directly, but rather implicitly via the various store properties available on components.
     * 
     * @param {object} data Data to write to store.
     * @param {object} opts 
     * @param {boolean} [opts.shouldEvalFunctions=true]
     * @param {boolean} [opts.shouldMonitorChanges=true]
     * @param {boolean} [opts.requireSerializable=true]
     * @param {WeddellStore[]} [opts.overrides]
     * @param {WeddellStore[]} [opts.proxies]
     * @param {WeddellStore[]} [opts.extends]
     * @param {object} [opts.propertySets]
     * @param {Function} [opts.getTransform]
     * @param {Function} [opts.setTransform]
     * @param {object} [opts.validators]
     * @param {object} [opts.initialState]
     * @param {object} [opts.inputMappings]
     */

    constructor(data, opts) {
        opts = defaults(opts, defaultOpts);
        super();

        Object.defineProperties(this, {
            _initialCalled: { value: {}, writable: true },
            shouldMonitorChanges: { value: opts.shouldMonitorChanges },
            shouldEvalFunctions: { value: opts.shouldEvalFunctions },
            requireSerializable: { value: opts.requireSerializable },
            _data: { configurable: false, value: {} },
            _transformedData: { configurable: false, value: {} },
            _initialState: { value: opts.initialState || {} },
            _cache: { value: {}, writable: true },
            _funcProps: { configurable: false, value: {} },
            _funcPropHandlerRemovers: { configurable: false, value: {} },
            _proxyObjs: { configurable: false, value: {} },
            _dependencyKeys: { configurable: false, value: [] },
            _proxyProps: { configurable: false, value: {} },
            _changedKeys: { configurable: false, value: [] },
            _firstGetComplete: { writable: true, value: false },
            _validators: { value: opts.validators },
            getTransform: { value: opts.getTransform },
            setTransform: { value: opts.setTransform },
            overrides: { value: Array.isArray(opts.overrides) ? opts.overrides : opts.overrides ? [opts.overrides] : [] },
            proxies: { value: Array.isArray(opts.proxies) ? opts.proxies : opts.proxies ? [opts.proxies] : [] },
            extends: { value: Array.isArray(opts.extends) ? opts.extends : opts.extends ? [opts.extends] : [] },
            inputMappings: { value: opts.inputMappings },
            propertySets: { value: opts.propertySets }
        });

        difference(Object.values(this.inputMappings), Object.keys(data)).forEach(key => {
            this.set(key, null);
        });

        if (data) {
            this.assign(data);
        }

        this.extends.forEach(obj => {
            obj.on('change', function (evt) {
                if (evt.changedKey in this.inputMappings) {
                    evt = Object.assign({}, evt);
                    evt.changedKey = this.inputMappings[evt.changedKey];
                    this.trigger('change', evt);
                }
            }.bind(this));

            obj.on('get', function (evt) {
                if (evt.key in this.inputMappings) {
                    evt = Object.assign({}, evt);
                    evt.key = this.inputMappings[evt.key];
                    this.trigger('get', evt);
                }
            }.bind(this));
        });

        Object.keys(this.propertySets).forEach(key => {
            this.set(key, null, true);
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
        return this.getTransform ? this.getTransform.call(this, key, val) : val;
    }

    set(key, val, isReadOnly = false) {
        if (!(key in this)) {
            if (!isReadOnly) {
                var setter = function (newValue) {
                    if (this.shouldMonitorChanges) {
                        var oldValue = this._data[key];
                        if (oldValue && typeof oldValue === "object" && !Array.isArray(oldValue)) {
                            oldValue = Object.assign({}, oldValue);
                        }
                    }

                    if (this.shouldEvalFunctions && typeof newValue === 'function') {
                        this._funcProps[key] = newValue;
                    } else {
                        if (this.setTransform) {
                            newValue = this.setTransform.call(this, key, newValue);
                        }
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

                        var oldTransformedValue = this._transformedData[key];
                        this._data[key] = newValue;
                        if (this.getTransform) {
                            this._transformedData[key] = this.getTransform.call(this, key, newValue);
                        }

                        if (this.shouldMonitorChanges) {

                            if (!deepEqual(newValue, oldValue)) {
                                this._changedKeys.push(key);
                                this.trigger('change', {
                                    target: this, changedKey: key,
                                    newValue: this._transformedData[key] == null ? this._data[key] : this._transformedData[key],
                                    oldValue: oldTransformedValue == null ? oldValue : oldTransformedValue
                                });
                            }
                        }
                    }

                }.bind(this);
            }

            Object.defineProperty(this, key, {
                configurable: false,
                enumerable: true,
                get: function () {
                    var value = this.getValue(key);
                    this.trigger('get', { key, value });
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

    collectChangedData(includeComputed = true, computedValueFormat = 'verbose') {
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

        while (this.overrides[i] && (val == null)) {
            val = this.overrides[i][key];
            val = typeof val === 'function' ? val.bind(this) : val;
            i++;
        }

        i = 0;
        if (val == null) {
            val = this._transformedData[key] || this._data[key];
        }

        var mappingEntry = Object.entries(this.inputMappings).find(entry => key === entry[1]);

        while (mappingEntry && this.extends[i] && (val == null)) {
            val = this.extends[i][mappingEntry[0]];
            val = typeof val === 'function' ? val.bind(this) : val;
            i++;
        }
        i = 0;
        while (this.proxies[i] && (val == null)) {
            val = this.proxies[i][key];
            val = typeof val === 'function' ? val.bind(this) : val;
            i++;
        }
        if (val == null && (key in this.propertySets)) {
            var propertySet = this.propertySets[key];
            val = {};
            Object.defineProperties(val,
                (Array.isArray(propertySet) ? propertySet.map(key => [key, key]) : Object.entries(propertySet))
                    .reduce((acc, pair) => Object.assign(acc, { [pair[0]]: { enumerable: true, get: () => this[pair[1]] } }), {})
            )
        }
        return val
    }

    assign(data, initialState = {}) {
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

    await(key, validator = true, invokeImmediately = true) {
        return new Promise(resolve => {
            this.watchOnce(key, resolve, validator, invokeImmediately);
        })
    }

    evaluateFunctionProperty(key) {
        var dependencyKeys = [];
        var off = this.on('get', function (evt) {
            dependencyKeys.push(evt.key);
        });
        var result = this._funcProps[key].call(this);
        off();
        this._dependencyKeys[key] = uniq(dependencyKeys);
        return result;
    }

    watchOnce() {
        return this.watch.apply(this, [...Array.from(arguments), true]);
    }

    /**
     * @callback StoreWatchCallback
     * 
     * @param {...*} value A value from a watched key.
     */

     /**
     * @callback StoreWatchValidator
     * 
     * @param {Array|*} value If a single key was watched, a single value will be passed in. If multiple keys were watched, an array with all watched values will be passed in as the first argument.
     * 
     * @returns {boolean} Returning true indicates that validation was successful and the watch callback should be executed.
     */

     /**
      * @callback RemoveEventListenerCallback
      * 
      * A callback returned by an 'EventEmitter.on' invocation. Calling this callback will remove the event listener.
      */

    /**
     * Watches a key or keys in the store, triggering a callback when values change.
     * 
     * @param {String[]|String} key Key(s) to watch. When multiple keys are supplied, the watch event will trigger when any of their values change.
     * @param {StoreWatchCallback} func Will be called whenever any value assigned to one of watched keys changes. 
     * @param {StoreWatchValidator|boolean} [validator=true] Validates the changed value(s). If a boolean is supplied instead of a callback, 'true' is interpreted as meaning all watched keys should be defined, while 'false' means no validation should be applied.
     * @param {boolean} [invokeImmediately=false] Whether the callback should called immediately, or wait for the next change event.
     * @param {boolean} [onlyFireOnce=false] Whether the callback should persist, or call once then expire.
     * 
     * @returns {RemoveEventListenerCallback}
     */

    watch(key, func, validator = true, invokeImmediately = false, onlyFireOnce = false) {
        if (!Array.isArray(key)) {
            key = [key];
        }
        var checkKeys = function () {
            var vals = key.map(currKey => this[currKey]);

            if (!validator || (typeof validator === 'function' ? validator(key.length === 1 ? vals[0] : vals) : vals.every(val => typeof val !== 'undefined'))) {
                func.apply(this, vals);
            }
        };
        var off = this[onlyFireOnce ? 'once' : 'on']('change', function (evt) {
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

module.exports = WeddellStore;
