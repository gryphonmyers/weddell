import escapeHtml from "../../common/escape-html.js";
import { UnescapedStringExpression } from "./unescaped-string-expression.js";

export class StringExpression extends UnescapedStringExpression {
    toString() {
        return escapeHtml(super.toString());
    }
}