import {ArrayExpression} from "../expressions/array-expression.js";

export default RenderResult =>
    class extends RenderResult {
        transformExpression(exp) {
            if (Array.isArray(exp)) {
                return new ArrayExpression(...exp.map(item => this.transformExpression(item)));
            }
            return super.transformExpression(exp);
        }
    }