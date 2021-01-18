import { ComponentExpression } from "../expressions/component-expression.js";

export default ({ RenderResult, depth }) =>
    function (componentName, props, content) {
        if (props instanceof RenderResult) {
            content = props;
            props = {};
        }
        return new ComponentExpression({ componentName, props, content, depth })
    }