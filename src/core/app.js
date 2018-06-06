const DOMReady = require('document-ready-promise')();
const defaults = require('object.defaults/immutable');
const mix = require('mixwith-es5').mix;
const EventEmitterMixin = require('./event-emitter-mixin');
const isApplicationOf = require('mixwith-es5').isApplicationOf;
const Component = require('./component');
const VDOMPatch = require('virtual-dom/patch');
const VDOMDiff = require('virtual-dom/diff');
const h = require('virtual-dom/h');
const createElement = require('virtual-dom/create-element');

const VDOMWidget = require('./vdom-widget');

const defaultOpts = {
    markupTransforms: [],
    stylesTransforms: [],
    childStylesFirst: true
};

var App = class extends mix(App).with(EventEmitterMixin) {

    static get patchers() {
        return [
            'patchDOM',
            'patchStyles'
        ];
    }

    constructor(opts) {
        opts = defaults(opts, defaultOpts);
        super(opts);
        this.styles = opts.styles;
        this.el = opts.el;
        this.renderOrder = ['markup', 'styles'];
        this.pipelineInitMethods = opts.pipelineInitMethods;
        this.styleEl = opts.styleEl;
        this.componentInitOpts = Array.isArray(opts.Component) ? opts.Component[1] : {};
        this.shouldRender = {};
        this.renderInterval = opts.renderInterval;
        this.stylesRenderFormat = opts.stylesRenderFormat;
        this.markupRenderFormat = opts.markupRenderFormat;
        this.markupTransforms = opts.markupTransforms;
        this.stylesTransforms = opts.stylesTransforms;
        this.childStylesFirst = opts.childStylesFirst;
        this.patchers = {};

        Object.defineProperties(this, {
            Component: { value: this.constructor.Weddell.classes.Component.makeComponentClass(Array.isArray(opts.Component) ? opts.Component[0] : opts.Component) },
            component: { get: () => this._component },
            vTree: { value: h('div'), writable: true },
            _patchPromise: { value: null, writable: true },
            patchPromise: { get: () => this._patchPromise },
            _RAFCallback: { value: null, writable: true },
            _patchRequests: { value: [], writable: true },
            _patchPromise: { value: null, writable: true },
            _component: { value: null, writable: true }
        })

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

        Object.defineProperties(this, {
            rootNode: { value: createElement(this.vTree), writable: true }
        })
    }

    patchDOM(patchRequests) {
        if (!this.rootNode.parentNode) {
            this.el.appendChild(this.rootNode);
        }
        this.component.refreshPendingWidgets();
        var newTree = new VDOMWidget({weddellComponent: this.component});
        var patches = VDOMDiff(this.vTree, newTree);
        var rootNode = VDOMPatch(this.rootNode, patches);
        this.rootNode = rootNode;
        this.vTree = newTree;
        this.trigger('patchdom');
    }

    patchStyles() {
        this.trigger('patchstyles');
    }

    renderCSS(CSSString) {
        this.styleEl.textContent = CSSString;
    }

    initStylesPipeline() {
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
            if (!styleObj.class._BaseClass || !finalArr.some(otherStyleObj => otherStyleObj.class._BaseClass === styleObj.class._BaseClass || otherStyleObj.class._BaseClass instanceof styleObj.class._BaseClass)) {
                return finalArr.concat(styleObj)
            }
            return finalArr;
        }, []).map(styleObj => typeof styleObj.styles === 'string' ? styleObj.styles : '').join('\n\r');

        var styles = [this.styles || '', staticStyles, instanceStyles].join('\r\n').trim();
        this.renderCSS(styles);

        this.component.trigger('renderdomstyles', Object.assign({}, evt));
    }

    makeComponent() {
        var component = new (this.Component)({
            isRoot: true
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

    queuePatch(patchRequests) {
        if (!this._patchPromise) {
            var resolveFunc;
            this._patchPromise = new Promise((resolve) => {
                resolveFunc = resolve;
            })
            .then(patchRequests => {
                this._patchPromise = null;
                this.constructor.patchers.forEach(patcher => {
                    this[patcher](patchRequests)
                });
            })

            this._patchRequests = [].concat(patchRequests);

            requestAnimationFrame(this._RAFCallback = () =>{
                this._RAFCallback = null;
                resolveFunc(this._patchRequests);
                this._patchRequests = [];
            });
        } else {
            this._patchRequests = this._patchRequests.concat(patchRequests);
        }
    }

    init() {
        return DOMReady
            .then(() => {
                if (typeof this.el == 'string') {
                    this.el = document.querySelector(this.el);
                    if (!this.el) {
                        throw "Could no"
                    }
                }

                this._component = this.makeComponent();

                this.trigger('createcomponent', {component: this.component});
                this.trigger('createrootcomponent', {component: this.component});
                this.component.on('createcomponent', evt => this.trigger('createcomponent', Object.assign({}, evt)));

                this.component.on('requestpatch', evt => {
                    this.queuePatch(evt);
                });

                this.initRenderLifecycleStyleHooks(this.component);

                Object.seal(this);

                return this.component.init(this.componentInitOpts)
            })
    }
}

module.exports = App;
