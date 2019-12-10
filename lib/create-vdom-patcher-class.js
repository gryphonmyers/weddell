import h from 'virtual-dom/h';
import VdomWidget from './create-vdom-widget-class';
import vdomPatch from 'virtual-dom/patch';
import vdomDiff from 'virtual-dom/diff';

import {
    ASSIGN_PROPS, 
    RENDER_RESULTS,
    RENDERERS
} from './symbols/component';
import {
    WIDGET
} from './symbols/vdom';
const PREV_WIDGET = Symbol('prevWidget');
export default ({Renderer}) => class VdomRenderer extends Renderer {

    constructor({ el }={}) {
        super(...arguments);
        this.el = el;
    }

    render(widgets) {
        // if (!this.rootNode.parentNode) {
        //     this.el.appendChild(this.rootNode);
        // }
        const newWidget = widgets[widgets.length - 1];
        var patches = vdomDiff(this[PREV_WIDGET], newWidget);
        var el = vdomPatch(this.el, patches);
        this.el = el;
        this[PREV_WIDGET] = newWidget;
    }
}