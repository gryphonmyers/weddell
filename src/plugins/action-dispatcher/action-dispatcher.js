var mix = require('mixwith-es5').mix;
var EventEmitterMixin = require('../../core/event-emitter-mixin');
var hasMixin = require('mixwith-es5').hasMixin;

var ActionDispatcher = class extends mix(ActionDispatcher).with(EventEmitterMixin) {
    constructor(opts) {
        super(opts);
        this._dispatchees = [];
    }

    addDispatchee(dispatchee) {
        if (!hasMixin(dispatchee, EventEmitterMixin)) {
            console.warn("Attempted to add a non-event emitter object as a dispatchee to the action dispatcher.");
        }
        if (this._dispatchees.indexOf(dispatchee) === -1) {
            this._dispatchees.push(dispatchee);
            return this.trigger('adddispatchee', {dispatchee});
        }
        return false;
    }

    dispatch(actionName, actionData) {
        var result = this._dispatchees.map(dispatchee =>
            dispatchee.trigger(actionName, Object.assign({}, actionData)));
        this.trigger('dispatch', {actionName, actionData});
        return result;
    }
};

module.exports = ActionDispatcher;
