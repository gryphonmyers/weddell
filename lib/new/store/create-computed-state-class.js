import { STATE_VALUE } from "./create-reactive-state-class";

export const IS_COMPUTED_STATE = Symbol();
export const EVALUATE = Symbol();
export const EVAL_FUNC = Symbol();
export const STORE_KEYS = Symbol();
export const IS_SET = Symbol();

export function createComputedStateClass({ store, ReactiveState }) {
    var stores = store && [].concat(store);

    return class ComputedState extends ReactiveState {
        constructor(func) {
            super();
            this[IS_SET] = false;
            this[EVAL_FUNC] = func;
            this[STORE_KEYS] = new Map();

            stores.forEach(store => {
                this[STORE_KEYS].set(store, {});
                store.on('_statechange', ({key, val, store}) => {
                    let keys = this[STORE_KEYS].get(store);
                    if (key in keys) {
                        this.value = this[EVALUATE]();
                    }
                })
            })
        }

        get value() {
            if (!this[IS_SET]) this[STATE_VALUE] = this[EVALUATE]();
            this[IS_SET] = true;
            return super.value;
        }

        set value(newVal) {
            super.value = newVal;
        }

        [EVALUATE]() {
            const onGetState = ({key, store}) => {
                let keys = this[STORE_KEYS].get(store);
                keys[key] = 1;
            }
            stores.forEach(store => {
                this[STORE_KEYS].set(store, {});
                store.on('getstate', onGetState)
            });

            const returned = this[EVAL_FUNC](...stores);

            stores.forEach(store => store.off('getstate', onGetState))

            return returned;
        }

        get [IS_COMPUTED_STATE]() {
            return true;
        }
    }
}