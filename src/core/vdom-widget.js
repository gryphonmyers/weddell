var VDOMPatch = require('virtual-dom/patch');
var VDOMDiff = require('virtual-dom/diff');
var h = require('virtual-dom/h');
var createElement = require('virtual-dom/create-element');

module.exports = class VDOMWidget {
    constructor(opts) {
        this.type = 'Widget';
        this.component = opts.component;
        this.vTree = opts.component.vTree;
    }

    static cloneVNode(vNode, newChildren=null, preserveIfUnchanged=false) {
        return preserveIfUnchanged && !newChildren && !vNode.namespace && false ? vNode : 
            (vNode.namespace ? svg : h)(vNode.tagName, Object.assign({}, vNode.properties, {
                key: vNode.key
            }), newChildren || vNode.children);
    }

    static pruneNullNodes(vNode) {
        if (!vNode) {
            throw "Can't prune null nodes from a null node!";
        }

        if (vNode.type === 'Widget') {
            if (vNode.component.vTree == null) {
                return null;
            }
        } else if (vNode.children) {
            var children = vNode.children.filter(child => this.pruneNullNodes(child));
            if (children.length !== vNode.children.length || children.some((child, ii) => child !== vNode.children[ii])) {
                return this.cloneVNode(vNode, children);
            }
        }
        return vNode;
    }

    init() {
        if (!this.vTree) {
            throw "Component has no VTree to init with";
        }
        var el = createElement(this.vTree);
        this.component._el = el;

        this.component.onDOMCreate.call(this.component, {el});
        this.component.onDOMCreateOrChange.call(this.component, {el});

        return el;
    }

    update(previousWidget, prevDOMNode) {
        if (Array.isArray(this.vTree)) {
            throw "Cannot render a component with multiple nodes at root!";
        }

        previousWidget.component.trigger('componentleavedom', {component: previousWidget.component});
        this.component.trigger('componententerdom', {component: this.component});
        
        var patches = VDOMDiff(previousWidget.vTree, this.component.vTree);
        var el = VDOMPatch(prevDOMNode, patches);

        if (previousWidget.component !== this.component) {
            this.component._el = el;
            this.component.onDOMChange.call(this.component, { newEl: el, prevEl: prevDOMNode });
            this.component.onDOMCreateOrChange.call(this.component, { newEl: el, prevEl: prevDOMNode });
        }

        //@TODO onDOMMove?
        if (this.component.vTree == null) {
            debugger;
        }
        this.vTree = this.component.vTree;
        
        return el;
    }

    destroy(DOMNode) {
        this.component.onDOMDestroy.call(this.component, {el: this.component._el});
        this.component._el = null;
    }
}