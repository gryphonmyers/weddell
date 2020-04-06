import deepEqual from 'fast-deep-equal';

export const ERR_NOT_SERIALIZABLE = Symbol('ERR_NOT_SERIALIZABLE');
export const ERR_STORE_READONLY = Symbol('ERR_STORE_READONLY');
export const ERR_STATE_CONSTANT = Symbol('ERR_STATE_CONSTANT');
export const ERR_STATE_COMPUTED = Symbol('ERR_STATE_COMPUTED');
export const IS_REACTIVE_STATE = Symbol();
export const IS_COMPUTED_STATE = Symbol();

const STATE_VALUE = Symbol();

function isSerializable(val) {
    return val && typeof val === 'object' ?
        (Array.isArray(val) || val.constructor === Object || Object.getPrototypeOf(val) === null) && Object.values(val).every(isSerializable) :
        (val == null || typeof val === 'string' || typeof val === 'boolean' || typeof val === 'number');
}

function createComputedStateClass({ store, ReactiveState }) {
    var stores = store && [].concat(store);
    const EVALUATE = Symbol();
    const EVAL_FUNC = Symbol();
    const STORE_KEYS = Symbol();
    const UNSET = Symbol();
    const STALE = Symbol();
    const STATUS = Symbol();
    const FRESH = Symbol();
    return class ComputedState extends ReactiveState {
        constructor(func) {
            super();
            this[STATUS] = UNSET;
            this[EVAL_FUNC] = func;
            this[STORE_KEYS] = new Map();

            stores.forEach(store => {
                this[STORE_KEYS].set(store, {});
                store.on('_statechange', ({key, val, store}) => {
                    let keys = this[STORE_KEYS].get(store);
                    if (key in keys) {
                        this[STATUS] = STALE;
                    }
                })
            })
        }

        get value() {
            switch (this[STATUS]) {
                case UNSET:
                    this[STATE_VALUE] = this[EVALUATE]();
                    break;
                case STALE:
                    this.value = this[EVALUATE]();
                    break;
            }
            this[STATUS] = FRESH;
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

function createReactiveStateClass({EventEmitter, Error}) {
    const SERIALIZABILITY_STALE = Symbol();
    
    return class ReactiveState extends EventEmitter {
        constructor(val) {
            super();
            this[STATE_VALUE] = val;
            this[SERIALIZABILITY_STALE] = true;
        }
        get value() {
            if (this[SERIALIZABILITY_STALE]) {
                if (!isSerializable(this[STATE_VALUE])) {
                    throw new Error(ERR_NOT_SERIALIZABLE)
                }
                this[SERIALIZABILITY_STALE] = false;
            }
            this.trigger('get', {val: this[STATE_VALUE]});
            return this[STATE_VALUE];
        }
        set value(newVal) {
            const prevVal = this[STATE_VALUE];
            this[STATE_VALUE] = newVal;
            if (!deepEqual(prevVal, newVal)) {
                this.trigger('valuechange', {val: newVal, prevVal });
                this[SERIALIZABILITY_STALE] = true;
            }
        }
        get [IS_REACTIVE_STATE]() {
            return true;
        }
    }
}

export const createStoreClass = ({EventEmitter, Error}) => class Store extends EventEmitter {

    constructor(setup) {
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
        const readOnly = new Proxy(this, { 
            get,
            set: () => {
                throw new Error(ERR_STORE_READONLY)
            }
        });
        const writable = new Proxy(this, {
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
        const ComputedState = createComputedStateClass({ReactiveState, store: writable });

        state = setup({ReactiveState, ComputedState});

        Object.entries(state)
            .forEach(([key,v]) => {
                if (v && v[IS_REACTIVE_STATE]) {
                    v.on('get', ({val}) => this.trigger('getstate', {val, key, store: writable }));
                    v.on('valuechange', ({val, prevVal}) => {
                        this.trigger('statechange', {val, prevVal, key, store: writable});
                        this.trigger('_statechange', {val, prevVal, key, store: writable});
                    });
                }
            });

        return { ReactiveState, ComputedState, readOnly, writable, internal: this }
    }
}
export default createStoreClass