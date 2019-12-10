import h from 'virtual-dom/h';

import {
    ASSIGN_PROPS, 
    RENDER_RESULTS,
    RENDERERS
} from './symbols/component';
import {
    WIDGET
} from './symbols/vdom';

export default ({Renderer, VdomWidget}) => class VdomRenderer extends Renderer {

    constructor({ template, getComponentClass, getComponentInstance, getContent }={}) {
        super(...arguments);
        this.getComponentClass = getComponentClass;
        this.getComponentInstance = getComponentInstance;
        this.getContent = getContent;
        this.template = template;
    }

    h(renderedWidgets, tagName, properties={}, children=[]) {
        if (Array.isArray(properties)) {
            children = properties;
            properties = {};
        }
        
        tagName = tagName.toLowerCase();

        if (this.getComponentClass(tagName)) {
            const widget = new VdomWidget({ tagName, properties, children })
            renderedWidgets.push(widget);
            return widget;
        } else if (tagName === 'content') {
            return this.getContent();
        }
        
        return h(tagName, properties, new Proxy(children.flat(), { 
            get: (obj, key) => {
                if (obj[key] instanceof VdomWidget) {
                    return obj[key].component ? obj[key].component[WIDGET] : obj[key];
                }
                return obj[key];
            }
        }));
    }

    async render([locals]) {
        const renderedWidgets = [];

        const markup = this.template(locals, this.h.bind(this, renderedWidgets));

        const renderedComponents = await Promise.all(
            renderedWidgets
                .map(async widget => {
                    const component = await this.getComponentInstance({instanceKey: widget.vdomKey, tagName: widget.tagName});

                    component[WIDGET] = widget;
                    widget.setComponent(component);

                    const propsDirty = await component[ASSIGN_PROPS](widget.properties.attributes);
                    const childrenDirty = component.setChildren(widget.children);

                    if (!component[RENDER_RESULTS].vdom || propsDirty || childrenDirty) {
                        await component[RENDERERS].vdom.request(component.state);
                    }

                    return component;
                })
        );

        return { renderedComponents, markup };
    }
}