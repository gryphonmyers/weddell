import test from "ava";
import { stringExpressionRenderResultClassMixin } from "./string-expression-render-result-class-mixin.js";
import { createRenderResultClass } from '../create-base-render-result-class.js';

const StringRenderResult = stringExpressionRenderResultClassMixin(class GenericRenderResult extends createRenderResultClass() {
    toArtifact() {
        return this.toHtml();
    }
});

test('String expression render result class mixin returns expected results', t => {
    t.is(
        `${new StringRenderResult({
            segments: ['<div class="woo">',"</div>"],
            expressions: ['<div class="hi">Hello</div>']
        })}`,
        '<div class="woo">&lt;div class=&quot;hi&quot;&gt;Hello&lt;/div&gt;</div>'
    )
})