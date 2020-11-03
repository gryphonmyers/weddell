import {ArrayExpression} from "../expressions/array-expression";

export default RenderResult =>
    class extends RenderResult {
        transformExpression(exp) {
            if (Array.isArray(exp)) {
                return new ArrayExpression(...exp.map(item => this.transformExpression(item)));
            }
            return super.transformExpression(exp);
        }
    }