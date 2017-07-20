var Mixin = require('mixwith-es5').Mixin;
var hasMixin = require('mixwith-es5').hasMixin;
var defaults = require('object.defaults/immutable');
var includes = require('../utils/includes');

var EventEmitterMixin = Mixin(function(superClass) {
    return class extends superClass {
        constructor(opts) {
            super(opts);
            Object.defineProperties(this, {
                _callbacks: {value: {}},
                _proxies: {value: {}}
            });
        }

        on(eventName, callback) {
            if (Array.isArray(eventName)) {
                eventName.forEach(evName => this.on(evName, callback));
            } else {
                if (!(eventName in this._callbacks)) {
                    this._callbacks[eventName] = [];
                }
                this._callbacks[eventName] = this._callbacks[eventName].concat(callback);
            }
            return () => {this.off(eventName, callback)};
        }

        once(eventName, callback) {
            var self = this;
            var off = this.on(eventName, function() {
                callback.apply(this, arguments);
                off();
            });
        }

        off(eventName, callback) {
            if (Array.isArray(eventName)) {
                return eventName.map(off, callback);
            } else {
                if (eventName in this._callbacks) {
                    var i = this._callbacks[eventName].indexOf(callback);
                    if (i > -1) {
                        this._callbacks[eventName].splice(i, 1);
                    }
                    if (!this._callbacks[eventName].length) {
                        delete this._callbacks[eventName];
                    }
                    return true;
                }
                return false;
            }
        }

        trigger(eventName, eventObj, thisArg) {
            if (Array.isArray(eventName)) {
                return eventName.map(evtName => this.trigger(evtName, eventObj, thisArg));
            } else {
                if (eventName in this._proxies) {
                    this._proxies[eventName].forEach(proxy => proxy.trigger(eventName, eventObj));
                }
                if (eventName in this._callbacks) {
                    return this._callbacks[eventName].map(cb => cb.call(thisArg || this, eventObj));
                }
            }
        }

        proxyEvent(eventName, eventEmitter) {
            if (hasMixin(eventEmitter, EventEmitterMixin)) {
                if (Array.isArray(eventName)) {
                    eventName.forEach(evtName => this.proxyEvent(evtName, eventEmitter));
                } else {
                    if (!(eventName in this._proxies)) {
                        this._proxies[eventName] = [];
                    }
                    if (!includes(this._proxies[eventName], eventEmitter)) {
                        this._proxies[eventName].push(eventEmitter);
                        return true;
                    }
                }
            } else {
                console.warn('Failed to proxy events to object because it is not an event emitter');
            }
            return false;
        }
    }
});

module.exports = EventEmitterMixin;
