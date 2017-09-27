var h = require('virtual-dom/h');
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
                            console.warn('Your markup must have one root node. Only using the first one for now.');
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

                        this.renderers.VNode = this.replaceVNodeComponents.bind(this);
                    }

                    resolveTagDirective(node, directive) {

                    }

                    replaceVNodeComponents(node, content, renderedComponents) {
                        if (Array.isArray(node)) {
                            return Promise.all(node.reduce((final, childNode) => {
                                var result = this.replaceVNodeComponents(childNode, content, renderedComponents);
                                return result ? final.concat(result) : final;
                            }, []));
                        }

                        var Sig = this.constructor.Weddell.classes.Sig;

                        if (!renderedComponents) {
                            renderedComponents = {};
                        }

                        if (node.tagName) {
                            if (node.tagName.toUpperCase() in this._tagDirectives) {
                                return this._tagDirectives[node.tagName.toUpperCase()](content, node.properties.attributes);

                            } else if (node.tagName === 'CONTENT') {
                                return this.replaceVNodeComponents(content, null, renderedComponents);
                            } else {
                                var componentEntry = Object.entries(this.components)
                                    .find(entry => {
                                        return entry[0].toLowerCase() == node.tagName.toLowerCase()
                                    });
                                if (componentEntry) {
                                    if (!(componentEntry[0] in renderedComponents)) {
                                        renderedComponents[componentEntry[0]] = [];
                                    }
                                    var index = (node.properties.attributes && node.properties.attributes[this.constructor.Weddell.consts.INDEX_ATTR_NAME]) || renderedComponents[componentEntry[0]].length;
                                    renderedComponents[componentEntry[0]].push(null);

                                    return this.replaceVNodeComponents(node.children, content, renderedComponents)
                                        .then(componentContent => {
                                            return this.getComponentInstance(componentEntry[0], index)
                                                .then(componentInstance => {
                                                    renderedComponents[index] = componentInstance;
                                                    return componentInstance.render('markup', componentContent, node.properties.attributes, new Sig('VNode'));
                                                });
                                        })
                                        .then(componentOutput => {
                                            this.trigger('rendercomponent', {componentOutput, componentName: node.tagName, props: node.properties.attributes});
                                            return Array.isArray(componentOutput.output) ? componentOutput.output[0] : componentOutput.output
                                        });
                                }
                            }
                        }

                        if (node.children) {
                            return this.replaceVNodeComponents(node.children, content, renderedComponents)
                                .then(children => {
                                    node.children = children.reduce((final, child) => {
                                        return child ? final.concat(child) : final;
                                    }, []);
                                    return node;
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
