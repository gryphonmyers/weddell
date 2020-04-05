const ava = require('ava');
import createStoreClass from "../lib/new/store";
import { EventTarget, CustomEvent } from '../lib/node-event-target';
import createEventEmitterClass from '../lib/create-event-emitter-class';
const EventEmitter = createEventEmitterClass({ EventTarget, CustomEvent });
const Store = createStoreClass({EventEmitter, Error});

ava('Store returns initial reactive values', test => {   
    const store = new Store(({ReactiveState}) => ({
        foo: new ReactiveState('bar')
    }))

    test.is(store.readOnly.foo, 'bar');
    test.is(store.writable.foo, 'bar');
});

ava('Readonly store can not be written to', test => {
    const store = new Store(({ReactiveState}) => ({
        foo: new ReactiveState('bar')
    }))

    test.throws(() => store.readOnly.foo = 'wig');
})

ava('Store fires change events', test => {   
    const store = new Store(({ReactiveState}) => ({
        foo: new ReactiveState('bar')
    }))

    const evts = [];
    store.internal.on('statechange', (evt) => evts.push(evt));
    store.writable.foo = 'wig';
    test.deepEqual(evts, [{
        key: 'foo',
        prevVal: 'bar',
        val: 'wig',
        store: store.internal
    }])
});


ava('Store fires get events', test => {   
    const store = new Store(({ReactiveState}) => ({
        foo: new ReactiveState('bar'),
        big: new ReactiveState('band')
    }))

    const evts = [];
    store.internal.on('getstate', (evt) => evts.push(evt));
    store.readOnly.foo
    store.readOnly.big
    test.deepEqual(evts, [{
        key: 'foo',
        val: 'bar',
        store: store.internal
    }, {
        key: 'big',
        val: 'band',
        store: store.internal
    }])
});


ava('Store returns computed values', test => {   
    const store = new Store(({ReactiveState, ComputedState}) => ({
        first: new ReactiveState('it'),
        second: new ReactiveState('begins'),
        big: new ComputedState((store) => store.first + ' ' + store.second)
    }))

    test.is(store.readOnly.big, 'it begins');
});


ava('Returned computed values update when dependent keys change', test => {   
    const store = new Store(({ReactiveState, ComputedState}) => ({
        first: new ReactiveState('it'),
        second: new ReactiveState('begins'),
        big: new ComputedState((store) => store.first + ' ' + store.second)
    }))
    
    test.is(store.readOnly.big, 'it begins');

    store.writable.second = 'ends';

    test.is(store.readOnly.big, 'it ends');
});


ava.serial('Store fires change events when computed values change', test => {   
    const store = new Store(({ReactiveState, ComputedState}) => ({
        first: new ReactiveState('it'),
        second: new ReactiveState('begins'),
        big: new ComputedState((store) => store.first + ' ' + store.second)
    }))
    const evts = [];

    store.internal.on('statechange', (evt) => {
        evts.push(evt)
    });
    
    test.is(store.readOnly.big, 'it begins');
       
    store.writable.second = 'ends';

    test.deepEqual(evts, [{
        key: 'second',
        val: 'ends',
        prevVal: 'begins',
        store: store.internal
    },{
        key: 'big',
        val: 'it ends',
        prevVal: 'it begins',
        store: store.internal
    }]);
});


ava.serial('Trying to set computed state throws', test => {   
    const store = new Store(({ReactiveState, ComputedState}) => ({
        first: new ReactiveState('it'),
        second: new ReactiveState('begins'),
        big: new ComputedState((store) => store.first + ' ' + store.second)
    }))

    test.throws(() => store.writable.big = 'fib')
});


ava.serial('Plain values are treated as constants', test => {   
    const store = new Store(({ReactiveState, ComputedState}) => ({
        thing: 1,
        action: function(val) {
            return val + 1;
        }
    }));

    test.is(store.readOnly.thing, 1);
    test.is(store.readOnly.action(store.readOnly.thing), 2);

    test.throws(() => store.writable.thing = 'fib')
    test.throws(() => store.writable.action = 'fib')
});