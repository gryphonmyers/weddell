import ComponentExpression from "../expressions/component-expression.js";

export const COMPONENT_ARTIFACTS_BY_EXPRESSION = Symbol();

export default RenderResult => 
    class extends RenderResult {

        constructor() {
            super(...arguments);
            this[COMPONENT_ARTIFACTS_BY_EXPRESSION] = new Map;
        }

        get componentExpressions() {
            return Array.from(this[COMPONENT_ARTIFACTS_BY_EXPRESSION].keys());
        }

        async renderComponentArtifacts() {
            return Promise.all(this.componentExpressions.map(async exp => {
                const componentArtifact = await exp.renderArtifact();

                this[COMPONENT_ARTIFACTS_BY_EXPRESSION].set(exp, componentArtifact);
                
                return [exp, componentArtifact];
            }));
        }

        transformExpression(exp) {
            if (exp instanceof ComponentExpression) {
                const key = exp.key || this[COMPONENT_ARTIFACTS_BY_EXPRESSION].size;
                
                exp.depth = this.depth;

                this[COMPONENT_ARTIFACTS_BY_EXPRESSION].set(exp, null);
                
                if (!exp.key) exp.key = key;

                return exp;
            }
            return super.transformExpression(exp);
        }

    }