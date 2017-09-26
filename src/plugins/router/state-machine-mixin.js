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
                states: {value: {}}
            });
        }

        static checkIfIsState(state) {
            var result = hasMixin(state, MachineState);
            if (!result) {
                console.warn("Supplied state class does not extend MachineState. Expect unreliable results.");
            }
            return result;
        }

        getState(state) {
            if (!state) {
                return null;
            }
            if (typeof state == 'string') {
                return this.states[state] || null;
            } else if (this.constructor.checkIfIsState(state)) {
                return state;
            }
            return null;
        }

        addState(key, state, onEnter, onExit) {
            if (this.constructor.checkIfIsState(state)) {
                this.states[key] = state;
            }
        }

        changeState(state, evt) {
            state = this.getState(state);

            var promise = Promise.resolve();
            
            if (state && this.currentState === state) {
                promise = Promise.resolve(this.currentState.updateState(Object.assign({updatedState: this.currentState}, evt)))
                    .then(() => {
                        this.trigger('updatestate', Object.assign({updatedState: this.currentState}, evt));
                        return this.onUpdateState ? this.onUpdateState(Object.assign({updatedState: this.currentState}, evt)) : null;
                    });
            } else {
                if (this.currentState) {
                    promise = Promise.resolve(this.currentState.exitState(Object.assign({exitedState: this.currentState, enteredState: state}, evt)))
                        .then(() => {
                            this.trigger('exitstate', Object.assign({exitedState: this.currentState, enteredState: state}, evt));
                            this.previousState = this.currentState;
                            this.currentState = null;
                            return this.onExitState ? this.onExitState(Object.assign({exitedState: this.previousState, enteredState: state}, evt)) : null;
                        });
                }
                if (state) {
                    promise = promise
                        .then(() => state.enterState(Object.assign({exitedState: this.previousState, enteredState: state}, evt)))
                        .then(() => {
                            this.currentState = state;
                            this.trigger('enterstate', Object.assign({exitedState: this.previousState, enteredState: this.currentState}, evt));
                            return this.onEnterState ? this.onEnterState(Object.assign({exitedState: this.previousState, enteredState: this.currentState}, evt)) : null;
                        });
                }
            }
            return promise
                .then(() => this.currentState);
        }
    }
})
module.exports = StateMachine;
