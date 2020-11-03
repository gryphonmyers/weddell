
import { createRenderResultClass } from "./create-base-render-result-class";
import domEventHandlerExpressionRenderResultClassMixin from "./mixins/dom-event-handler-expression-render-result-class-mixin";
import arrayExpressionRenderResultClassMixin from "./mixins/array-expression-render-result-class-mixin";
import {stringExpressionRenderResultClassMixin} from "./mixins/string-expression-render-result-class-mixin";

export const domRenderResultMixins = [
    domEventHandlerExpressionRenderResultClassMixin,
    arrayExpressionRenderResultClassMixin,
    stringExpressionRenderResultClassMixin    
];

export const createDomRenderResultClass = ({ document, mixins=domRenderResultMixins }) => 
    mixins
        .reduce((acc, curr) => curr(acc), 
            class DomRenderResult extends createRenderResultClass({}) {

                /**
                 * @returns {HTMLTemplateElement}
                 */

                toArtifact() {
                    const template = document.createElement('template');
                    template.innerHTML = this.html;
                    return template;
                }

                /**
                 * 
                 * @param {HTMLTemplateElement} renderArtifact
                 * 
                 * @returns {HTMLTemplateElement}
                 */

                // patchInto(renderArtifact) {
                //     const childArtifact = this.getPatchedArtifact();

                //     if (childArtifact.previousElementSibling && childArtifact.previousElementSibling.id === renderArtifact.id) {
                //         // Child is already in the target
                //         return renderArtifact;
                //     }

                //     const placeholder = renderArtifact.content.getElementById(renderArtifact.id);

                //     if (placeholder) {
                //         //@TODO do we need to clean up elements that got inserted previously?
                //         placeholder.parentNode.insertBefore(childArtifact, placeholder.nextSibling);
                //     }

                //     return renderArtifact;
                // }
            }
        )