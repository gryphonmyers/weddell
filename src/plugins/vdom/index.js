var h = require('virtual-dom/h');
var VDOMPatch = require('virtual-dom/patch');
var VDOMDiff = require('virtual-dom/diff');
var VNode = require('virtual-dom/vnode/vnode');
var Mixin = require('mixwith-es5').Mixin;
var defaults = require('object.defaults/immutable');

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
                        this.vTree = new VNode('div');
                        var Transform = this.constructor.Weddell.classes.Transform;

                        this.markupTransforms.push(new Transform({
                            from: 'hscript',
                            to: '(locals:Object,h:Function)=>VNode',
                            func: function(input){
                                return new Function('locals', 'h', input);
                            }
                        }));
                    }

                    renderHTML(newTree) {
                        /*
                        * This plugin expects all templates to return VNodes instead of HTML.
                        */
                        if (Array.isArray(newTree)) {
                            console.warn('Your markup must have one root node. Only using the first one for now.');
                            newTree = newTree[0];
                        }
                        var patches = VDOMDiff(this.vTree, newTree);
                        var rootNode = VDOMPatch(this.el, patches);
                        this.el = rootNode;
                        this.vTree = newTree;
                    }
                }
            }),
            Pipeline: Mixin(function(Pipeline){
                return class extends Pipeline {
                    callTemplate(locals) {
                        return this.template.call(this, locals, h);
                    }
                };
            }),
            Component: Mixin(function(Component){
                var Component = class extends Component {
                    constructor(opts) {
                        opts = defaults(opts, defaultComponentOpts);
                        super(opts);
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
