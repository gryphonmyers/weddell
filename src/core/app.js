var DOMReady = require('document-ready-promise')();
var defaults = require('object.defaults/immutable');
var mix = require('mixwith-es5').mix;
var Sig = require('./sig');
var EventEmitterMixin = require('./event-emitter-mixin');
var isApplicationOf = require('mixwith-es5').isApplicationOf;
var Component = require('./component');
var ActionDispatcher = require('./action-dispatcher');

Sig.addTypeAlias('CSSString', 'String');

var defaultOpts = {
    renderInterval: 41.6667,
    markupRenderFormat: null,
    stylesRenderFormat: 'CSSString',
    markupTransforms: [],
    stylesTransforms: [],
    childStylesFirst: true
};

var App = class extends mix(App).with(EventEmitterMixin) {
    constructor(opts) {
        opts = defaults(opts, defaultOpts);
        super(opts);
        this.styles = opts.styles;
        this.el = opts.el;
        this.styleEl = opts.styleEl;
        this.componentInitOpts = Array.isArray(opts.Component) ? opts.Component[1] : {};
        this.Component = this.makeComponentClass(Array.isArray(opts.Component) ? opts.Component[0] : opts.Component);
        this.component = null;
        this.shouldRerender = {};
        this.renderInterval = opts.renderInterval;
        this.renderPromises = {};
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

        Object.defineProperty(this, '_actionDispatcher', {
            value: new ActionDispatcher
        });

        this.on('createcomponent', evt => {
            this._actionDispatcher.addDispatchee(evt.component);
            evt.component.on('createaction', evt => {
                this._actionDispatcher.dispatch(evt.actionName, evt.actionData)
            });
        });
    }

    renderCSS(CSSString) {
        this.styleEl.innerText = '';
        this.styleEl.appendChild(document.createTextNode(CSSString));
    }

    renderMarkup(evt) {
        if (!(evt.renderFormat in this.renderers)) {
            throw "No appropriate markup renderer found for format: " + evt.renderFormat;
        }
        this.renderers[evt.renderFormat].call(this, evt.output);
        this._actionDispatcher.dispatch('renderdommarkup', Object.assign({}, evt));
    }

    renderStyles(evt) {
        var staticStyles = [];
        var flattenStyles = (obj) => {
            var childStyles = (obj.components ? obj.components.map(flattenStyles).join('\r\n') : '');
            var styles = Array.isArray(obj) ? obj.map(flattenStyles).join('\r\n') : (obj.output ? obj.output : '');

            if (obj.staticStyles) {
                var staticObj = {
                    class: obj.component.constructor,
                    styles: obj.staticStyles
                };
                if (this.childStylesFirst) {
                    staticStyles.unshift(staticObj)
                } else {
                    staticStyles.push(staticObj)
                }
            }

            return (this.childStylesFirst ? childStyles + styles : styles + childStyles).trim();
        };
        var instanceStyles = flattenStyles(evt);
        
        staticStyles = staticStyles.reduce((finalArr, styleObj) => {
            if (!styleObj.class._BaseClass || !finalArr.some(otherStyleObj => otherStyleObj.class === styleObj.class || otherStyleObj.class._BaseClass instanceof styleObj.class._BaseClass)) {
                return finalArr.concat(styleObj)
            }
            return finalArr;
        }, []).map(styleObj => typeof styleObj.styles === 'string' ? styleObj.styles : '').join('\n\r');
        var styles = [this.styles || '', staticStyles, instanceStyles].join('\r\n').trim();
        this.renderCSS(styles);

        this._actionDispatcher.dispatch('renderdomstyles', Object.assign({}, evt));
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

    scheduleRender(pipelineName) {
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                this.component.render(pipelineName)
                    .then(() => {
                        if (this.shouldRerender[pipelineName]) {
                            this.shouldRerender[pipelineName] = false;
                            return this.scheduleRender(pipelineName);
                        }
                    })
                    .then(resolve)
            })
        })
    }

    init() {
        Object.seal(this);
        return DOMReady
            .then(() => {
                if (typeof this.el == 'string') {
                    this.el = document.querySelector(this.el);
                }

                if (typeof this.styleEl == 'string') {
                    this.styleEl = document.querySelector(this.styleEl);
                } else if (!this.styleEl) {
                    this.styleEl = document.createElement('style');
                    this.styleEl.setAttribute('type', 'text/css');
                    document.head.appendChild(this.styleEl);
                }
                var appStyles = this.styles;
                if (appStyles) {
                    this.renderCSS(appStyles);
                }

                this.component = this.makeComponent();

                this.trigger('createcomponent', {component: this.component});
                this.trigger('createrootcomponent', {component: this.component});
                this.component.on('createcomponent', evt => this.trigger('createcomponent', Object.assign({}, evt)));

                this.component.on('markeddirty', evt => {
                    if (!this.renderPromises[evt.pipelineName]) {
                        this.el.classList.add('rendering-' + evt.pipelineName);
                        this.el.classList.add('rendering');
                        this.renderPromises[evt.pipelineName] = this.scheduleRender(evt.pipelineName)
                            .then(() => {
                                this.renderPromises[evt.pipelineName] = null;
                                this.el.classList.remove('rendering-' + evt.pipelineName);
                                if (Object.values(this.renderPromises).every(val => !val)) {
                                    this.el.classList.remove('rendering');
                                }
                            });
                    } else {
                        this.shouldRerender[evt.pipelineName] = true;
                    }
                });

                this.initRenderLifecycleStyleHooks(this.component);

                return this.component.init(this.componentInitOpts)
                    .then(() => {
                        this.component.on('rendermarkup', this.renderMarkup.bind(this));
                        this.component.on('renderstyles', this.renderStyles.bind(this));
                        this.component.render();
                    })
            })
    }
}

module.exports = App;
