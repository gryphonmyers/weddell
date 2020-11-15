const OBSERVER = Symbol();
const CLOSED = Symbol();
const CLEANUP = Symbol();
const CALLBACK = Symbol();
const APPLY_TRANSFORMS = Symbol();
const TRANSFORMS = Symbol();

export function createObservableClass({}={}) {

    class SubscriptionObserver {

        constructor (observer, { transforms=[] }={}) {
            this[OBSERVER] = observer;
            this[CLOSED] = false;
            this[TRANSFORMS] = transforms;
        }

        next(val) {
            if (!this[CLOSED] && this[OBSERVER].next) {
                const ABORT = Symbol();
                const result = this[TRANSFORMS].reduce((acc, curr) => {
                    if (acc === ABORT) return acc;
                    switch (curr.type) {
                        case 'map':
                            return curr.func(acc);
                        case 'filter':
                            return curr.func(acc) ? acc : ABORT
                    }
                }, val);

                if (result !== ABORT) {
                    this[OBSERVER].next(result);
                }
            }
        }

        error(err) {
            !this[CLOSED] && this[OBSERVER]?.error(err);
        }

        complete() {
            !this[CLOSED] && this[OBSERVER]?.complete();
            this[CLOSED] = true;
        }

        get closed() {
            return this[CLOSED];
        }
    }

    class Subscription {
        constructor({observer, cleanup}) {
            this[CLEANUP] = cleanup;
            this[OBSERVER] = observer;
        }

        unsubscribe() {
            return this[CLEANUP]();
        }

        get closed() {
            return this[OBSERVER].closed();
        }
    }
    
    return class Observable {

        constructor(callback) {
            this[CALLBACK] = callback;
            this[TRANSFORMS] = [];
        }

        [APPLY_TRANSFORMS](transforms) {
            const combinedTransforms = [...this[TRANSFORMS], ...transforms];

            return new Proxy(this, {
                get: (obj, key) => 
                    key === TRANSFORMS
                        ? combinedTransforms
                        : obj[key]
            });
        }

        filter(func) {
            return this[APPLY_TRANSFORMS]([{func, type: 'filter'}]);
        }

        map(func) {
            // @ts-ignore
            return this[APPLY_TRANSFORMS]([{func, type: 'map'}]);
        }

        subscribe(origObserver, { transforms=[] }={}) {

            const observer = new SubscriptionObserver(origObserver, { 
                transforms: [...this[TRANSFORMS], ...transforms]
            });
            const cleanup = this[CALLBACK](observer);
            const subscription = new Subscription({cleanup, observer});
            
            origObserver.start && origObserver.start(subscription);
            
            return subscription;
        }
    }
}