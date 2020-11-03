import deepEqual from 'fast-deep-equal';
import { isSerializable } from "./is-serializable";

export const ERR_NOT_SERIALIZABLE = Symbol('ERR_NOT_SERIALIZABLE');
export const STATE_VALUE = Symbol();
export const IS_REACTIVE_STATE = Symbol();
export const SERIALIZABILITY_STALE = Symbol();

export function createReactiveStateClass({EventEmitter, Error}) {
    
    return class ReactiveState extends EventEmitter {
        
        constructor(val) {
            super();
            // @ts-ignore
            this[STATE_VALUE] = val;
            // @ts-ignore
            this[SERIALIZABILITY_STALE] = true;
        }

        get value() {
            // @ts-ignore
            if (this[SERIALIZABILITY_STALE]) {
                // @ts-ignore
                if (!isSerializable(this[STATE_VALUE])) {
                    throw new Error(ERR_NOT_SERIALIZABLE)
                }
                // @ts-ignore
                this[SERIALIZABILITY_STALE] = false;
            }
            // @ts-ignore
            this.trigger('get', {val: this[STATE_VALUE]});
            // @ts-ignore
            return this[STATE_VALUE];
        }
        set value(newVal) {
            // @ts-ignore
            const prevVal = this[STATE_VALUE];
            // @ts-ignore
            this[STATE_VALUE] = newVal;
            if (!deepEqual(prevVal, newVal)) {
                this.trigger('valuechange', {val: newVal, prevVal });
                // @ts-ignore
                this[SERIALIZABILITY_STALE] = true;
            }
        }
        get [IS_REACTIVE_STATE]() {
            return true;
        }
    }
}