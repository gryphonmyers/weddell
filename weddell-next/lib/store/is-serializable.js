export function isSerializable(val) {
    return val && typeof val === 'object'
        ? (Array.isArray(val) || val.constructor === Object || Object.getPrototypeOf(val) === null || typeof val.toJSON === 'function') && Object.values(val).every(isSerializable) 
        : val == null || typeof val === 'string' || typeof val === 'boolean' || typeof val === 'number';
}