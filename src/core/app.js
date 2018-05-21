var DOMReady = require('document-ready-promise')();
var defaults = require('object.defaults/immutable');
var mix = require('mixwith-es5').mix;
var Sig = require('./sig');
var EventEmitterMixin = require('./event-emitter-mixin');
var isApplicationOf = require('mixwith-es5').isApplicationOf;
var Component = require('./component');

Sig.addTypeAlias('CSSString', 'String');

var defaultOpts = {
    renderInterval: 41.6667,
    markupRenderFormat: null,
    stylesRenderFormat: 'CSSString',
    markupTransforms: [],
    pipelineInitMethods: {},
    stylesTransforms: [],
    childStylesFirst: true
};

function createStyleEl() {
    var styleEl = document.createElement('style');
    styleEl.setAttribute('type', 'text/css');
    document.head.appendChild(styleEl);
    return styleEl;
}

var App = class extends mix(App).with(EventEmitterMixin) {
    constructor(opts) {
        opts = defaults(opts, defaultOpts);
        super(opts);
        this.styles = opts.styles;
        this.el = opts.el;
        this.renderOrder = ['markup', 'styles'];
        this.pipelineInitMethods = opts.pipelineInitMethods;
        this.styleEl = opts.styleEl;
        this.componentInitOpts = Array.isArray(opts.Component) ? opts.Component[1] : {};
        this.Component = this.makeComponentClass(Array.isArray(opts.Component) ? opts.Component[0] : opts.Component);
        this.component = null;
        this.shouldRender = {};
        this.renderInterval = opts.renderInterval;
        this.renderPromise = null;
        this.stylesRenderFormat = opts.stylesRenderFormat;
        this.markupRenderFormat = opts.markupRenderFormat;
        this.markupTransforms = opts.markupTransforms;
        this.stylesTransforms = opts.stylesTransforms;
        this.childStylesFirst = opts.childStylesFirst;
        this.renderers = {};
        var Sig = this.constructor.Weddell.classes.Sig;

        var consts = this.constructor.Weddell.consts;

        if (!this.Component) {
            throw "There is no base component set for this app. Can't mount.";
        }
        if (consts.VAR_NAME in window) {
            throw "Namespace collision for", consts.VAR_NAME, "on window object. Aborting.";
        }

        Object.defineProperty(window, consts.VAR_NAME, {
            value: {app: this, components: {} }
        });
        
        this.pipelines = {
            styles: {
                init: 'initStylesPipeline',
                render: 'renderStyles',
                componentEvent: 'renderstyles'
            },
            markup: {
                render: 'renderMarkup',
                componentEvent: 'rendermarkup'
            }            
        };
    }

    renderCSS(staticStyles=[], instanceStyles=[]) {
        if (this.styles && !this.styleEl.textContent) {
            this.styleEl.textContent = this.styles;
        }
        var prevEl;
        var leftovers = staticStyles.concat(instanceStyles).reduce((final, obj) => {
            var styleIndex = final.findIndex(styleEl => styleEl.id === 'weddell-style-' + obj.id);
            var styleEl;

            if (styleIndex === -1) {
                styleEl = createStyleEl();
                styleEl.id = 'weddell-style-' + obj.id;
                styleEl.classList.add('weddell-style');
            } else {
                styleEl = final.splice(styleIndex, 1)[0];
            }

            if (!(styleEl.textContent === obj.styles)) {
                styleEl.textContent = obj.styles;
            }

            if (prevEl) {
                var comparison = prevEl.compareDocumentPosition(styleEl);
                if (comparison !== Node.DOCUMENT_POSITION_FOLLOWING) {
                    prevEl.parentNode.insertBefore(styleEl, prevEl.nextSibling);
                }
            }

            prevEl = styleEl;

            return final;
        }, Array.from(document.querySelectorAll('head style.weddell-style')));

        leftovers.forEach(el => {
            document.head.removeChild(el);
        });
    }

    initStylesPipeline() {
        if (typeof this.styleEl == 'string') {
            this.styleEl = document.querySelector(this.styleEl);
        } else if (!this.styleEl) {
            this.styleEl = createStyleEl();
        }
        var appStyles = this.styles;
        if (appStyles) {
            this.renderCSS();
        }
    }

    renderMarkup(evt) {
        if (!(evt.renderFormat in this.renderers)) {
            throw "No appropriate markup renderer found for format: " + evt.renderFormat;
        }
        this.renderers[evt.renderFormat].call(this, evt.output);
        this.component.trigger('renderdommarkup', Object.assign({}, evt));
    }

    renderStyles(evt) {
        var staticStyles = [];
        
        var flattenStyles = (obj) => {
            var childStyles = (obj.components ? obj.components.map(flattenStyles) : []).reduce((final, item) => final.concat(item), []);
            var styles = Array.isArray(obj) ? obj.map(flattenStyles) : ({ styles: obj.output ? obj.output.trim() : '', id: obj.component._id });

            if (obj.staticStyles) {
                var staticObj = {
                    class: obj.component.constructor,
                    styles: obj.staticStyles.trim()
                };
                if (this.childStylesFirst) {
                    staticStyles.unshift(staticObj)
                } else {
                    staticStyles.push(staticObj)
                }
            }
            return (this.childStylesFirst ? childStyles.concat(styles) : [styles].concat(childStyles));
        };
        var instanceStyles = flattenStyles(evt)
            .filter(item => item.styles);

        staticStyles = staticStyles.reduce((finalArr, styleObj) => {
            if (!styleObj.class._BaseClass || !finalArr.some(otherStyleObj => otherStyleObj.class._BaseClass === styleObj.class._BaseClass || otherStyleObj.class._BaseClass instanceof styleObj.class._BaseClass)) {
                return finalArr.concat(styleObj)
            }
            return finalArr;
        }, [])
        .map(item => ({ id: item.class._id || 'root', styles: item.styles }))

        this.renderCSS(staticStyles, instanceStyles);

        this.component.trigger('renderdomstyles', Object.assign({}, evt));
    }

    makeComponentClass(ComponentClass) {
        if (ComponentClass.prototype && (ComponentClass.prototype instanceof Component || ComponentClass.prototype.constructor === Component)) {
            if (ComponentClass.prototype instanceof this.constructor.Weddell.classes.Component || ComponentClass.prototype.constructor === this.constructor.Weddell.classes.Component) {
                return ComponentClass;
            }
            throw "Component input is a class extending Component, but it does not have necessary plugins applied to it. Consider using a factory function instead.";
        } else if (typeof ComponentClass === 'function') {
            // We got a non-Component class function, so we assuming it is a component factory function
            return ComponentClass.call(this, this.constructor.Weddell.classes.Component);
        } else {
            //@TODO We may want to support plain objects here as well. Only problem is then we don't get the clean method inheritance and would have to additionally support passing method functions along as options, which is a bit messier.
            throw "Unsupported component input";
        }
    }

    makeComponent() {
        var component = new (this.Component)({
            isRoot: true,
            targetStylesRenderFormat: this.stylesRenderFormat,
            targetMarkupRenderFormat: this.markupRenderFormat,
            markupTransforms: this.markupTransforms,
            stylesTransforms: this.stylesTransforms
        });

        component.assignProps(Object.values(this.el.attributes).reduce((finalObj, attr) => {
            finalObj[attr.name] = attr.value;
            return finalObj;
        }, {}))

        return component
    }

    initRenderLifecycleStyleHooks(rootComponent) {
        this.component.once('renderdomstyles', evt => {
            this.el.classList.add('first-styles-render-complete');
            if (this.el.classList.contains('first-markup-render-complete')) {
                this.el.classList.add('first-render-complete');
            }
        });

        this.component.once('renderdommarkup', evt => {
            this.el.classList.add('first-markup-render-complete');
            if (this.el.classList.contains('first-styles-render-complete')) {
                this.el.classList.add('first-render-complete');
            }
        });
    }

    scheduleRender() {
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                var neededRenders = this.renderOrder.filter(pipeline => this.shouldRender[pipeline]);
                neededRenders.forEach(pipeline => this.shouldRender[pipeline] = false)
                neededRenders
                    .reduce((promise, pipeline) => {
                        return promise
                            .then(() => this.component.render(pipeline));
                    }, Promise.resolve())
                    .then(() => Object.values(this.shouldRender).some(val => val) ? this.scheduleRender() : null)
                    .then(() => {
                        this.renderOrder.forEach(pipeline => {
                            this.el.classList.remove('rendering-' + pipeline);
                        })
                        resolve();
                    });                    
            })
        })
    }

    init() {
        return DOMReady
            .then(() => {
                if (typeof this.el == 'string') {
                    this.el = document.querySelector(this.el);
                }

                Object.values(this.pipelines).forEach(pipelineObj => {
                    this[pipelineObj.init] && this[pipelineObj.init].call(this);
                });

                this.component = this.makeComponent();

                this.trigger('createcomponent', {component: this.component});
                this.trigger('createrootcomponent', {component: this.component});
                this.component.on('createcomponent', evt => this.trigger('createcomponent', Object.assign({}, evt)));

                this.component.on('wantsrender', evt => {
                    if (!this.shouldRender[evt.pipelineName]) {
                        this.el.classList.add('rendering-' + evt.pipelineName);
                        this.shouldRender[evt.pipelineName] = true;
                    }

                    if (!this.renderPromise) {
                        this.el.classList.add('rendering');
                        this.renderPromise = this.scheduleRender()
                            .then(() => {
                                this.renderPromise = null;
                                this.component.markRendering(false);
                                this.el.classList.remove('rendering');
                            });
                        this.component.markRendering(this.renderPromise);
                    }
                });

                this.initRenderLifecycleStyleHooks(this.component);

                Object.seal(this);

                return this.component.init(this.componentInitOpts)
                    .then(() => {

                        Object.values(this.pipelines).forEach(pipelineObj => {
                            this.component.on(pipelineObj.componentEvent, this[pipelineObj.render].bind(this));
                        });

                        this.component.render();
                    })
            })
    }
}

module.exports = App;
