import { IS_REACTIVE_STATE, createReactiveStateClass } from "./create-reactive-state-class";
import { IS_COMPUTED_STATE, createComputedStateClass } from "./create-computed-state-class";

export const ERR_STORE_READONLY = Symbol('ERR_STORE_READONLY');
export const ERR_STATE_CONSTANT = Symbol('ERR_STATE_CONSTANT');
export const ERR_STATE_COMPUTED = Symbol('ERR_STATE_COMPUTED');
export const READ_ONLY = Symbol();
export const WRITABLE = Symbol();

export function createStoreClass ({EventEmitter, Error}) {
    return class Store extends EventEmitter {
        constructor(setup, { readOnly=false }={}) {
            super();
            let state;

            const get = (obj, key) => {
                if (state && state.propertyIsEnumerable(key)) {
                    let val = state[key];

                    if (val[IS_REACTIVE_STATE]) {
                        val = val.value;
                    }

                    return val;
                }
                return obj[key];
            }
            this[READ_ONLY] = new Proxy(this, { 
                get,
                set: () => {
                    throw new Error(ERR_STORE_READONLY)
                }
            });
            this[WRITABLE] = new Proxy(this, {
                get,
                set: (obj, key, newVal) => {
                    if (state && state.propertyIsEnumerable(key)) {
                        const val = state[key];
                        if (val[IS_COMPUTED_STATE]) {
                            throw new Error(ERR_STATE_COMPUTED);
                        }
                        if (val[IS_REACTIVE_STATE]) {
                            val.value = newVal;
                            return true;
                        }
                        throw new Error(ERR_STATE_CONSTANT);
                    }
                    obj[key] = newVal;
                    return true;
                }
            });
            
            const ReactiveState = createReactiveStateClass({Error, EventEmitter });
            const ComputedState = createComputedStateClass({ReactiveState, store: this[WRITABLE] });

            state = setup({ReactiveState, ComputedState});

            Object.entries(state)
                .forEach(([key,v]) => {
                    if (v && v[IS_REACTIVE_STATE]) {
                        v.on('get', ({val}) => this.trigger('getstate', {val, key, store: this[WRITABLE] }));
                        v.on('valuechange', ({val, prevVal}) => {
                            this.trigger('statechange', {val, prevVal, key, store: this[WRITABLE] });
                            this.trigger('_statechange', {val, prevVal, key, store: this[WRITABLE] });
                        });
                    }
                });

            return readOnly
                ? this[READ_ONLY]
                : this[WRITABLE];
        }
    }
}