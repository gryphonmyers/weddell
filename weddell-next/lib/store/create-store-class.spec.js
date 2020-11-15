import test from 'ava';
import { createStoreClass, READ_ONLY, WRITABLE } from "./create-store-class.js";
import { createReactiveStateClass } from "./create-reactive-state-class.js";
import { createComputedStateClass } from "./create-computed-state-class.js";
import { createObservableClass } from "../observable/create-observable-class.js";
import { createPushableObservableClass } from "../observable/create-pushable-observable-class.js";

const Observable = createObservableClass();
const PushableObservable = createPushableObservableClass({ Observable });
const ReactiveState = createReactiveStateClass({Error, PushableObservable });
const ComputedState = createComputedStateClass({ ReactiveState });
const Store = createStoreClass({ PushableObservable, Error, ReactiveState, ComputedState });

test('Store returns initial reactive values', t => {   
    const store = new Store(({ReactiveState}) => ({
        foo: new ReactiveState('bar')
    }))

    t.is(store[READ_ONLY].foo, 'bar');
    t.is(store[WRITABLE].foo, 'bar');
});

test('Readonly store can not be written to', test => {
    const store = new Store(({ReactiveState}) => ({
        foo: new ReactiveState('bar')
    }))

    test.throws(() => store[READ_ONLY].foo = 'wig');
})

test('Store fires change events', test => {
    let foo;

    const store = new Store(({ReactiveState}) => {
        foo = new ReactiveState('bar');
        return ({
            foo
        })
    })

    const evts = [];

    store.filter(evt => evt.eventName === 'valuechange').subscribe({
        next(evt) {
            evts.push(evt)
        }
    });

    store[WRITABLE].foo = 'wig';
    store[WRITABLE].foo;

    test.deepEqual(evts, [{
        eventName: 'valuechange',
        stateRef: foo,
        key: 'foo',
        prevVal: 'bar',
        val: 'wig',
        store: store
    }])
});

test('Store fires get events', test => {   
    let foo;
    let big;
    const store = new Store(({ReactiveState}) => {
        foo = new ReactiveState('bar');
        big = new ReactiveState('band');
        return {
            foo,
            big
        }
    })

    const evts = [];

    store.filter(evt => evt.eventName === 'get').subscribe({
        next(evt) {
            evts.push(evt)
        }
    });

    store[READ_ONLY].foo
    store[READ_ONLY].big

    test.deepEqual(evts, [{
        eventName: 'get',
        key: 'foo',
        stateRef: foo,
        val: 'bar',
        store: store
    }, {
        eventName: 'get',
        stateRef: big,
        key: 'big',
        val: 'band',
        store: store
    }])
});

test('Store returns computed values', test => {   
    const store = new Store(({ReactiveState, ComputedState}) => ({
        first: new ReactiveState('it'),
        second: new ReactiveState('begins'),
        big: new ComputedState((store) => store.first + ' ' + store.second)
    }))

    test.is(store[READ_ONLY].big, 'it begins');
});


test('Returned computed values update when dependent keys change', test => {   
    const store = new Store(({ReactiveState, ComputedState}) => ({
        first: new ReactiveState('it'),
        second: new ReactiveState('begins'),
        full: new ComputedState((store) => store.first + ' ' + store.second)
    }))
    
    test.is(store[READ_ONLY].full, 'it begins');

    store[WRITABLE].second = 'ends';

    test.is(store[READ_ONLY].full, 'it ends');
});

test('Store fires change events when computed values change', test => {   
    let first, second, big;

    const store = new Store(({ReactiveState, ComputedState}) => {
        first =  new ReactiveState('it');
        second = new ReactiveState('begins');
        big = new ComputedState((store) => store.first + ' ' + store.second);
        return ({
            first,
            second,
            big
        })
    })
    const evts = [];

    store.filter(evt => evt.eventName === 'valuechange').subscribe({
        next(evt) {
            evts.push(evt)
        }
    });
    
    test.is(store[READ_ONLY].big, 'it begins');
       
    store[WRITABLE].second = 'ends';

    test.deepEqual(evts, [{
        eventName: 'valuechange',
        stateRef: second,
        key: 'second',
        val: 'ends',
        prevVal: 'begins',
        store: store
    }, {
        eventName: 'valuechange',
        stateRef: big,
        key: 'big',
        val: 'it ends',
        prevVal: 'it begins',
        store: store
    }]);

    store[READ_ONLY].big;

    test.deepEqual(evts, [{
        eventName: 'valuechange',
        stateRef: second,
        key: 'second',
        val: 'ends',
        prevVal: 'begins',
        store: store
    }, {
        eventName: 'valuechange',
        stateRef: big,
        key: 'big',
        val: 'it ends',
        prevVal: 'it begins',
        store: store
    }]);    
});


test('Trying to set computed state throws', test => {   
    const store = new Store(({ReactiveState, ComputedState}) => ({
        first: new ReactiveState('it'),
        second: new ReactiveState('begins'),
        big: new ComputedState((store) => store.first + ' ' + store.second)
    }))

    test.throws(() => store[WRITABLE].big = 'fib')
});


test('Plain values are treated as constants', test => {   
    const store = new Store(({ReactiveState, ComputedState}) => ({
        thing: 1,
        action: function(val) {
            return val + 1;
        }
    }));

    test.is(store[READ_ONLY].thing, 1);
    test.is(store[READ_ONLY].action(store[READ_ONLY].thing), 2);

    test.throws(() => store[WRITABLE].thing = 'fib')
    test.throws(() => store[WRITABLE].action = 'fib')
});

test('Readonly true option causes writes to throw', t => {
    const store = new Store(({ReactiveState, ComputedState}) => ({
        thing: new ReactiveState(1)
    }), { readOnly: true });

    t.throws(() => store.thing = 4);
});

test('Readonly false option allows writes', t => {
    const store = new Store(({ReactiveState, ComputedState}) => ({
        thing: new ReactiveState(1)
    }), { readOnly: false });

    t.notThrows(() => store.thing = 4);
})

test.todo('Async state');
test.todo('Only fire get events when "monitorAccess" method is invoked.');