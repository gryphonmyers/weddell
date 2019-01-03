const defaults = require('defaults-es6');

module.exports = class VdomThunk {
    clone(opts) {
        return new this.constructor(defaults(opts, this._opts));
    }

    constructor(opts={}) {
        this.type = 'Thunk';
        this.component = opts.component;
        this._opts = opts;
    }

    render() {}
}