const tap = require('tap');
import { EventTarget, CustomEvent } from '../lib/node-event-target';
import createEventEmitterClass from '../lib/create-event-emitter-class';
const EventEmitter = createEventEmitterClass({ EventTarget, CustomEvent });

tap.test('Event Emitter working as expected', test => {   
    
    var em = new EventEmitter();

    var triggered = {};

    var onOn = evtObj => {
        triggered.on = 1;
    }
    em.on('hi', onOn)

    var onAddEventListener = evtObj => {
        triggered.addEventListener = 1;
    }

    em.addEventListener('hi', onAddEventListener)
    
    var onAddListener = evtObj => {
        triggered.addListener = 1;
    }
    em.addListener('hi', onAddListener)

    em.trigger('hi', {foo: 'bar'});

    test.deepEquals(triggered, {addListener:1, addEventListener:1, on:1}, 'trigger method triggers events on all listener aliases');
    
    triggered = {};

    em.emit('hi', {foo: 'bar'});

    test.deepEquals(triggered, {addListener:1, addEventListener:1, on:1}, 'emit method triggers events on all listener aliases');

    triggered = {};
    
    em.dispatchEvent('hi', {foo: 'bar'});

    test.deepEquals(triggered, {addListener:1, addEventListener:1, on:1}, 'dispatchEvent triggers events on all listener aliases');

    em.removeEventListener('hi', onAddEventListener);
    em.removeListener('hi', onAddListener);
    em.off('hi', onOn);

    triggered = {}
    
    em.trigger('hi', {foo: 'bar'});

    test.deepEquals(triggered, {});

    em = new EventEmitter();
    var numTriggers = 0;
    em.once('hi', evtObj => {
        numTriggers++;
    });

    em.trigger('hi', {});    
    em.trigger('hi', {});

    test.equals(numTriggers, 1, 'Once method only triggers once');

    em = new EventEmitter();

    var result;
    em.on('hi', evtObj => {
        result = evtObj;
    })
    result = 1;

    em.trigger('hi', null);

    test.same(result, null, 'Triggering with null event object works');

    result = 1;
    em.trigger('hi');
    
    test.same(result, null, 'Triggering with no event object works');

    result = null;
    em.trigger('hi', {foo: 'bar'});
    
    test.deepEquals(result, {foo: 'bar'}, 'Triggering with event object works');

    test.end();
})