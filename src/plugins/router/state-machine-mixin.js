var EventEmitterMixin = require('@weddell/event-emitter-mixin');
var MachineState = require('./machine-state-mixin');
const { hasMixin, Mixin, DeDupe, mix } = require('@weddell/mixwith');

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
        onEnterState() {}
        onExitState() {}
        onUpdateState() {}

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
                promise = Promise.all([
                        this.currentState.updateState(Object.assign({updatedState: this.currentState}, evt)),
                        this.onUpdateState(Object.assign({updatedState: this.currentState}, evt))
                    ])
                    .then(() => {
                        this.trigger('updatestate', Object.assign({updatedState: this.currentState}, evt));
                    })
            } else {
                if (this.currentState) {
                    this.previousState = this.currentState;
                    this.currentState = null;
                    promise = Promise.all([
                            this.previousState.exitState(Object.assign({exitedState: this.previousState, enteredState: state}, evt)),
                            this.onExitState(Object.assign({exitedState: this.previousState, enteredState: state}, evt))
                        ])
                        .then(() => {
                            this.trigger('exitstate', Object.assign({exitedState: this.previousState, enteredState: state}, evt));
                        });
                }
                if (state) {
                    promise = promise
                        .then(() => Promise.all([
                            state.enterState(Object.assign({exitedState: this.previousState, enteredState: this.currentState = state}, evt)), 
                            this.onEnterState(Object.assign({exitedState: this.previousState, enteredState: this.currentState}, evt))
                        ]))
                        .then(() => {
                            this.trigger('enterstate', Object.assign({exitedState: this.previousState, enteredState: this.currentState}, evt));
                        });
                }
            }
            return promise
                .then(() => this.currentState);
        }
    }
})
module.exports = StateMachine;
