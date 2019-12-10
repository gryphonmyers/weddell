const tap = require('tap');
import weddell from '../lib/presets/node';
const {Store} = weddell;

tap.test('Store working as expected', test => {
    var store = new Store({ foo: 'bar' });

    var didChange = false;
    store.on('change', () => {
        didChange = true;
    })
    store.foo = 'baz';

    test.ok(didChange, 'Setting new value triggers change event');
    didChange = false;
    store.foo = 'baz';
    test.notOk(didChange, 'Setting same value does not trigger change event');

    var store = new Store({ 
        foo: 'bar', 
        grub: function(){
            this.foo //This line left here intentionally
            return this.foo + ' hi';
        } 
    }, {immutable: false, shouldMonitorChanges: true, shouldExecFuncs: true});

    test.equals(store.grub, 'bar hi', 'Computed property returns correct value');

    store.foo = 'mid';

    test.equals(store.grub, 'mid hi', 'Computed property updates when dependent value changes');
    test.equals(store.grub, 'mid hi', 'Computed property serves cached when no values stale');

    store = new Store({ 
        foo: 'bar'
    }, { immutable: true });

    test.throws(() => {
        store.foo = 'moo';
    }, 'Setting a key on an immutable store throws error');

    store = new Store({ 
        foo: 'bar'
    }, { shouldEnforceSerializable: true });

    test.throws(() => {
        store.foo = new Date();
    }, 'Setting a non-serializable value throws error when shouldEnforceSerializable is true');

    store.foo = ['hi'];
    test.deepEquals(store.foo, ['hi']);

    store = new Store({ 
        foo: 'bar'
    }, { shouldEnforceSerializable: false });

    test.doesNotThrow(() => {
        store.foo = new Date();
    }, 'Setting a non-serializable value does not throw error when shouldEnforceSerializable is false');

    var myFunc = function() {
        return 1;
    };
    store = new Store({
        foo: myFunc
    }, {shouldExecFuncs: false});

    test.equals(store.foo, myFunc, 'Function values do not compute when shouldExecFuncs is false');

    var fallbackStore = new Store({
        foo: 'baz',
        bingo: 'bing'
    });

    store = new Store({
        foo: 'bar'
    }, { fallbacks: [fallbackStore] });

    test.equals(store.foo, 'bar');
    test.equals(store.bingo, 'bing');

    var overrideStore = new Store({
        bug: 'bear',
        bingo: 'bing'
    });

    store = new Store({
        foo: 'bar',
        bug: 'big'
    }, { overrides: [overrideStore] });

    test.equals(store.bug, 'bear');
    test.equals(store.bingo, 'bing');

    store = new Store({
        foo: 'bar',
        bug: 'big'
    }, { overrides: [overrideStore], fallbacks: [fallbackStore] });

    test.equals(store.bug, 'bear');
    test.equals(store.foo, 'bar');
    test.equals(store.bingo, 'bing');

    overrideStore = new Store({
        bug: 'bear',
        bingo: 'bing'
    });

    store = new Store({
        foo: 'bar',
        bug: 'big'
    }, { overrides: [overrideStore] });
    var didTrigger = false;
    store.on('change', evt => {
        didTrigger = true;
    })
    overrideStore.bug = 'mug';
    test.equals(didTrigger, true);
    test.end();
})