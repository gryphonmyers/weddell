import { CONTENT } from "./component-symbols.js";

export default ({}) => class Slot {
    constructor({name, defaultContent, component}) {
        this.name = name;
        this.defaultContent = defaultContent;
        this.component = component;
    }

    async render() {
        const { component, name, defaultContent } = this;
        const content = (component[CONTENT][name] || defaultContent);
        return content && content.render();
    }
}