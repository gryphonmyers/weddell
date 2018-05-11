var h = require('virtual-dom/h');
var svg = require('virtual-dom/virtual-hyperscript/svg');
var VDOMPatch = require('virtual-dom/patch');
var VDOMDiff = require('virtual-dom/diff');
var VNode = require('virtual-dom/vnode/vnode');
var Mixin = require('mixwith-es5').Mixin;
var defaults = require('object.defaults/immutable');
var flatMap = require('../../utils/flatmap');
var compact = require('array-compact');
var createElement = require('virtual-dom/create-element');

var defaultComponentOpts = {
    markupFormat: '(locals:Object,h:Function)=>VNode'
};

var defaultAppOpts = {
    markupRenderFormat: 'VNode'
};

class VDOMWidget {
    constructor(opts) {
        this.type = 'Widget';
        this.vTree = opts.vTree;
        this.onUpdate = opts.onUpdate;
        this.onInit = opts.onInit;
        this.componentID = opts.componentID;
    }
    
    init() {
        var el = this.vTree ? createElement(this.vTree) : null;
        if (this.onInit) {
            this.onInit(el, this);
        }
        return el;
    }

    update(previousWidget, prevDOMNode) {
        if (Array.isArray(this.vTree)) {
            throw "Cannot render a component with multiple nodes at root!";
        }

        var patches = VDOMDiff(previousWidget.vTree, this.vTree);
        var el = VDOMPatch(prevDOMNode, patches);

        if (el && patches) {
            if (this.onUpdate) {
                this.onUpdate(el, this, patches)
            }
        }
        return el;
    }

    destroy(DOMNode) {

    }
}

