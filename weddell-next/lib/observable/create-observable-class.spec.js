import test from 'ava';
import { createObservableClass } from "../observable/create-observable-class.js";

const Observable = createObservableClass();

test('Basic observable functionality', t => {

    let observers = new Set;

    const observable = new Observable((observer) => {

        observers.add(observer);

        return () => observers.delete(observer)
    })

    t.is(observers.size, 0);

    const pool = [];

    const subscriber = observable.subscribe({ 
        next(data) {
            pool.push(data);
        }
    })

    t.is(observers.size, 1);
    t.deepEqual(pool, []);

    observers.forEach(observer => observer.next('hi'));

    t.deepEqual(pool, ['hi']);

    const pool2 = [];
    const subscriber2 = observable.subscribe({ 
        next(data) {
            pool2.push(data);
        }
    })

    t.is(observers.size, 2);

    observers.forEach(observer => observer.next('boy'));

    t.deepEqual(pool, ['hi', 'boy']);
    t.deepEqual(pool2, ['boy']);

    subscriber.unsubscribe();

    t.is(observers.size, 1);

    observers.forEach(observer => observer.next('gray'));

    t.deepEqual(pool, ['hi', 'boy']);
    t.deepEqual(pool2, ['boy', 'gray']);
});

test('Observable filter method', t => {
    let observers = new Set;

    const observable = new Observable((observer) => {

        observers.add(observer);

        return () => observers.delete(observer)
    });

    const evts = [];

    observable
        .filter(evt => evt.wig < 1)
        .subscribe({
            next(evt) {
                evts.push(evt);
            }
        })

    
    observers.forEach(obs => obs.next({ wig: 2 }));
    observers.forEach(obs => obs.next({ wig: 0 }));
    observers.forEach(obs => obs.next({ wig: 3 }));    
    observers.forEach(obs => obs.next({ wig: -1 }));

    t.deepEqual(evts, [
        {
            wig: 0
        },
        {
            wig: -1
        }
    ]);
});

test('Observable map method', t => {
    let observers = new Set;

    const observable = new Observable((observer) => {

        observers.add(observer);

        return () => observers.delete(observer)
    });

    const evts = [];

    observable
        .map(evt => evt.wig)
        .subscribe({
            next(evt) {
                evts.push(evt);
            }
        })

    
    observers.forEach(obs => obs.next({ wig: 2 }));
    observers.forEach(obs => obs.next({ wig: 0 }));
    observers.forEach(obs => obs.next({ wig: 3 }));    
    observers.forEach(obs => obs.next({ wig: -1 }));

    t.deepEqual(evts, [
        2,0,3,-1
    ]);
});

test('Observable filter and map methods combined', t => {
    let observers = new Set;

    const observable = new Observable((observer) => {

        observers.add(observer);

        return () => observers.delete(observer)
    });

    const evts = [];

    observable
        .map(evt => evt.wig)
        .filter(evt => evt < 1)
        .map(evt => `${evt} is a number`)
        .subscribe({
            next(evt) {
                evts.push(evt);
            }
        })

    
    observers.forEach(obs => obs.next({ wig: 2 }));
    observers.forEach(obs => obs.next({ wig: 0 }));
    observers.forEach(obs => obs.next({ wig: 3 }));    
    observers.forEach(obs => obs.next({ wig: -1 }));

    t.deepEqual(evts, [
        '0 is a number',
        '-1 is a number'
    ]);
});

test.todo('Test start')
test.todo('Test error')
test.todo('Test complete')