import escapeHtml from "../../escape-html";
import { UnescapedStringExpression } from "./unescaped-string-expression";

export class StringExpression extends UnescapedStringExpression {
    toString() {
        return escapeHtml(super.toString());
    }
}