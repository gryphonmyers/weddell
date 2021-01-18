export const CHILD_RENDER_ARTIFACTS_BY_RESULT = Symbol();
export const EXPRESSIONS = Symbol();
export const TRANSFORMED_EXPRESSIONS = Symbol();
export const CHILD_RENDER_RESULTS = Symbol();
export const TRANSFORMED_CHILD_RENDER_RESULTS = Symbol();
export const ARTIFACT = Symbol();
export const TRANSFORM_EXPRESSIONS = Symbol();
export const SEGMENTS = Symbol();
export const HTML = Symbol();
export const PARENT = Symbol();
export const EXPRESSIONS_BY_CLASS = Symbol();
export const KEY = Symbol();
export const DEPTH = Symbol();
export const GET_CHILD_RENDER_RESULT_KEY = Symbol();
export const EXPLICIT_KEY = Symbol();
export const CHILD_KEYS_BY_RENDER_RESULT = Symbol();
export const ID = Symbol();
export const ORIGINAL_EXPRESSIONS = Symbol();

/**
 * 
 * @typedef {ReturnType<createRenderResultClass>} BaseRenderResult
 */
export const createRenderResultClass = ({}={}) => 
    /**
     * @abstract
     * @template T
     */
    class RenderResult {

        constructor({ segments, expressions, parent=null, key=null }) {
            this[SEGMENTS] = segments;
            this[EXPRESSIONS] = expressions;
        }

        transformExpression(exp) {
            return exp;
        }

        set [EXPRESSIONS](val) {
            this[ORIGINAL_EXPRESSIONS] = val;
        }

        get [EXPRESSIONS]() {
            return this[TRANSFORMED_EXPRESSIONS] || (
                this[TRANSFORMED_EXPRESSIONS] = this[ORIGINAL_EXPRESSIONS]
                    .map(exp => this.transformExpression(exp))
            )                
        }

        get artifact() {
            return this[ARTIFACT] || (this[ARTIFACT] = this.toArtifact())
        }

        /**
         * Returns the render result as an artifact.
         * 
         * @abstract
         * @returns {any}
         */

        toArtifact() {
            throw new Error('Not implemented');
        }

        /**
         * Outputs this render result as unpatched HTML.
         * 
         * @returns {HtmlString}
         */

        toHtml() {
            return this[SEGMENTS].reduce((acc, curr, ii) =>
                `${acc}${curr}${this[EXPRESSIONS][ii] || ''}`
            , '')
        }

        /**
         * Gets the html representation of this render result (cached if possible).
         * 
         * @returns {HtmlString}
         */

        get html() {
            return this[HTML] || (this[HTML] = this.toHtml());
        }

        toString() {
            return this.html;
        }
    }