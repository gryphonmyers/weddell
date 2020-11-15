import deepEqual from 'fast-deep-equal';
import { isSerializable } from "./is-serializable.js";

export const ERR_NOT_SERIALIZABLE = Symbol('ERR_NOT_SERIALIZABLE');
export const STATE_VALUE = Symbol();
export const PUSH_NEXT = Symbol();

export function createReactiveStateClass({PushableObservable, Error}) {
    
    return class ReactiveState extends PushableObservable {
        
        constructor(val) {
            super();
            // @ts-ignore
            this.value = val;
        }

        get value() {
            // @ts-ignore
            this.push({ eventName: 'get', val: this[STATE_VALUE] })
            // @ts-ignore
            return this[STATE_VALUE];
        }

        set value(val) {
            // @ts-ignore
            const prevVal = this[STATE_VALUE];
            
            if (!deepEqual(prevVal, val)) {
                if (!isSerializable(val)) {
                    throw new Error('ERR_NOT_SERIALIZABLE')
                }
                // @ts-ignore
                this[STATE_VALUE] = val;
                this.push({ eventName: 'valuechange', val, prevVal });
            }
        }
    }
}