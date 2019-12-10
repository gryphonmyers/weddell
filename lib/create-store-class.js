import deepEqual from 'fast-deep-equal';

const CHANGED_KEYS = Symbol('changedKeys');
const FUNC_KEY_DEPS = Symbol('keyDeps');
const FUNC_KEYS_BY_DEP_KEY = Symbol('funcKeysByDepKey');
const EXECUTE_FUNCTION_PROPERTY = Symbol('executeFunctionProperty');
const FUNC_KEY_VALUES = Symbol('funcKeyValues');
const STALE_FUNC_KEYS = Symbol('staleFuncKeys');

function isSerializable(val) {
    return val && typeof val === 'object' ?
        (Array.isArray(val) || val.constructor === Object || Object.getPrototypeOf(val) === null) && Object.values(val).every(isSerializable) :
        (val == null || typeof val === 'string' || typeof val === 'boolean' || typeof val === 'number');
}

export default ({EventEmitter}) => class Store extends EventEmitter {
    constructor(data, {
        shouldExecFuncs=true, 
        shouldMonitorChanges=true, 
        shouldEnforceSerializable=true, 
        immutable=false,
        fallbacks=[],
        overrides=[]
    }={}) {
        super();

        [...overrides, ...fallbacks]
            .forEach(store => {
                Object.assign(this, 
                    Object.keys(store)
                        .reduce((acc, curr) => 
                            Object.assign(acc, {[curr]: null})
                        , {})
                )
                store.proxyEvents(this);
            });
        
        Object.assign(this, data);

        [
            FUNC_KEYS_BY_DEP_KEY, 
            STALE_FUNC_KEYS, 
            FUNC_KEY_VALUES, 
            FUNC_KEY_DEPS
        ].forEach(key => this[key] = {});

        this[CHANGED_KEYS] = [];

        Object.defineProperty(this, 'proxy', {
            value: new Proxy(this, {
                get: (obj, key) => {
                    if (!obj.propertyIsEnumerable(key)) {
                        return obj[key];
                    }
    
                    var value = [...overrides, obj, ...fallbacks]
                        .reduce((acc, curr) => {
                            return acc != null ? 
                                acc :
                                (shouldExecFuncs ? curr[EXECUTE_FUNCTION_PROPERTY](curr[key], key) : curr[key])
                        }, null);

                    this.emit('get', {key, value});
    
                    return value;
                },
                set: (obj, key, newValue) => {
                    if (!obj.propertyIsEnumerable(key)) {
                        obj[key] = newValue;
                        return true;
                    }
                    if (immutable) {
                        throw new Error(`Can't set key ${key}, as store is immutable.`);
                    }
                    if (shouldEnforceSerializable && !isSerializable(newValue)) {
                        throw new Error(`Value being set to ${key} is not serializable`);
                    }
                    const oldValue = obj[key];
                    
                    if (shouldMonitorChanges && !deepEqual(newValue, oldValue)) {
                        this[CHANGED_KEYS].push(key);
                        if (shouldExecFuncs && this[FUNC_KEYS_BY_DEP_KEY][key]) {
                            for (var funcKey in this[FUNC_KEYS_BY_DEP_KEY][key]) {
                                this[STALE_FUNC_KEYS][funcKey] = 1;
                            }
                        }
                        this.emit('change', {
                            target: this, 
                            changedKey: key,
                            newValue,
                            oldValue
                        });
                    }
    
                    obj[key] = newValue;
                    return true;
                }
            })
        });
        Object.seal(this);
        return this.proxy;
    }

    [EXECUTE_FUNCTION_PROPERTY](value, funcKey) {
        if (typeof value !== 'function') {
            return value;
        }

        if (!(funcKey in this[FUNC_KEY_VALUES]) || funcKey in this[STALE_FUNC_KEYS]) {
            const accKeys = {};

            for (var depKey in this[FUNC_KEY_DEPS][funcKey] || {}) {
                if (depKey in this[FUNC_KEYS_BY_DEP_KEY]) {
                    delete this[FUNC_KEYS_BY_DEP_KEY][depKey][funcKey];
                }
            }
            var onGet = ({key}) => {
                accKeys[key] = 1;
                if (!(key in this[FUNC_KEYS_BY_DEP_KEY])) this[FUNC_KEYS_BY_DEP_KEY][key] = {};
                this[FUNC_KEYS_BY_DEP_KEY][key][funcKey] = 1;
            };
            this.on('get', onGet);
            value = value.call(this.proxy);
            this.off('get', onGet);

            this[FUNC_KEY_DEPS][funcKey] = accKeys;
            
            delete this[STALE_FUNC_KEYS][funcKey];

            return this[FUNC_KEY_VALUES][funcKey] = value;
        }
        
        return this[FUNC_KEY_VALUES][funcKey];
    }
}