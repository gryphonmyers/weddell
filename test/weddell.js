const tap = require('tap');

import weddell from '../lib/presets/node.js';

tap.test('App works', async test => {
    
    test.test(async test => {

        test.notOk(weddell.Store.foo);

        weddell.use(function(weddell){
            const { createStoreClass } = weddell;

            return Object.assign(weddell, { 
                createStoreClass: function(obj) {
                    return class extends createStoreClass(obj) {
                        static get foo() {
                            return 'bar';
                        }
                    }
                }
            });
        });

        test.equals(weddell.Store.foo, 'bar');
    })
})