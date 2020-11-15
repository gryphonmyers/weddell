import componentExpressionRenderResultClassMixin from "./component-expression-render-result-class-mixin.js";
import { COMPONENT_EXPRESSIONS } from "./component-expression-render-result-class-mixin.js";

export default RenderResult => 
    class extends componentExpressionRenderResultClassMixin(RenderResult) {
        
        
        toArtifact(componentsByExpression) {
            const template = super.toArtifact();

            this[COMPONENT_EXPRESSIONS].forEach((expression,k) =>{
                const placeholder = template.getElementById(expression.id);

                
                const component = componentsByExpression.get(expression);

            })

        }

        
        // toDomTemplate() {
        //     const template = super.toDomTemplate(arguments);
    
        //     template.addEventListener('componentmarkerload', evt => {
        //         evt.stopPropagation();
        //         const {detail: {key}} = evt;
    
        //         const expression = this[COMPONENT_EXPRESSIONS].get(key);
                

        //         // cb.call(event.target, event);
        //     });
    
        //     return template;
        // }


    // constructor({ componentName, attrs, content, parent }) {
    //     this.attrs = attrs;
    //     this.key = attrs.key;
    //     this.content = content instanceof RenderResult
    //         ? { 'default' : content }
    //         : content;
    //     this.componentName = componentName;
    //     this.parent = parent;
    //     this.renderResult = null;
    //     this.didRender = false;
    //     this.component = null;
    // }

    // async render() { 
    //     const { parent, componentName, key, attrs, content } = this;
        
    //     if (this.didRender) {
    //         return this;
    //     }

    //     this.component = await parent[RESOLVE_COMPONENT](componentName, key, {
    //         attrs,
    //         content
    //     });

    //     this.renderResult = await this.component[RENDER]();
    //     this.didRender = true;

    //     return this;
    // }
    }