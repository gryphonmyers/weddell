import test from "ava";
import { UnescapedStringExpression } from "./unescaped-string-expression.js";

test('Unescaped string expression works as expected', t => {
    t.is(
        `${new UnescapedStringExpression(`<div class="&hi"><span class='yo'><em class=\`so\`>Hey there</em></span></div>`)}`,
        `<div class="&hi"><span class='yo'><em class=\`so\`>Hey there</em></span></div>`
    );
})