
import { createRenderResultClass } from "./create-base-render-result-class.js";
import eventHandlerExpressionRenderResultClassMixin from "./mixins/event-handler-expression-render-result-class-mixin.js";
import arrayExpressionRenderResultClassMixin from "./mixins/array-expression-render-result-class-mixin.js";
import {stringExpressionRenderResultClassMixin} from "./mixins/string-expression-render-result-class-mixin.js";
import { componentExpressionRenderResultClassMixin } from "./mixins/component-expression-render-result-class-mixin.js";

export const nodeRenderResultMixins = [
    eventHandlerExpressionRenderResultClassMixin,
    arrayExpressionRenderResultClassMixin,
    stringExpressionRenderResultClassMixin,
    componentExpressionRenderResultClassMixin
];

export const createNodeRenderResultClass = ({mixins=nodeRenderResultMixins}={}) =>
    mixins
        .reduce((acc, curr) => curr(acc), 
            class NodeRenderResult extends createRenderResultClass({}) {

                /**
                 * @returns {HtmlString}
                 */
                
                toArtifact() {
                    return this.html;
                }

                // patchInto(renderArtifact) {
                //     return renderArtifact
                //         .replace(`${this}`, this.getPatchedArtifact());
                // }

                /**
                 * Given a render artifact, 
                 * 
                 * @abstract
                 * @param {T} artifactToPatch 
                 * @param {RenderResult} childExpression 
                 * @param {HtmlString} childRenderArtifact 
                 * 
                 * @returns {HtmlString}
                 */

                // static patchRenderArtifact(artifactToPatch, childExpression, childRenderArtifact) {
                //     return 
                // }
            }
            
        )
    