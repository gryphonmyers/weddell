import test from 'ava';
import { isSerializable } from "./is-serializable.js";

test('Serializable values are detected appropriately', t => {   
    t.true(isSerializable(true));
    t.true(isSerializable(false));
    t.true(isSerializable(null));
    t.true(isSerializable(1));
    t.true(isSerializable(undefined));
    t.true(isSerializable("hi"));
    t.true(isSerializable(["hi", 2, true]));
    t.true(isSerializable(["hi", ["hi", null, 2, { bye: "boy" }]]));
    t.true(isSerializable({
        hi: 'bye',
        woo: [
            "hi",
            {
                wig: true
            }
        ]
    }));
    t.true(isSerializable(new Date)); //Dates implement the toJSON method
    t.true(isSerializable({ 
        time: new Date
    }));
    t.true(isSerializable([{ 
        time: new Date,
        yes: "ok"
    }]));
});

test('Unserializable values are detected appropriately', t => {
    class MyClass {
        foo='bar'
    }
    t.false(isSerializable(function(hi){ return hi }));
    t.false(isSerializable(new Map([['hi', 'bye'], ['yes', '2']])));
    t.false(isSerializable(new MyClass));
    t.false(isSerializable({ 
        time: new MyClass
    }));
    t.false(isSerializable([{ 
        time: new MyClass,
        yes: "ok"
    }]));
});