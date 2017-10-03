var EventEmitterMixin = require('./event-emitter-mixin');
var deepEqual = require('deep-equal');
var defaults = require('object.defaults/immutable');
var includes = require('../utils/includes');
var difference = require('../utils/difference');
var generateHash = require('../utils/make-hash');
var mix = require('mixwith-es5').mix;

var defaultOpts = {
    shouldMonitorChanges: true,
    shouldEvalFunctions: true,
    inputMappings: {}
};

var Store = class extends mix(Store).with(EventEmitterMixin) {
    constructor(data, opts) {
        opts = defaults(opts, defaultOpts);
        super();

        Object.defineProperties(this, {
            shouldMonitorChanges: {value: opts.shouldMonitorChanges},
            shouldEvalFunctions: {value: opts.shouldEvalFunctions},
            _data: {configurable: false,value: {}},
            _funcProps: {configurable: false,value: {}},
            _funcPropHandlerRemovers: {configurable: false,value: {}},
            _proxyObjs: {configurable: false,value: {}},
            _proxyProps: {configurable: false,value: {}},
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
                        this._data[key] = newValue;
                    }

                    if (this.shouldMonitorChanges) {
                        if (!deepEqual(newValue, oldValue)) {
                            this.trigger('change', {changedKey: key, newValue, oldValue});
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

        while (this.overrides[i] && (typeof val === 'undefined' || val === null)) {
            val = this.overrides[i][key];
            i++;
        }

        i = 0;
        if (!val) {
            if (key in this._funcProps && !(key in this._data)) {
                val = this._data[key] = this.evaluateFunctionProperty(key);
            } else {
                val = this._data[key];
            }
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

    evaluateFunctionProperty(key) {
        var dependencyKeys = [];
        if (key in this._funcPropHandlerRemovers) {
            this._funcPropHandlerRemovers[key]();
        }
        var off = this.on('get', function(evt){
            dependencyKeys.push(evt.key);
        });
        var result = this._funcProps[key].call(this);
        this._funcPropHandlerRemovers[key] = this.watch.call(this, dependencyKeys, function(){
            this[key] = this.evaluateFunctionProperty(key);
        }.bind(this), false);
        off();

        return result;
    }
    watch(key, func, shouldWaitForDefined) {
        if (typeof shouldWaitForDefined == 'undefined') shouldWaitForDefined = true;
        if (!Array.isArray(key)) {
            key = [key];
        }
        return this.on('change', function(evt){
            if (includes(key, evt.changedKey)) {
                var vals = key.map(currKey=>this[currKey]);
                if (!shouldWaitForDefined || vals.every(val=>typeof val !== 'undefined')) {
                    func.apply(this, vals);
                }
            }
        });
    }
}

module.exports = Store;
