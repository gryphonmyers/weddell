var Mixin = require('mixwith-es5').Mixin;
var hasMixin = require('mixwith-es5').hasMixin;
var defaults = require('object.defaults/immutable');
var includes = require('../utils/includes');

var EventEmitterMixin = Mixin(function(superClass) {
    return class extends superClass {
        constructor(opts) {
            super(opts);
            Object.defineProperties(this, {
                _callbacks: {value: {'*':[]}}
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
            return () => this.off(eventName, callback);
        }

        once(eventName, callback) {
            var self = this;
            var off = this.on(eventName, function() {
                callback.apply(this, arguments);
                off();
            });
            return off;
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
            eventObj = Object.assign({}, eventObj, {eventName});
            if (Array.isArray(eventName)) {
                return eventName.map(evtName => this.trigger(evtName, eventObj, thisArg));
            } else {
                var cbs = eventName in this._callbacks ? this._callbacks[eventName] : [];
                return cbs.concat(this._callbacks['*']).map(cb => cb.call(thisArg || this, eventObj));
            }
        }
    }
});

module.exports = EventEmitterMixin;
