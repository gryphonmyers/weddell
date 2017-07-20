var DOMReady = require('document-ready-promise')();
var defaults = require('object.defaults/immutable');
var mix = require('mixwith-es5').mix;
var debounce = require('debounce');
var Sig = require('./sig');

Sig.addTypeAlias('HTMLString', 'String');
Sig.addTypeAlias('CSSString', 'String');

var defaultOpts = {
    renderInterval: 41.6667,
    markupRenderFormat: 'HTMLString',
    stylesRenderFormat: 'CSSString',
    markupTransforms: [],
    stylesTransforms: []
};

class App {
    constructor(opts) {
        opts = defaults(opts, defaultOpts);
        this.el = opts.el;
        this.styleEl = opts.styleEl;
        this.component = opts.component;
        this.renderInterval = opts.renderInterval;
        this.stylesRenderFormat = opts.stylesRenderFormat;
        this.markupRenderFormat = opts.markupRenderFormat;
        this.markupTransforms = opts.markupTransforms;
        this.stylesTransforms = opts.stylesTransforms;
        var Sig = this.constructor.Weddell.classes.Sig;
    }

    renderCSS(CSSString) {
        this.styleEl.textContent = CSSString;
    }

    renderHTML(html) {
        if (this.el) {
            this.el.innerHTML = html;
        }
    }

    renderMarkup(evt) {
        this.renderHTML(evt.output);
    }

    renderStyles(evt) {
        var flattenStyles = function(obj){
            return obj.output + obj.components.map(flattenStyles).join('');
        };
        this.renderCSS(flattenStyles(evt));
    }

    init() {
        Object.seal(this);
        return DOMReady
            .then(() => {
                var consts = this.constructor.Weddell.consts;

                if (!this.component) {
                    throw "There is no base component set for this app. Can't mount.";
                }
                if (consts.VAR_NAME in window) {
                    throw "Namespace collision for", consts.VAR_NAME, "on window object. Aborting.";
                }
                Object.defineProperty(window, consts.VAR_NAME, {
                    value: {app: this}
                });

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

                var componentOpts = Array.isArray(this.component) ? this.component[1] : {};
                var component = Array.isArray(this.component) ? this.component[0] : this.component;
                component = defaults(component, {
                    targetStylesRenderFormat: this.stylesRenderFormat,
                    targetMarkupRenderFormat: this.markupRenderFormat,
                    markupTransforms: this.markupTransforms,
                    stylesTransforms: this.stylesTransforms
                });
                var Component = this.constructor.Weddell.classes.Component;
                this.component = new Component(component);

                return this.component.init(componentOpts)
                    .then(() => {
                        this.component.on('rendermarkup', debounce(this.renderMarkup.bind(this), this.renderInterval));
                        this.component.on('renderstyles', debounce(this.renderStyles.bind(this), this.renderInterval));
                    })
            })
    }
}

module.exports = App;
