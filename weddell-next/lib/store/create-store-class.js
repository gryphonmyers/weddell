export const ERR_STORE_READONLY = Symbol('ERR_STORE_READONLY');
export const ERR_STATE_CONSTANT = Symbol('ERR_STATE_CONSTANT');
export const ERR_STATE_COMPUTED = Symbol('ERR_STATE_COMPUTED');
export const READ_ONLY = Symbol();
export const WRITABLE = Symbol();
export const STATE = Symbol();

 /**
  * @typedef {ReturnType<createStoreClass>} BaseStoreClass
  */

export function createStoreClass ({ PushableObservable, Error, ReactiveState, ComputedState: BaseComputedState }) {
    return class Store extends PushableObservable {
        constructor(setup, { readOnly=false }={}) {
            super();

            const get = (obj, key) => {
                if (this[STATE] && this[STATE].propertyIsEnumerable(key)) {
                    let val = this[STATE][key];

                    if (val instanceof ReactiveState) {
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
                    if (this[STATE] && this[STATE].propertyIsEnumerable(key)) {
                        const val = this[STATE][key];
                        if (val instanceof ComputedState) {
                            throw new Error(ERR_STATE_COMPUTED);
                        }
                        if (val instanceof ReactiveState) {
                            val.value = newVal;
                            return true;
                        }
                        throw new Error(ERR_STATE_CONSTANT);
                    }
                    obj[key] = newVal;
                    return true;
                }
            });

            const store = this;
            
            class ComputedState extends BaseComputedState {
                static stores = [store[WRITABLE]]
            }

            this[STATE] = setup({ ReactiveState, ComputedState });

            Object.entries(this[STATE])
                .forEach(([key,v]) => {
                    if (v && v instanceof ReactiveState) {
                        v.subscribe({
                            next(evt) {
                                store.push({ ...evt, key, store: store[WRITABLE], stateRef: v });
                            }
                        });
                    }
                });

            if (this.constructor === Store) {
                Object.seal(this);
            }

            return readOnly
                ? this[READ_ONLY]
                : this[WRITABLE];
        }
    }
}