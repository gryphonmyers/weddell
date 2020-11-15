import {StringExpression} from "../expressions/string-expression.js";
/**
 * @param {import("../create-base-render-result-class").BaseRenderResult} RenderResult 
 * @returns {import("../create-base-render-result-class").BaseRenderResult}
 */
export function stringExpressionRenderResultClassMixin(RenderResult) {
    return class extends RenderResult {   
        transformExpression(expr) {
            if (typeof expr === 'string') {
                return new StringExpression(expr);
            }
            return super.transformExpression(expr);
        }
    }
}