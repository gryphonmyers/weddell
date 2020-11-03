import test from 'ava';
import { isSerializable } from "./is-serializable";

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
});

test('Unserializable values are detected appropriately', t => {   
    t.false(isSerializable(function(hi){ return hi }));
    t.false(isSerializable(new Map([['hi', 'bye'], ['yes', '2']])));
    t.false(isSerializable(new Date()));
    t.false(isSerializable({ 
        time: new Date
    }));
    t.false(isSerializable([{ 
        time: new Date,
        yes: "ok"
    }]));
});