module.exports = function(Weddell, pluginOpts) {
    return Weddell.plugin({
        id: 'vdom',
        classes:  {
            Sig: Mixin(function(Sig){
                Sig = class extends Sig {};
                Sig.addTypeAlias('hscript', 'String');
                Sig.addTypeAlias('VNode', 'Object');
                return Sig;
            }),
            App: Mixin(function(App){
                return class extends App {
                    constructor(opts) {
                        opts = defaults(opts, defaultAppOpts);
                        super(opts);
                        this.vTree = h('div');
                        this.rootNode = createElement(this.vTree);
                        var Transform = this.constructor.Weddell.classes.Transform;

                        this.markupTransforms.push(new Transform({
                            from: 'hscript',
                            to: '(locals:Object,h:Function)=>VNode',
                            func: function(input){
                                return new Function('locals', 'h', input);
                            }
                        }));

                        this.renderers.VNode = this.renderVNode.bind(this);
                    }

                    renderVNode(newTree) {
                        if (!this.rootNode.parentNode) {
                            this.el.appendChild(this.rootNode);
                        }
                        if (Array.isArray(newTree)) {
                            if (newTree.length > 1) {
                                console.warn('Your markup was truncated, as your component had more than one root node.');
                            }
                            newTree = newTree[0];
                        }
                        var patches = VDOMDiff(this.vTree, newTree);
                        var rootNode = VDOMPatch(this.rootNode, patches);
                        this.rootNode = rootNode;
                        this.vTree = newTree;
                    }
                }
            }),
            Pipeline: Mixin(function(Pipeline){
                return class extends Pipeline {
                    callTemplate(locals, template) {
                        return template.call(this, locals, h);
                    }
                };
            }),
            Component: Mixin(function(Component){
                var Component = class extends Component {
                    constructor(opts) {
                        opts = defaults(opts, defaultComponentOpts);

                        super(opts);

                        Object.defineProperty(this, '_el', {value: null, writable: true });
                        Object.defineProperty(this, 'el', {get: function(){
                            return this._el;
                        }.bind(this) });

                        var Transform = this.constructor.Weddell.classes.Transform;

                        this._pipelines.markup.addTransform(new Transform({
                            from: 'VNode',
                            to: 'VNode',
                            func: (vTree) => {
                                if (Array.isArray(vTree)) {
                                    if (vTree.length > 1) {
                                        console.warn('Your markup was truncated, as your component had more than one root node.');
                                    }
                                    vTree = vTree[0];
                                }
                                return vTree ? vTree.type !== 'Widget' ? new VDOMWidget({
                                    vTree,
                                    componentID: this._id,
                                    onUpdate: this.onVDOMUpdate.bind(this),
                                    onInit: this.onVDOMInit.bind(this)
                                }) : vTree : null;
                            }
                        }))

                        this.renderers.VNode = this.replaceVNodeComponents.bind(this);
                    }

                    onDOMMove() {
                        //no op
                    }

                    onDOMCreate() {
                        
                    }

                    onDOMChange() {

                    }

                    resolveTagDirective(node, directive) {

                    }

                    onVDOMInit(el, vTree) {
                        this._el = el;
                        this.onDOMCreate.call(this, { el });
                    }

                    onVDOMUpdate(el, vTree, patches) {
                        if (this._el) {
                            var positionComparison = this._el.compareDocumentPosition(el);
                            if (positionComparison !== 0) {
                                this.trigger("dommove", { newEl: el });
                                if (this.onDOMMove) this.onDOMMove.call(this, el);
                            }
                        }
                        if (this._el !== el) {
                            this.onDOMChange.call(this, { newEl: el });
                        }                        
                        this._el = el;
                    }

                    replaceVNodeComponents(node, content, renderedComponents, isContent) {
                        isContent = !!isContent;

                        if (!node) {
                            return Promise.resolve(null);
                        }

                        if (node.type === 'Widget') {
                            return this.replaceVNodeComponents(node.vTree, content, renderedComponents, isContent)
                                .then(output => {
                                    return new VDOMWidget({vTree: output, onInit: node.onInit, onUpdate: node.onUpdate, componentID: node.componentID })
                                });                            
                        }
                        
                        if (Array.isArray(node)) {
                            return Promise.all(compact(node).reduce((final, childNode) => {
                                var result = this.replaceVNodeComponents(childNode, content, renderedComponents, isContent);
                                return result ? final.concat(result) : final;
                            }, []));
                        }

                        var Sig = this.constructor.Weddell.classes.Sig;

                        if (!renderedComponents) {
                            renderedComponents = {};
                        }

                        if (node.tagName) {
                            if (node.tagName.toUpperCase() in this._tagDirectives) {
                                return this._tagDirectives[node.tagName.toUpperCase()](content, node.properties.attributes, isContent);
                            } else if (node.tagName === 'CONTENT') {
                                return this.replaceVNodeComponents(content, null, renderedComponents, true);
                            } else {
                                var componentEntry = Object.entries(this.collectComponentTree())
                                    .find(entry => {
                                        return entry[0].toLowerCase() == node.tagName.toLowerCase()
                                    });
                                if (componentEntry) {
                                    if (!(componentEntry[0] in renderedComponents)) {
                                        renderedComponents[componentEntry[0]] = [];
                                    }
                                    var index = (node.properties.attributes && node.properties.attributes[this.constructor.Weddell.consts.INDEX_ATTR_NAME]) || renderedComponents[componentEntry[0]].length;
                                    renderedComponents[componentEntry[0]].push(null);

                                    return this.replaceVNodeComponents(node.children, content, renderedComponents, false)
                                        .then(componentContent => {
                                            return componentEntry[1].sourceInstance.getComponentInstance(componentEntry[0], index)
                                                .then(componentInstance => {
                                                    renderedComponents[index] = componentInstance;
                                                    return componentInstance.render('markup', componentContent, node.properties.attributes, new Sig('VNode'), this);
                                                });
                                        })
                                        .then(componentOutput => {
                                            componentEntry[1].sourceInstance.trigger('rendercomponent', {componentOutput, componentName: node.tagName, props: node.properties.attributes, isContent});
                                            return Array.isArray(componentOutput.output) ? componentOutput.output[0] : componentOutput.output
                                        });
                                }
                            }
                        }

                        if (node.children) {
                            return this.replaceVNodeComponents(node.children, content, renderedComponents, false)
                                .then(children => {
                                    var properties = Object.assign({}, node.properties, {
                                        key: node.key
                                    });
                                    var hfunc = node.namespace ? svg : h;
                                    return hfunc(node.tagName, properties, children.reduce((final, child) => {
                                        return child ? final.concat(child) : final;
                                    }, []));
                                });
                        }

                        return Promise.resolve(node);
                    }
                }
                return Component;
            }),
            VNode
        },
        deps: {
            h
        }
    });
}
