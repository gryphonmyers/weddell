const DOMReady = require('document-ready-promise')();
const defaults = require('object.defaults/immutable');
const mix = require('mixwith-es5').mix;
const EventEmitterMixin = require('./event-emitter-mixin');
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

const patchInterval = 33.334;

function createStyleEl(id, className=null) {
    var styleEl = document.createElement('style');
    styleEl.setAttribute('type', 'text/css');
    document.head.appendChild(styleEl);
    styleEl.id = id;
    styleEl.classList.add(className);
    return styleEl;
}

var App = class extends mix(App).with(EventEmitterMixin) {

    static get patchMethods() {
        return [
            'patchDOM',
            'patchStyles'
        ];
    }

    constructor(opts) {
        opts = defaults(opts, defaultOpts);
        super(opts);
        if (opts.styles) {
            console.warn('You are using deprecated syntax: opts.styles on the app are no longer supported. Use static getter');
        }
        this.styles = opts.styles || this.constructor.styles;
        this.renderOrder = ['markup', 'styles'];
        this.pipelineInitMethods = opts.pipelineInitMethods;
        this.componentInitOpts = Array.isArray(opts.Component) ? opts.Component[1] : {};
        this.shouldRender = {};
        this.renderInterval = opts.renderInterval;
        this.stylesRenderFormat = opts.stylesRenderFormat;
        this.markupRenderFormat = opts.markupRenderFormat;
        this.markupTransforms = opts.markupTransforms;
        this.stylesTransforms = opts.stylesTransforms;
        this.childStylesFirst = opts.childStylesFirst;

        Object.defineProperties(this, {
            Component: { value: this.constructor.Weddell.classes.Component.makeComponentClass(Array.isArray(opts.Component) ? opts.Component[0] : opts.Component) },
            component: { get: () => this._component },
            vTree: { value: h('div'), writable: true },
            el: { get: () => this._el },
            _liveWidget: { value: null, writable: true },
            _lastPatchStartTime: { value: Date.now(), writable: true},
            _el: { value: null, writable: true },
            _elInput: { value: opts.el },
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
        
        var newWidget = new VDOMWidget({component: this.component});
        try {
            if (newWidget.component.vTree.children.length) {
                // debugger;
            }
        } catch (err) {}

        var patches = VDOMDiff(this.vTree, newWidget);
        var rootNode = VDOMPatch(this.rootNode, patches);
        this.rootNode = rootNode;
        this.vTree = newWidget;

        this.trigger('patchdom');
    }

    patchStyles(patchRequests) {
        var results = patchRequests.reduceRight((acc, item) => {
            if (!(item.classId in acc.classes)) {
                acc.classes[item.classId] = item;
            }
            if (!(item.id in acc.components)) {
                acc.components[item.id] = item;
            }
            return acc;
        }, {classes:{}, components:{}});

        var instanceStyles = [];
        var staticStyles = {};

        this.component.walkComponents(component => {
            var id = component.id;
            var needsPatch = id in results.components;
            var stylesObj = needsPatch ? results.components[id].results.renderStyles : component._renderCache.renderStyles;
            
            var makeObj = (key, obj) => Object.assign(Object.create(null, { styles: { get: () => obj ? obj[key] : null } }), {id, needsPatch})
            
            instanceStyles.push(makeObj('dynamicStyles', stylesObj));

            id = component.constructor.id;

            if (!(id in staticStyles)) {
                needsPatch = id in results.classes;
                stylesObj = needsPatch ? results.classes[id].results.renderStyles : component._renderCache.renderStyles;
                staticStyles[id] = makeObj('staticStyles', stylesObj);
            }
        }, component => component.isMounted);

        staticStyles = Object.values(staticStyles);

        //We now have a pretty good idea what we're writing. Let's patch those styles to DOM

        var prevEl;
        var styles;

        staticStyles.concat(instanceStyles)
            .reduce((final, obj) => {
                var styleIndex = final.findIndex(styleEl => styleEl.id === 'weddell-style-' + obj.id);
                var styleEl;

                if (!obj.needsPatch) {
                    if (styleIndex > -1) {
                        styleEl = final.splice(styleIndex, 1)[0];
                    } else {
                        styles = obj.styles;
                        if (styles) {
                            styleEl = createStyleEl('weddell-style-' + obj.id, 'weddell-style');
                            styleEl.textContent = obj.styles;
                        }
                    }

                    if (prevEl && styleEl) {
                        var comparison = prevEl.compareDocumentPosition(styleEl);
                        if (comparison !== Node.DOCUMENT_POSITION_FOLLOWING) {
                            prevEl.parentNode.insertBefore(styleEl, prevEl.nextSibling);
                        }
                        
                    }

                    if (styleEl) {
                        prevEl = styleEl;
                    }
                    
                    return final;
                } else {
                    styles = obj.styles || '';

                    if (!styles) {
                        if (styleIndex === -1) {
                            final.splice(styleIndex, 1);
                        }
                        return final;
                    }

                    styleEl = styleIndex > -1 ? final.splice(styleIndex, 1)[0] : createStyleEl('weddell-style-' + obj.id, 'weddell-style');

                    if (prevEl) {
                        var comparison = prevEl.compareDocumentPosition(styleEl);
                        if (comparison !== Node.DOCUMENT_POSITION_FOLLOWING) {
                            prevEl.parentNode.insertBefore(styleEl, prevEl.nextSibling);
                        }
                    }

                    prevEl = styleEl;                    

                    if (styleEl.textContent !== styles) {
                        styleEl.textContent = styles;
                    }                    
                }              

                return final;
            }, Array.from(document.querySelectorAll('head style.weddell-style')))
            .forEach(el => {
                document.head.removeChild(el);
            });
        //@TODO could probably make this more succinct by using Virtual-dom with style elements

        this.trigger('patchstyles');
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

    queuePatch(patchRequests=[]) {
        this._patchRequests = this._patchRequests.concat(patchRequests);
        if (!this._patchPromise) {
            if (this._patchRequests.length) {
                var resolveFunc;
                this._patchPromise = new Promise((resolve) => {
                    resolveFunc = resolve;
                })
                .then(currPatchRequests => {
                    return this.constructor.patchMethods.reduce((acc, patcher) => {
                            return acc
                                .then(() => this[patcher](currPatchRequests))
                        }, Promise.resolve())
                        .then(() => {
                            this.trigger('patch');
                            return this.onPatch()
                        })
                        .then(() => {
                            this._patchPromise = null;
                            this.queuePatch()
                        });
                })
                
                var now = Date.now();
                var dt = now - this._lastPatchStartTime;
                this._lastPatchStartTime = Date.now();

                window.setTimeout(() => {
                    requestAnimationFrame(this._RAFCallback = () =>{
                        this._RAFCallback = null;
                        var currPatchRequests = this._patchRequests;
                        this._patchRequests = [];
                        resolveFunc(currPatchRequests);
                    });   
                }, Math.max(0, patchInterval - dt))
            }            
        }
    }

    onPatch() {
        //noop
    }

    awaitPatch() {
        return this.patchPromise || Promise.resolve();
    }

    awaitNextPatch() {
        return this.patchPromise || this.component.awaitEvent('requestpatch').then(() => this.patchPromise);
    }

    initPatchers() {
        var el = this._elInput;
        if (typeof el == 'string') {
            el = document.querySelector(el);
            if (!el) {
                throw new Error("Could not mount an element using provided query.");
            }
        }
        this._el = el;

        if (this.styles) {
            createStyleEl('weddell-app-styles').textContent = this.styles;
        }
    }

    init() {
        return DOMReady
            .then(() => {
                this.initPatchers();

                this._component = this.makeComponent();

                this.trigger('createcomponent', {component: this.component});
                this.trigger('createrootcomponent', {component: this.component});
                this.component.on('createcomponent', evt => this.trigger('createcomponent', Object.assign({}, evt)));
                this.component.on('requestpatch', evt => {
                    this.queuePatch(evt);
                });
                this.component.on('firstrender', evt => {
                    this._liveWidget = new VDOMWidget({component: this.component});
                });

                Object.seal(this);

                return this.component.init(this.componentInitOpts)
                    .then(() => this.component.mount())
                    .then(() => this.awaitPatch()
                        .then(() => {
                            this.el.classList.add('first-markup-render-complete', 'first-styles-render-complete', 'first-render-complete');
                        }))
            })
    }
}

module.exports = App;
