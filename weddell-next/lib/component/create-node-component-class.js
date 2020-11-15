import { createComponentClass, ON_CHILD_RENDER_RESULTS_CHANGE,
    ON_RENDER_FINISH } from "./create-component-class.js";
export const HTML = Symbol();

/**
 * @typedef {ReturnType<createNodeComponentClass>} NodeComponent 
 */
export const createNodeComponentClass = (opts) => {
    return class NodeComponentClass extends createComponentClass(opts) {

        constructor() {
            super(...arguments);
            this[HTML] = null;
        }

        [ON_CHILD_RENDER_RESULTS_CHANGE](renderResult, renderResultsByComponent) {
            return this[ON_RENDER_FINISH](...arguments);
        }

        [ON_RENDER_FINISH](renderResult, renderResultsByComponent, componentExpressionsByComponent) {
            const prevHtml = this[HTML];

            this[HTML] = Array.from(renderResultsByComponent.entries())
                .reduce((acc, [component, renderResult]) => {
                    return acc.replace(componentExpressionsByComponent.get(component).toString(), renderResult.html)
                }, renderResult?.html)

            this.push({ 
                eventName: 'htmlchange', 
                html: this[HTML], 
                // @ts-ignore
                prevHtml 
            });
        }
    }
}
