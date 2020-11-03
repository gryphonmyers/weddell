import test from 'ava';
import { createStoreClass, READ_ONLY, WRITABLE } from "./create-store-class";
import EventEmitter from 'isomitter';

const Store = createStoreClass({ EventEmitter, Error });

test('Store returns initial reactive values', test => {   
    const store = new Store(({ReactiveState}) => ({
        foo: new ReactiveState('bar')
    }))

    test.is(store[READ_ONLY].foo, 'bar');
    test.is(store[WRITABLE].foo, 'bar');
});

test('Readonly store can not be written to', test => {
    const store = new Store(({ReactiveState}) => ({
        foo: new ReactiveState('bar')
    }))

    test.throws(() => store[READ_ONLY].foo = 'wig');
})

test('Store fires change events', test => {   
    const store = new Store(({ReactiveState}) => ({
        foo: new ReactiveState('bar')
    }))

    const evts = [];
    store.on('statechange', (evt) => evts.push(evt));
    store[WRITABLE].foo = 'wig';
    test.deepEqual(evts.map(evt => evt.detail), [{
        key: 'foo',
        prevVal: 'bar',
        val: 'wig',
        store: store
    }])
});


test('Store fires get events', test => {   
    const store = new Store(({ReactiveState}) => ({
        foo: new ReactiveState('bar'),
        big: new ReactiveState('band')
    }))

    const evts = [];
    store.on('getstate', (evt) => evts.push(evt));
    store[READ_ONLY].foo
    store[READ_ONLY].big
    test.deepEqual(evts.map(evt => evt.detail), [{
        key: 'foo',
        val: 'bar',
        store: store
    }, {
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
    const store = new Store(({ReactiveState, ComputedState}) => ({
        first: new ReactiveState('it'),
        second: new ReactiveState('begins'),
        big: new ComputedState((store) => store.first + ' ' + store.second)
    }))
    const evts = [];

    store.on('statechange', (evt) => {
        evts.push(evt)
    });
    
    test.is(store[READ_ONLY].big, 'it begins');
       
    store[WRITABLE].second = 'ends';

    test.deepEqual(evts.map(evt => evt.detail), [{
        key: 'second',
        val: 'ends',
        prevVal: 'begins',
        store: store
    }, {
        key: 'big',
        val: 'it ends',
        prevVal: 'it begins',
        store: store
    }]);

    store[READ_ONLY].big;

    test.deepEqual(evts.map(evt => evt.detail), [{
        key: 'second',
        val: 'ends',
        prevVal: 'begins',
        store: store
    }, {
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