import { STATE_VALUE } from "./create-reactive-state-class.js";

export const EVALUATE = Symbol();
export const EVAL_FUNC = Symbol();
export const IS_SET = Symbol();
export const STORES = Symbol();

export function createComputedStateClass({ ReactiveState }) {

    return class ComputedState extends ReactiveState {

        constructor(func, stores) {
            super();
            this[IS_SET] = false;
            this[EVAL_FUNC] = func;
            // @ts-ignore
            this[STORES] = stores || this.constructor.stores || [];
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
            const keysByStore = new Map;

            let subscribers = this[STORES]
                .map(store => {
                    const set = new Set;

                    keysByStore.set(store, set);

                    return store
                        .filter(({eventName}) => eventName === 'get')
                        .subscribe({
                            next({key}) {
                                set.add(key);
                            }
                        })
                });

            const returned = this[EVAL_FUNC](...this[STORES]);

            subscribers.forEach(sub => sub.unsubscribe());

            subscribers = this[STORES]
                .map(store => 
                    store
                        .filter(({ eventName, key }) => eventName === 'valuechange' && keysByStore.get(store).has(key))
                        .subscribe({
                            next: () => {
                                subscribers.forEach(sub => sub.unsubscribe());

                                this.value = this[EVALUATE]();
                            }
                        })
                );

            return returned;
        }
    }
}