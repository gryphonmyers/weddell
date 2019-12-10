import createVdomRendererClass from '../create-vdom-renderer-class';
import createVdomWidgetClass from '../create-vdom-widget-class';

import {
    RENDERERS,
    RENDER_RESULTS,
    BIND_TEMPLATE_FUNCTION,
    GET_COMPONENT_INSTANCE,
    COMPONENT_CLASSES,
    MAKE_COMPONENT_INSTANCE,
    INIT
} from '../symbols/component';
import {
    WIDGET,
    CHILDREN_DIRTY
} from '../symbols/vdom';

export default function(weddell) {
    const { createComponentClass } = weddell;

    Object.assign(weddell, {
        createComponentClass: function () {
            return class extends createComponentClass(...arguments) {

                constructor({parent}={}) {
                    super(...arguments);
                    
                    var widget = null;
                    var childrenDirty = false;
                    Object.defineProperties(this, {
                        [WIDGET]: {
                            get: () => {
                                if (widget.timestamp < this[RENDER_RESULTS].vdom.timestamp ||
                                    this[CHILDREN_DIRTY]) {
                                    widget = widget.refresh();
                                    this[CHILDREN_DIRTY] = false;
                                }
                                return widget;
                            }, 
                            set: (val) => widget = val
                        },
                        [CHILDREN_DIRTY]: {
                            get: () => childrenDirty,
                            set: (val) => {
                                if (val && parent) {
                                    parent[CHILDREN_DIRTY] = true;
                                }
                                childrenDirty = val;
                            } 
                        }
                    });
                    this[RENDERERS].vdom = new weddell.VdomRenderer({
                        template: this[BIND_TEMPLATE_FUNCTION]('vdom', this.constructor.markup),
                        getComponentInstance: this[GET_COMPONENT_INSTANCE].bind(this),
                        getComponentClass: (name) => {
                            return this[COMPONENT_CLASSES][name];
                        },
                        onRender: async ({renderedComponents, markup}) => {
                            await this.triggerComponentMounts(renderedComponents);
                            await this.onRenderMarkup();
                            return markup;
                        },
                        getContent: () => this.content
                    });
                }

                async [MAKE_COMPONENT_INSTANCE]() {
                    const comp = await super[MAKE_COMPONENT_INSTANCE](...arguments);
                    
                    comp.on('renderfinish', ({rendererName}) => rendererName === 'vdom' && (this[CHILDREN_DIRTY] = true));

                    return comp;
                }

                async [INIT]() {
                    await this[RENDERERS].vdom.request(this.state);
                    await super[INIT]();
                }
            }
        },
        createVdomRendererClass,
        createVdomWidgetClass
    });
    weddell.setLazyProperty('VdomRenderer', function () {
        const { Renderer, VdomWidget } = this;
        return this.createVdomRendererClass({ Renderer, VdomWidget });
    });
    weddell.setLazyProperty('VdomWidget', function () {
        return this.createVdomWidgetClass();
    });
}