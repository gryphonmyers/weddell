var EventEmitterMixin = require('../../core/event-emitter-mixin');
const { Mixin, DeDupe, mix } = require('mixwith');

var MachineState = Mixin(function(superClass) {
    return class extends mix(superClass).with(DeDupe(EventEmitterMixin)) {
        constructor(opts) {
            super(opts);
            this.onEnterState = opts.onEnterState;
            this.onExitState = opts.onExitState;
            this.onUpdateState = opts.onUpdateState;
        }

        stateAction(methodName, eventName, evt) {
            return Promise.resolve(this[methodName] && this[methodName](Object.assign({}, evt)))
                .then(() => this.trigger(eventName, Object.assign({}, evt)));
        }

        exitState(evt) {
            return this.stateAction('onExitState', 'exit', evt);
        }

        enterState(evt) {
            return this.stateAction('onEnterState', 'enter', evt);
        }

        updateState(evt) {
            return this.stateAction('onUpdateState', 'update', evt);
        }
    }
});
module.exports = MachineState;
