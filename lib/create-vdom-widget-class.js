import { RENDER_RESULTS } from './symbols/component';

export default () => class VdomWidget {
    constructor({tagName, properties={}, children=[], component=null}) {
        this.type = 'Widget';
        this.properties = properties;
        this.children = children;
        this.vdomKey = properties.key || 
            (properties.attributes && 
                (properties.attributes['data-component-key'] ||
                properties.attributes.id)
            );
        this.tagName = tagName;
        this.timestamp = Date.now();
        this.component = component;
    }

    refresh() {
        const {tagName, properties, children, component } = this;
        return new (this.constructor)({tagName, properties, children, component });
    }

    ['setComponent'](component) {
        return this.component = component;
    }

    update() {

    }

    destroy() {

    }

    init() {

    }

    render() {
        return this.component[RENDER_RESULTS].vdom.output;
    }
}