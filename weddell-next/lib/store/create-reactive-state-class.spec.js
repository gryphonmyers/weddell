import test from 'ava';
import { createReactiveStateClass } from "./create-reactive-state-class.js";
import { createPushableObservableClass } from "../observable/create-pushable-observable-class.js";
import { createObservableClass } from "../observable/create-observable-class.js";

const Observable = createObservableClass();
const PushableObservable = createPushableObservableClass({Observable});
const ReactiveState = createReactiveStateClass({Error, PushableObservable });

test('reactive state initializes with value', t => {
    const state = new ReactiveState('1');

    t.is(state.value, '1');
});

test('reactive state fires change event at appropriate times', t => {
    const evts = [];

    const state = new ReactiveState('1');

    state.filter(evt => evt.eventName === 'valuechange').subscribe({
        next(evt) {
            evts.push(evt);
        }
    })
    
    state.value = '2';
    state.value;

    t.deepEqual(evts, [{ eventName: 'valuechange', val: '2', prevVal: '1' }]);

    state.value;
    state.value = '2';

    t.deepEqual(evts, [{ eventName: 'valuechange', val: '2', prevVal: '1' }]);
});

test('reactive state fires get event on access', t => {
    const evts = [];

    const state = new ReactiveState('1');
    
    state.filter(evt => evt.eventName === 'get').subscribe({
        next(evt) {
            evts.push(evt);
        }
    })

    state.value;
    state.value = '2';

    t.deepEqual(evts, [{ eventName: 'get', val: '1' }]);
    
    state.value;
    state.value;

    t.deepEqual(evts, [{ eventName: 'get', val: '1' },{ eventName: 'get', val: '2' },{ eventName: 'get', val: '2' }]);
});

test('Setting unserializable values throws error', t => {
    const state = new ReactiveState('1');

    t.throws(() => state.value = function() {});

    t.throws(() => new ReactiveState(function(){}));
});