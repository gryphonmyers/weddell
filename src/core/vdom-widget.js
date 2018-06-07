var VDOMPatch = require('virtual-dom/patch');
var VDOMDiff = require('virtual-dom/diff');
var h = require('virtual-dom/h');
var createElement = require('virtual-dom/create-element');

module.exports = class VDOMWidget {
    constructor(opts) {
        this.type = 'Widget';
        this.weddellComponent = opts.weddellComponent;
        this.vTree = opts.weddellComponent.vTree;
    }
    
    init() {
        var el = this.vTree ? createElement(this.vTree) : null;
        
        if (el) {
            this.weddellComponent._el = el;
            this.weddellComponent.mount();
        }

        return el;
    }

    update(previousWidget, prevDOMNode) {
        if (Array.isArray(this.vTree)) {
            throw "Cannot render a component with multiple nodes at root!";
        }
        // console.log(previousWidget.weddellComponent.constructor.id);
        var patches = VDOMDiff(previousWidget.vTree, this.weddellComponent.vTree);
        var el = VDOMPatch(prevDOMNode, patches);

        if (previousWidget.weddellComponent !== this.weddellComponent) {
            this.weddellComponent._el = el;
            this.weddellComponent.onMove.call(this.weddellComponent, { newEl: el, prevEl: prevDOMNode });
        }

        //@TODO pretty sure there is a case where one set of mounted components could transform into an entirely different set of components, which would trigger updates but no inits or destroys

        this.vTree = this.weddellComponent.vTree;
        
        return el;
    }

    destroy(DOMNode) {
        this.weddellComponent.unmount();
        this.weddellComponent._el = null;
    }
}