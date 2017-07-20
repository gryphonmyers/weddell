var mix = require('mixwith-es5').mix;
var EventEmitterMixin = require('../../core/event-emitter-mixin');
var DeDupe = require('mixwith-es5').DeDupe;
var Mixin = require('mixwith-es5').Mixin;

var MachineState = Mixin(function(superClass) {
    return class extends mix(superClass).with(DeDupe(EventEmitterMixin)) {
        constructor(opts) {
            super(opts);
            this.onEnterState = opts.onEnterState;
            this.onExitState = opts.onExitState;
            this.onUpdateState = opts.onUpdateState;
        }

        stateAction(methodName, eventName) {
            return Promise.resolve(this[methodName] && this[methodName]())
                .then(() => this.trigger(eventName));
        }

        exitState() {
            return this.stateAction('onExitState', 'exit');
        }

        enterState() {
            return this.stateAction('onEnterState', 'enter');
        }

        updateState() {
            return this.stateAction('onUpdateState', 'update');
        }
    }
});
module.exports = MachineState;
