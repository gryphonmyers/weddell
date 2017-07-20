var mix = require('mixwith-es5').mix;
var EventEmitterMixin = require('../../core/event-emitter-mixin');
var DeDupe = require('mixwith-es5').DeDupe;
var MachineState = require('./machine-state-mixin');
var Mixin = require('mixwith-es5').Mixin;
var hasMixin = require('mixwith-es5').hasMixin;

var StateMachine = Mixin(function(superClass) {
    return class extends mix(superClass).with(DeDupe(EventEmitterMixin)) {
        constructor(opts) {
            super(opts);
            Object.defineProperties(this, {
                stateClass: {value: opts.stateClass},
                currentState: {writable: true, value: null},
                previousState: {writable: true, value: null},
                previousState: {writable: true, value: null},
                states: {value: {}}
            });
            if (!hasMixin(this, MachineState)) {
                console.warn("Supplied state class does not extend MachineState. Expect unreliable results.");
            }
        }

        static checkIfIsState(state) {
            return state.prototype === this.stateClass || state.prototype instanceof this.stateClass;
        }

        getState(state) {
            if (!state) {
                return null;
            }
            if (typeof state == 'string') {
                return this.states[state] || null;
            } else if (state.constructor === this.stateClass || state instanceof this.stateClass) {
                return state;
            }
            return null;
        }

        addState(key, state, onEnter, onExit) {
            if (this.stateClass.checkIfIsState(state)) {
                this.states[key] = state;
            }
        }

        changeState(state) {
            state = this.getState(state);

            var promise = Promise.resolve();
            if (state && this.currentState === state) {
                promise = Promise.resolve(this.currentState.updateState())
                    .then(() => {
                        this.trigger('updatestate', {updatedState: this.currentState});
                        return this.onUpdateState ? this.onUpdateState() : null;
                    });
            } else {
                if (this.currentState) {
                    promise = Promise.resolve(this.currentState.exitState())
                        .then(() => {
                            this.trigger('exitstate', {exitedState: this.currentState, enteredState: state});
                            this.previousState = this.currentState;
                            this.currentState = null;
                            return this.onExitState ? this.onExitState() : null;
                        });
                }
                if (state) {
                    promise = promise
                        .then(() => state.enterState())
                        .then(() => {
                            this.currentState = state;
                            this.trigger('enterstate', {exitedState: this.currentState, enteredState: state});

                            return this.onEnterState ? this.onEnterState() : null;
                        });
                }
            }
            return promise;
        }
    }
})
module.exports = StateMachine;
