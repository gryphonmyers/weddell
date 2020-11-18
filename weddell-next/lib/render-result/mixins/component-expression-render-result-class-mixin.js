import { ComponentExpression } from "../expressions/component-expression.js";

export const COMPONENT_ARTIFACTS_BY_EXPRESSION = Symbol();

export const componentExpressionRenderResultClassMixin = RenderResult => 
    class extends RenderResult {

        constructor() {
            super(...arguments);
            this[COMPONENT_ARTIFACTS_BY_EXPRESSION] = new Map;
        }

        get componentExpressions() {
            //ensure transformations have been applied
            this.html;
            return Array.from(this[COMPONENT_ARTIFACTS_BY_EXPRESSION].keys());
        }

        transformExpression(exp) {
            if (exp instanceof ComponentExpression) {
                const key = exp.key || this[COMPONENT_ARTIFACTS_BY_EXPRESSION].size;

                this[COMPONENT_ARTIFACTS_BY_EXPRESSION].set(exp, null);
                
                if (!exp.key) exp.key = key;

                return exp;
            }
            return super.transformExpression(exp);
        }

    }