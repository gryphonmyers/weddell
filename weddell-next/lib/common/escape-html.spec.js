import test from "ava";
import escapeHtml from "./escape-html.js";

test('Escapes html', t => {
    t.is(
        escapeHtml(`<div class="&hi"><span class='yo'><em class=\`so\`>Hey there</em></span></div>`), 
        '&lt;div class=&quot;&amp;hi&quot;&gt;&lt;span class=&#39;yo&#39;&gt;&lt;em class=&#96;so&#96;&gt;Hey there&lt;/em&gt;&lt;/span&gt;&lt;/div&gt;'
    );
})