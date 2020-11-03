import {EventHandlerExpression} from "../expressions/event-handler-expression";

export const CALLBACKS_BY_TOKEN = Symbol();

export default RenderResult => class extends RenderResult {
    
    constructor() {
        super(...arguments);
        this[CALLBACKS_BY_TOKEN] = new Map;
    }

    invokeHandler(token, event, scope) {
        const cb = this[CALLBACKS_BY_TOKEN].get(token);

        cb.call(scope, event);
    }

    transformExpression(expr) {
        if (typeof expr === 'function') {
            const token = this[CALLBACKS_BY_TOKEN].size;
            this[CALLBACKS_BY_TOKEN].set(token, expr);

            return new EventHandlerExpression(token);
        }

        return super.transformExpression(expr)
    }
}