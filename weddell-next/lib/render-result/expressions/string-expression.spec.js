import test from "ava";
import { StringExpression } from "./string-expression.js";

test('String expression works as expected', t => {
    t.is(
        `${new StringExpression(`<div class="&hi"><span class='yo'><em class=\`so\`>Hey there</em></span></div>`)}`,
        '&lt;div class=&quot;&amp;hi&quot;&gt;&lt;span class=&#39;yo&#39;&gt;&lt;em class=&#96;so&#96;&gt;Hey there&lt;/em&gt;&lt;/span&gt;&lt;/div&gt;'
    );
})