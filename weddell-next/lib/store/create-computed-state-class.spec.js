import test from 'ava';
import { createReactiveStateClass } from "./create-reactive-state-class.js";
import { createComputedStateClass, STORES } from "./create-computed-state-class.js";
import { createPushableObservableClass } from "../observable/create-pushable-observable-class.js";
import { createObservableClass } from "../observable/create-observable-class.js";

const Observable = createObservableClass();
const PushableObservable = createPushableObservableClass({Observable});
const ReactiveState = createReactiveStateClass({Error, PushableObservable });
const ComputedState = createComputedStateClass({ ReactiveState });

test('basic computed state works', t => {  
    const calls = [];

    const store = {
        bas: 1,
        boo:2,
        filter() {
            calls.push(['filter'])
            return {
                subscribe(cb) {
                    calls.push(['subscribe'])
                    return {
                        unsubscribe() {
                            calls.push(['unsubscribe'])
                        }
                    }
                }
            }
        }
    }

    const state = new ComputedState((store) => store.bas + store.boo, [store]);

    t.is(state.value, 3);
    t.deepEqual(calls, [['filter'],['subscribe'], ['unsubscribe'],['filter'],['subscribe']])

    t.throws(() => state.foo = '1');
});

test('computed state can source stores from static property', t => {  
    const calls = [];
    const store = {
        bas: 1,
        boo:2,
        filter() {
            calls.push(['filter'])
            return {
                subscribe(cb) {
                    calls.push(['subscribe'])
                    return {
                        unsubscribe() {
                            calls.push(['unsubscribe'])
                        }
                    }
                }
            }
        }
    }

    class MyComputedState extends ComputedState {
        static stores = [store]
    }

    const state = new MyComputedState((store) => store.bas + store.boo);

    t.deepEqual(state[STORES], [store]);   
    t.is(state.value, 3);
});

test('Recompute works', t => {
    let calls = [];
    let subscribers = [];
    const store = {
        bas: 1,
        boo: 2,
        filter() {
            calls.push(['filter'])
            return {
                subscribe(sub) {
                    subscribers.push(sub)
                    calls.push(['subscribe'])
                    return {
                        unsubscribe() {
                            calls.push(['unsubscribe'])
                        }
                    }
                }
            }
        }
    }

    const state = new ComputedState((store) => store.bas + store.boo, [store]);

    t.is(state.value, 3);

    subscribers[0].next({key:'bas'});
    subscribers[0].next({key:'boo'});

    store.boo += 5;

    t.is(subscribers.length, 2)
    // outercb();
    subscribers[1].next()

    t.is(state.value, 8);
})