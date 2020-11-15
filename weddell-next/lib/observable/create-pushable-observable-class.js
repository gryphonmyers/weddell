export const OBSERVERS = Symbol();

/** @typedef {ReturnType<createPushableObservableClass>} PushableObservable */

export function createPushableObservableClass({Observable}) {

    return class PushableObservable extends Observable {
        constructor() {
            super(obs => {
                this[OBSERVERS].add(obs);

                return () => this[OBSERVERS].delete(obs);
            });            
            this[OBSERVERS] = new Set;
        }

        push(evt) {
            //Clone the set so that we don't end up with infinite loops if the next callback adds more subscribers
            new Set(this[OBSERVERS]).forEach(obs => obs.next(evt));
        }
    }    
}