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
            // this[CHILD_RENDER_ARTIFACTS_BY_RESULT] = new Map;
            // this[EXPRESSIONS_BY_CLASS] = new Map;

            // this[CHILD_RENDER_RESULTS] = new Map;
            // this[EXPLICIT_KEY] = key;
            // this[PARENT] = parent;
            // this[EXPRESSIONS] = expressions;
            this[SEGMENTS] = segments;
            this[EXPRESSIONS] = expressions;
            // this[CHILD_RENDER_RESULTS] = this[EXPRESSIONS]
            //     .flat(1)
            //     .filter(exp => exp instanceof RenderResult);
            // this[CHILD_KEYS_BY_RENDER_RESULT] = new Map(
            //     Object.entries(this[CHILD_RENDER_RESULTS])
            //         .map(([k,v]) => [
            //             v,
            //             v[EXPLICIT_KEY] != null
            //                 ? v[EXPLICIT_KEY]
            //                 : k
            //         ])
            // );
        }

        // get segments() {
        //     return this[SEGMENTS];
        // }

        transformExpression(exp) {
            // if (exp instanceof RenderResult) {
            //     return exp.clone({ 
            //         parent: this, 
            //         key: exp.key != null 
            //             ? exp.key 
            //             : this[CHILD_RENDER_RESULTS].indexOf(exp)
            //     });
            // }
            return exp;
        }

        // clone({parent=this.parent, key=this.key}) {
        //     const newRr = new (this.constructor)({segments: this.segments, expressions: this[EXPRESSIONS], parent, key});
            
        //     newRr[ARTIFACT] = this[ARTIFACT];
        //     newRr[TRANSFORMED_EXPRESSIONS] = this[TRANSFORMED_EXPRESSIONS];
        //     newRr[TRANSFORMED_CHILD_RENDER_RESULTS] = this[TRANSFORMED_CHILD_RENDER_RESULTS];
        //     newRr[CHILD_RENDER_RESULTS] = this[CHILD_RENDER_RESULTS];
        //     newRr[HTML] = this[HTML];

        //     return newRr;
        // } 
        
        // get artifact() {
        //     return this[ARTIFACT] || (this[ARTIFACT] = this.toArtifact());
        // }

        // get [ID]() {
        //     return `render-result-${this[DEPTH] 
        //         ? `${this[DEPTH]}-${this[KEY]}` 
        //         : 0}`
        // }

        // [TRANSFORM_EXPRESSIONS]() {
        //     this[CHILD_RENDER_RESULTS] = this[EXPRESSIONS]
        //         .flat(1)
        //         .filter(exp => exp instanceof RenderResult);
            
        //     this[TRANSFORMED_EXPRESSIONS] = this[EXPRESSIONS]
        //         .map(exp => this.transformExpression(exp));
        // }

        // get childRenderResults() {
        //     if (!this[CHILD_RENDER_RESULTS]) {
        //         this[TRANSFORM_EXPRESSIONS]();
        //     }
        //     return this[TRANSFORMED_CHILD_RENDER_RESULTS];
        // }

        // get [DEPTH]() {
        //     return this[PARENT]
        //         ? this[PARENT][DEPTH] + 1
        //         : 0
        // }

        // set [EXPRESSIONS](val) {
            
        // }

        // get [EXPRESSIONS]() {
        //     return this[TRANSFORMED_EXPRESSIONS];
        // }

        // [GET_CHILD_RENDER_RESULT_KEY](rr) {
        //     const ii = this[CHILD_RENDER_RESULTS].findIndex(rr);
        //     if (ii > -1) {
        //         const child = this[CHILD_RENDER_RESULTS][ii];
                
        //         return child[KEY] != null
        //             ? child[KEY]
        //             : ii;
        //     }
        //     return null;
        // }

        // get [KEY]() {
        //     return this[EXPLICIT_KEY] != null
        //         ? this[EXPLICIT_KEY]
        //         : this[PARENT]
        //             ? this[PARENT][CHILD_KEYS_BY_RENDER_RESULT].get(this)
        //             : null;
        // }

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

        

        // toArtifact() {
        //     return this.html;
        //     // throw new Error('unimplemented')
        // }

        /**
         * Gets the value of this render result. Can be used for equality comparison of two render results.
         */

        // valueOf() {
        //     return this.html;
        // }

        // toString() {
        //     return `<template id="${this[ID]}"></template>`;
        // }

        // get childRenderResultsByKey() {
        //     return this.childRenderResults
        //         .reduce((acc, childRr, ii) =>
        //             acc.set(childRr.key == null 
        //                     ? ii 
        //                     : childRr.key, childRr)
        //         , new Map)
        // }

        /**
         * Compares this render result tree against another, referencing any unchanged child render result artifacts into this one.
         * 
         * @param {RenderResult} renderResult
         * 
         * @returns {void}
         */

        // ingestUnchangedArtifacts(renderResult) {
        //     if (!this[ARTIFACT] && renderResult == this) {
        //         this[ARTIFACT] = renderResult.artifact;
        //     }

        //     const prevChildRenderResultsByKey = renderResult ? renderResult.childRenderResultsByKey : new Map;

        //     this.childRenderResults.forEach((childRr, ii) => {
        //         const prevChildRr = prevChildRenderResultsByKey.get(
        //             childRr.key == null 
        //                 ? ii 
        //                 : childRr.key
        //         );
                
        //         childRr.ingestUnchangedArtifacts(prevChildRr);
        //     });
        // }

        /**
         * Patches this render result into a parent artifact.
         * 
         * @abstract
         * @param {T} parentArtifact 
         */

        // patchInto(parentArtifact) {
        //     throw new Error('Not implemented');
        // }

        /**
         * Gets a rendered artifact of this result, with all child artifacts patched into it.
         * 
         * @returns {T}
         */

        // getPatchedArtifact() {
        //     return this.childRenderResults.reduce((acc, curr) => 
        //         curr.patchInto(acc), this.artifact);
        // }

        /**
         * Returns a new RenderResult matching the provided RenderResult, reusing any unchanged values from either input.
         * @param {*} renderResult 
         */

        // morph(renderResult) {
        //     if (renderResult == this) {

        //     }
        // }
    }