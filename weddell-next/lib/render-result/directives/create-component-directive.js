import { ComponentExpression } from "../expressions/component-expression.js";

export default ({ RenderResult, depth }) =>
    function (componentName, attrs, content) {
        if (attrs instanceof RenderResult) {
            content = attrs;
            attrs = {};
        }
        return new ComponentExpression({ componentName, attrs, content, depth })
    }