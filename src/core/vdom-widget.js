var VDOMPatch = require('virtual-dom/patch');
var VDOMDiff = require('virtual-dom/diff');

var createElement = require('virtual-dom/create-element');
const cloneVNode = require('../utils/clone-vnode');

module.exports = class VDOMWidget {

    snapshot() {
        if (!this.liveWidgetLinks) {
            console.warn("you're trying to take a snapshot of a snapshot. that might not do what you're hoping.");
        }
        // debugger;
        return new this.constructor({component: this.component, liveWidgetLinks: false});
    }

    cloneVTree(liveWidgetLinks, pruneNullNodes) {
        return this.cloneVNode(this.vTree, liveWidgetLinks, pruneNullNodes);
    }

    cloneVNode(vNode, liveWidgetLinks=true, pruneNullNodes=true) {
        try {
            if (vNode.properties.attributes.class === 'wwe-site' && vNode.children.length) {
                // debugger;
            }
        } catch (err) {}      
        if (Array.isArray(vNode)) {
            var arr = vNode.map(child => this.cloneVNode(child, liveWidgetLinks, pruneNullNodes));

            if (liveWidgetLinks || pruneNullNodes) {
                arr = arr.reduce((newArr, child, ii) => {
                    if (child && child.type === 'Widget') {
                        if ((!pruneNullNodes || child.vTree)) {
                            if (liveWidgetLinks) {
                                Object.defineProperty(newArr, ii, {
                                    get: () => {
                                        console.log('new child',child.timeStamp, child.component._lastRenderTimeStamps.renderVNode, child.component._lastRenderTimeStamps.renderVNode === child.timeStamp)
                                        return child.component._lastRenderTimeStamps.renderVNode > child.timeStamp ? (child = new VdomWidget({component: child.component})) : child
                                    },
                                    enumerable: true
                                })
                            } else {
                                newArr.push(child);
                            }
                        }
                    } else if (!pruneNullNodes || child != null) {
                        newArr.push(child);
                    }
                    return newArr;
                }, []);
            }
            return arr;   
         } else if (vNode.type === 'Widget') {
            //  debugger;
            //  if (vNode.timeStamp !== vNode.component._lastRenderTimeStamps.renderVNode) {
            //      debugger;
            //  }
            return new vNode.constructor({component: vNode.component});
            // return vNode;
        } else if (!vNode || !vNode.tagName) {
            return vNode;
        } else {
            return cloneVNode(vNode, this.cloneVNode(vNode.children, liveWidgetLinks, pruneNullNodes));
        }
    }

    constructor({component=null, liveWidgetLinks=false, vTree=component.vTree}) {
        this.type = 'Widget';
        this.component = component;
        this.timeStamp = component._lastRenderTimeStamps.renderVNode;
        this.liveWidgetLinks = liveWidgetLinks;
        Object.defineProperties(this, {
            _vTree: {value: null, writable: true},
            vTree: {
                get: () => this._vTree,
                set: val => {
                    this._vTree = val ? this.cloneVNode(val, this.liveWidgetLinks, true) : null;
                }
            }
        })

        this.vTree = vTree;
    }

    init() {
        if (!this.vTree) {
            throw "Component has no VTree to init with";
        }
        var el = createElement(this.vTree);
        this.component._el = el;

        if (!el) {
            debugger;
        }

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
        // console.log("dasds")
        var patches = VDOMDiff(previousWidget.vTree, this.vTree);
        var el = VDOMPatch(prevDOMNode, patches);

        if (previousWidget.component !== this.component) {
            this.component._el = el;
            this.component.onDOMChange.call(this.component, { newEl: el, prevEl: prevDOMNode });
            this.component.onDOMCreateOrChange.call(this.component, { newEl: el, prevEl: prevDOMNode });
        }

        //@TODO onDOMMove?
        
        return el;
    }

    destroy(DOMNode) {
        this.component.onDOMDestroy.call(this.component, {el: this.component._el});
        this.component._el = null;
    }
}