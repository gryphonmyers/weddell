class Transform {
    constructor(opts) {
        var Sig = this.constructor.Weddell.classes.Sig;
        this.func = opts.func;
        this.from = new Sig(opts.from);
        this.to = new Sig(opts.to);
    }

    applyTransform(input) {
        return this.func(input);
    }

    static applyTransforms(input, transforms) {
        return transforms.reduce((finalVal, transform) => {
            return Array.isArray(transform) ? this.applyTransforms(finalVal, transform) : transform.applyTransform(finalVal);
        }, input);
    }

    static getMatchingTransforms(transforms, from, to) {
        return transforms.filter(transform => {
            return (!to || transform.to.checkIfMatch(to)) && (!from || transform.from.checkIfMatch(from));
        });
    }

    static compose(func, transforms) {
        return transforms ? transforms.reduce((composed, transform) => {
            return function(){
                return transform.applyTransform(composed.apply(this, arguments));
            }
        }, func) : func;
    }

    static getTransformPath(transforms, from, to, _soFar) {
        //TODO add heuristics to make this process faster
        if (!_soFar) _soFar = [];
        if (from.checkIfMatch(to)) {
            return _soFar.concat(transforms.filter(transform => transform.from.checkIfMatch(from) && transform.to.checkIfMatch(to) && _soFar.indexOf(transform) === -1));
        }
        return transforms.filter(transform => {
            return transform.from.checkIfMatch(from, true);
        }).reduce((finalVal, transform) => {
            return finalVal || this.getTransformPath(transforms, transform.to, to, _soFar.concat(transform));
        }, null);
    }
}

Transform.heuristics = {};

module.exports = Transform;
