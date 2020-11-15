import { RESOLVE_COMPONENT, RENDER } from "./component-symbols.js";

export default ({ RenderResult }) => class ComponentRenderHandle {

    constructor({ componentName, attrs, content, parent }) {
        this.attrs = attrs;
        this.key = attrs.key;
        this.content = content instanceof RenderResult
            ? { 'default' : content }
            : content;
        this.componentName = componentName;
        this.parent = parent;
        this.renderResult = null;
        this.didRender = false;
        this.component = null;
    }

    async render() { 
        const { parent, componentName, key, attrs, content } = this;
        
        if (this.didRender) {
            return this;
        }

        this.component = await parent[RESOLVE_COMPONENT](componentName, key, {
            attrs,
            content
        });

        this.renderResult = await this.component[RENDER]();
        this.didRender = true;

        return this;
    }
}