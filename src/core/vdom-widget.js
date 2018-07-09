var VDOMPatch = require('virtual-dom/patch');
var VDOMDiff = require('virtual-dom/diff');

var createElement = require('virtual-dom/create-element');
const cloneVNode = require('../utils/clone-vnode');

module.exports = class VDOMWidget {
    cloneVNode(vNode, pruneNullNodes=true, childWidgets=[]) {
        if (Array.isArray(vNode)) {
            var arr = vNode.map(child => this.cloneVNode(child, pruneNullNodes, childWidgets));

            if (pruneNullNodes) {
                arr = arr.reduce((newArr, child, ii) => {
                    if (child && child.type === 'Widget') {
                        if ((!pruneNullNodes || child.vTree)) {
                            newArr.push(child);
                        }
                    } else if (!pruneNullNodes || child != null) {
                        newArr.push(child);
                    }
                    return newArr;
                }, []);
            }
            return arr;   
        } else if (!vNode) {
            return vNode;
        } else if (vNode.type === 'Widget') {
            var widget = (vNode.component._widgetIsDirty ? vNode.component.makeNewWidget() : vNode.component._widget);
            childWidgets.push(widget);
            return widget
        } else if (!vNode.tagName) {
            return vNode;
        } else {
            return cloneVNode(vNode, this.cloneVNode(vNode.children, pruneNullNodes, childWidgets));
        }
    }

    constructor({component=null, vTree=component._vTree}) {
        this.type = 'Widget';
        this.component = component;
        this.childWidgets = [];
        this._callbacks = [];
        this.vTree = this.cloneVNode(vTree, true, this.childWidgets);
    }

    bindChildren(parent) {
        this._callbacks = this.childWidgets.map(childWidget => childWidget.component.on('widgetdirty', () => {
            parent.markWidgetDirty()
        }))
    }
    unbindChildren() {
        this._callbacks.forEach(callback => callback());
    }
    init() {
        if (!this.vTree) {
            throw "Component has no VTree to init with";
        }
        var el = createElement(this.vTree);

        this.fireDomEvents(this.component.el, this.component._el = el);

        return el;
    }

    fireDomEvents(prevEl, el) {
        if (!prevEl) {
            this.component.onDOMCreate.call(this.component, {el});
            this.component.onDOMCreateOrChange.call(this.component, {newEl: el, prevEl});
        } else if (prevEl !== el) {
            this.component.onDOMChange.call(this.component, { newEl: el, prevEl });
            this.component.onDOMCreateOrChange.call(this.component, { newEl: el, prevEl });

            var positionComparison = prevEl.compareDocumentPosition(el);
            if (positionComparison !== 0) {
                //@TODO atm this pretty much always fires. maybe that is circumstantial, but we may need to be more selective about which bits constitute a "move"
                this.component.onDOMMove.call(this.component, { newEl: el, prevEl });
            }
        }
    }

    update(previousWidget, prevDOMNode) {
        var patches = VDOMDiff(previousWidget.vTree, this.vTree);
        var el = VDOMPatch(prevDOMNode, patches);

        this.fireDomEvents(this.component.el, this.component._el = el);
        
        return el;
    }

    destroy(el) {
        if (el === this.component.el) {
            this.component._el = null;
            this.component.onDOMDestroy.call(this.component, {el});
        }
    }
}