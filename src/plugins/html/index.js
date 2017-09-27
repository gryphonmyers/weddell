var Parser = require('prescribe');
var Mixin = require('mixwith-es5').Mixin;
var defaults = require('object.defaults/immutable');
var includes = require('../../utils/includes');

var defaultComponentOpts = {
    markupFormat: 'HTMLString'
};
var defaultAppOpts = {
    markupRenderFormat: 'HTMLString',
};

module.exports = function(Weddell, pluginOpts) {
    return Weddell.plugin({
        id: 'html',
        classes:  {
            Sig: Mixin(function(Sig){
                Sig = class extends Sig {};
                Sig.addTypeAlias('HTMLString', 'String');
                return Sig;
            }),
            App: Mixin(function(App){
                return class extends App {
                    constructor(opts) {
                        opts = defaults(opts, defaultAppOpts);
                        super(opts);
                        this.renderers.HTMLString = this.renderHTML.bind(this)
                    }

                    renderHTML(html) {
                        if (this.el) {
                            this.el.innerHTML = html;
                        }
                    }
                }
            }),
            Component: Mixin(function(Component){
                var Component = class extends Component {
                    constructor(opts) {
                        opts = defaults(opts, defaultComponentOpts);
                        super(opts);

                        this.renderers.HTMLString = this.interpolateHTMLComponents.bind(this);
                    }

                    interpolateHTMLComponents(HTMLStr, content, renderedComponents) {
                        var parser = new Parser(HTMLStr.trim());
                        var componentNames = Object.keys(this.components);
                        var component;
                        var tagDepth = 0;
                        var result = [];
                        var contentTagDepth;

                        if (!renderedComponents) {
                            renderedComponents = {};
                        }

                        parser.readTokens({
                            chars: (tok) => {
                                (component ? component.contents : result).push(tok.text);
                            },
                            startTag: (tok) => {
                                tagDepth++;
                                var outputArr = component ? component.contents : result;
                                if (!component && includes(componentNames, tok.tagName)) {
                                    if (!(tok.tagName in renderedComponents)) {
                                        renderedComponents[tok.tagName] = [];
                                    }
                                    var index = tok.attrs[this.constructor.Weddell.consts.INDEX_ATTR_NAME] || renderedComponents[tok.tagName].length;

                                    component = {
                                        Component: this.components[tok.tagName],
                                        depth: tagDepth,
                                        name: tok.tagName,
                                        props: Object.assign({}, tok.attrs, tok.booleanAttrs),
                                        contents: [],
                                        index
                                    };
                                    renderedComponents[tok.tagName].push(component);
                                } else if (tok.tagName === 'content') {
                                    contentTagDepth = tagDepth;
                                } else {
                                    outputArr.push(tok.text);
                                }
                            },
                            endTag: (tok) => {
                                var outputArr = component ? component.contents : result;
                                // TODO need to have HTML respond to router tag directive like vdom plugin does
                                // if (node.tagName.toUpperCase() in this._tagDirectives) {
                                //     return this._tagDirectives[node.tagName.toUpperCase()](content, node.properties.attributes);
                                // } else
                                if (component && tok.tagName === component.name && component.depth === tagDepth) {
                                    var currComp = component;
                                    result.push(this.interpolateHTMLComponents(component.contents.join(''), null, renderedComponents)
                                        .then(componentContent => {
                                            return this.getComponentInstance(tok.tagName, currComp.index)
                                                .then(componentInstance => {
                                                    var renderFormat = componentInstance._pipelines.markup.targetRenderFormat;
                                                    return componentInstance.render('markup', componentContent, currComp.props, renderFormat);
                                                });
                                        })
                                        .then(componentOutput => {
                                            this.trigger('rendercomponent', {componentOutput, componentName: tok.tagName, props: currComp.props});
                                            return componentOutput.output;
                                        }));
                                    component = null;
                                } else if (tok.tagName === 'content' && tagDepth === contentTagDepth) {
                                    outputArr.push(this.interpolateHTMLComponents(content || ''));
                                    contentTagDepth = null;
                                } else {
                                    outputArr.push(tok.text);
                                }
                                tagDepth--;
                            }
                        });

                        return Promise.all(result)
                            .then(results => {
                                return results.join('') });
                    }
                }
                return Component;
            })
        }
    });
}
