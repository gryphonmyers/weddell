const DOMReady = require('document-ready-promise')();
const defaults = require('defaults-es6');
const mix = require('@weddell/mixwith').mix;
const EventEmitterMixin = require('@weddell/event-emitter-mixin');
const VDOMPatch = require('virtual-dom/patch');
const VDOMDiff = require('virtual-dom/diff');
const h = require('virtual-dom/h');
const virtualize = require('@weddell/vdom-virtualize');

const WeddellComponent = require('./component');

const defaultOpts = {
    childStylesFirst: true,
    verbosity: 0,
    quietInterval: 100
};

const patchInterval = 33.334;

function createStyleEl(id, className = null) {
    var styleEl = document.getElementById(id)
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.setAttribute('type', 'text/css');
        document.head.appendChild(styleEl);
        styleEl.id = id;
    }
    styleEl.classList.add(className);
    return styleEl;
}

/**
 * @typedef {String} CssString A string of valid CSS style declarations. 
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS
 */

/**
 * @typedef {String} HtmlString A string of valid HTML. 
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML
 */

 /**
  * @typedef {Object} WeddellAppStateSnapshot A snapshot of a Weddell app. This value is ready for serialization, allowing for later rehydration of application state. 
  * @property {HtmlString} stateHtml Application state, serialized to JSON with an event binding it to application init, all wrapped with a script tag, ready to be inserted into HTML files to allow for application restore.
  * @property {HtmlString} stylesHtml All Weddell style tags grouped together in an HTML string, and ready to be inserted into HTML head.
  * @property {HtmlString} fullResponse All HTML in document.
  * @property {HtmlString} appHtml All HTML currently rendered into application mount point.
  */

 /**
  * An app, which owns and manages a root component in the DOM. The Weddell app object is the main entrypoint to your application. 
  * 
  * @alias App
  * @static
  * @memberOf Weddell
  * 
  * @example 
  * const { App } = require('weddell');
  * 
  * var app = new App({
  *     el: '#app',
  *     Component: Component => class MyRootComponent extends Component {
  *         static get markup(locals, h) {
  *             return h('.foo', 'bar');
  *         }
  *     },
  *     styles: `
  *       #app {
  *         color: red;
  *       }
  *     `
  * });
  *
  * app.init();
  * 
  * // Given HTML '<div id="app"></div>', after init finishes, 
  * // '<div id="app"><div class="foo">bar</div></div>' will be 
  * // rendered into the DOM
  */

class WeddellApp extends mix().with(EventEmitterMixin) {

    /**
     * @param {object} opts
     * @param {String|Element} opts.el Element to mount app into, or a DOM query string that should resolve to a single element.
     * @param {WeddellComponentMixin} opts.Component A Weddell component class factory. This component will be mounted as the root into the mount point specified in the 
     * @param {number} [opts.quietInterval=100] Delay between DOM patches to wait before firing the "quiet" event.
     * @param {CssString} [opts.styles] App styles that will be rendered to the DOM once the app initializes. 
     */

    constructor(opts) {
        opts = defaults(opts, defaultOpts);
        super(opts);
        this.styles = opts.styles || this.constructor.styles;
        this.renderOrder = ['markup', 'styles'];
        this.quietInterval = opts.quietInterval;
        this.componentInitOpts = Array.isArray(opts.Component) ? opts.Component[1] : {};
        this.shouldRender = {};
        this.childStylesFirst = opts.childStylesFirst; /*@TODO use this again*/

        Object.defineProperties(this, {
            Component: { value: this.constructor.Weddell.classes.Component.makeComponentClass(Array.isArray(opts.Component) ? opts.Component[0] : opts.Component) },
            component: { get: () => this._component },
            el: { get: () => this._el },
            _liveWidget: { value: null, writable: true },
            _lastPatchStartTime: { value: Date.now(), writable: true },
            _el: { value: null, writable: true },
            _initPromise: { value: null, writable: true },
            _elInput: { value: opts.el },
            _patchPromise: { value: null, writable: true },
            _suspendPromise: { value: Promise.resolve(), writable: true },
            _snapshotData: { value: null, writable: true },
            patchPromise: { get: () => this._patchPromise },
            _patchRequests: { value: [], writable: true },
            _component: { value: null, writable: true },
            _widget: { value: null, writable: true },
            _createdComponents: { value: [] }
        })

        var consts = this.constructor.Weddell.consts;

        if (!this.Component) {
            throw new Error(`There is no base component set for this app. Can't mount.`);
        }
        if (consts.VAR_NAME in window) {
            throw new Error(`Namespace collision for ${consts.VAR_NAME} on window object. Aborting.`);
        }

        Object.defineProperty(window, consts.VAR_NAME, {
            value: { app: this, components: {}, verbosity: opts.verbosity }
        });

        if (opts.verbosity > 0 && opts.styles) {
            console.warn('You are using deprecated syntax: opts.styles on the app are no longer supported. Use static getter');
        }

        Object.defineProperties(this, {
            rootNode: { value: null, writable: true }
        })
    }

    suspendPatches() {
        var resumePatches;
        this._suspendPromise = new Promise(resolve => { resumePatches = resolve });
        return resumePatches
    }

    /**
     * Initializes the app, rendering the root component and mounting it into the specified DOM element.
     * 
     * @param {Object} initObj Object with initialization options. 
     * 
     * @fires Window#weddellinit Event fired on window object once initialization completes.
     * @fires WeddellApp#createcomponent Event fired on app object whenever its root component or any child components are created.
     * @fires WeddellApp#createrootcomponent Event fired on app object whenever its root component is created.
     * 
     * @returns {Promise} Promise that resolves once the app has fully initialized and rendered into the DOM. 
     */

    init(initObj = {}) {
        this.on('createcomponent', evt => {
            this._createdComponents.push(evt.component);
        })

        return DOMReady
            .then(async () => {
                window.dispatchEvent(new CustomEvent('weddellinitbefore', { detail: { app: this } }));

                this.initPatchers();

                if (this._snapshotData) {
                    this.el.classList.add('using-snapshot');
                }
                this.el.classList.add('initting');
                this.el.classList.remove('init-complete', 'first-markup-render-complete', 'first-styles-render-complete', 'first-render-complete');

                this._component = await this.makeComponent();
                /**
                 * @event WeddellApp#createcomponent
                 * @type {Object}
                 * @property {WeddellComponent} component 
                 */
                this.trigger('createcomponent', { component: this.component });
                /**
                 * @event WeddellApp#createrootcomponent
                 * @type {Object}
                 * @property {WeddellComponent} component 
                 */
                this.trigger('createrootcomponent', { component: this.component });
                this.component.on('createcomponent', evt => this.trigger('createcomponent', Object.assign({}, evt)));

                this.component.on('requestpatch', evt => {
                    this.el.classList.add('awaiting-patch');
                    this._patchRequests = this._patchRequests.concat(evt);

                    this._initPromise.then(() => {
                        if (!this._patchPromise) {
                            this._patchPromise = this.queuePatch();
                        }
                    })
                });

                var onPatch = () => {
                    var isRendering = this.component.reduceComponents((acc, component) => acc || !!component.renderPromise, false)
                    if (!isRendering) {
                        this.trigger('quiet');
                    }
                    this.el.classList.add('first-patch-complete');
                    this.component.trigger('patch');
                };
                this.on('patch', onPatch);

                Object.seal(this);

                return this._initPromise = this.initRootComponent(initObj)
            })
            .then(result => {
                /**
                 * Event fired on the window object when a Weddell app finishes initializing. 
                 * 
                 * @event Window#weddellinit
                 * 
                 * @type {CustomEvent}
                 * @property {Object} detail
                 * @property {WeddellApp} detail.app The app that has finished initializing.
                 * 
                 */

                window.dispatchEvent(new CustomEvent('weddellinit', { detail: { app: this } }));
                this.el.classList.remove('initting');
                this.el.classList.add('init-complete');
                return result;
            })
    }

    /**
     * Hook method that may be overridden and will be executed at the end of every DOM patch. 
     * 
     * @returns {Promise} Subsequent patches may be deferred by returning a Promise in this method.
     */

    onPatch() { }    

    /**
     * Returns a promise the resolves with a weddell component once the component with the specified id has been rendered and mounted (not necessarily patched to DOM yet). Note that if the component id does not match any current or future components, the returned promise will never resolve.
     * 
     * @param {string} id Component id to wait for
     * 
     * @returns {Promise.<WeddellComponent>}
     */

    awaitComponentMount(id) {
        return new Promise(resolve => {
            Promise.resolve(this._createdComponents.find(component => component.id === id) || new Promise(resolve => {
                this.on('createcomponent', evt => {
                    if (evt.component.id === id) {
                        resolve(evt.component)
                    }
                })
            }))
                .then(component => {
                    component.awaitMount().then(() => resolve(component));
                })
        })
    }

    /**
     * Returns a promise that will resolve after pending patch completes, or immediately if no patch is currently queued or in progress.
     * 
     * @returns {Promise}
     */
    awaitPatch() {
        return this.patchPromise || Promise.resolve();
    }

    /**
     * Returns a promise that will resolve after current pending patch or the next patch completes.
     * 
     * @returns {Promise}
     */

    awaitNextPatch() {
        return this.patchPromise || this.component.awaitEvent('requestpatch').then(() => this.patchPromise);
    }

    /**
     * Dumps the current application state to a snapshot object, typically used for server-side rendering setups. 
     * 
     * @returns {WeddellAppStateSnapshot}
     */

    renderSnapshot() {
        var parser = new DOMParser();
        var doc = parser.parseFromString(document.documentElement.outerHTML, "text/html");
        var scriptEl = doc.createElement('script');
        scriptEl.innerHTML = `
            window.addEventListener('weddellinitbefore', function(evt){
                evt.detail.app._snapshotData = ${JSON.stringify(this.constructor.takeComponentStateSnapshot(this.component))};
            });
        `;
        doc.body.appendChild(scriptEl);

        return {
            appHtml: this.component.el.outerHTML,
            stateHtml: scriptEl.outerHTML,
            stylesHtml: Array.from(document.querySelectorAll('head style.weddell-style, head style.weddell-app-styles'))
                .map(el => el.outerHTML)
                .join('\n'),
            fullResponse: doc.documentElement.outerHTML
        }
    }

    /**
     * @private
     */

    static get patchMethods() {
        return [
            'patchDOM',
            'patchStyles'
        ];
    }

    /**
     * @private
     */

    initRootComponent(initObj) {
        return this.component.init(this.componentInitOpts)
            .then(() => this.component.mount())
            .then(() => {
                this.el.classList.add('first-markup-render-complete', 'first-styles-render-complete', 'first-render-complete');
            })
    }

    /**
     * @private
     */

    patchStyles(patchRequests) {

        var results = patchRequests.reduceRight((acc, item) => {
            if (!(item.classId in acc.classes)) {
                acc.classes[item.classId] = item;
            }
            if (!(item.id in acc.components)) {
                acc.components[item.id] = item;
            }
            return acc;
        }, { classes: {}, components: {} });

        var instanceStyles = [];
        var staticStyles = {};

        this.component.walkComponents(component => {
            var id = component.id;
            var needsPatch = id in results.components;
            var stylesObj = needsPatch ? results.components[id].results.renderStyles : component._renderCache.renderStyles;

            var makeObj = (key, obj) => Object.assign(Object.create(null, { styles: { get: () => obj ? obj[key] : null } }), { id, needsPatch })
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

        staticStyles.concat(instanceStyles)
            .reduce((final, obj) => {
                if (!obj.styles) {
                    /* this component has never rendered before. skip it */
                    return final;
                }

                if (!obj.needsPatch) {

                    obj.styles.forEach((styles, ii) => {
                        var styleIndex = final.findIndex(styleEl => styleEl.id === `weddell-style-${obj.id}-${ii}`);

                        if (styleIndex > -1) {
                            /* Object doesn't need a patch and it already has a style element in dom, so do nothing. */
                            var styleEl = final.splice(styleIndex, 1)[0];
                        } else {
                            /* Object doesn't need a patch and it does not have a style element in dom */
                            if (styles) {
                                styleEl = createStyleEl(`weddell-style-${obj.id}-${ii}`, 'weddell-style');
                                styleEl.textContent = styles;
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
                    });

                    return final;
                } else {

                    obj.styles.forEach((styles, ii) => {
                        var styleIndex = final.findIndex(styleEl => styleEl.id === `weddell-style-${obj.id}-${ii}`);

                        if (!styles) {
                            if (styleIndex > -1) {
                                final.splice(styleIndex, 1);
                            }
                            return final;
                        }

                        var styleEl = styleIndex > -1 ? final.splice(styleIndex, 1)[0] : createStyleEl(`weddell-style-${obj.id}-${ii}`, 'weddell-style');

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

                    });

                    return final;
                }

            }, Array.from(document.querySelectorAll('head style.weddell-style')))
            .forEach(el => {
                document.head.removeChild(el);
            });
        //@TODO could probably make this more succinct by using Virtual-dom with style elements

        this.trigger('patchstyles');
    }

    /**
     * @private
     */

    async makeComponent(componentOpts = {}) {
        var id = this.rootNode.getAttribute('data-wdl-id');
        var snapshot = this._snapshotData;
        if (snapshot && id && snapshot.id !== id) {
            throw new Error('Snapshot id does not match root element id.')
        }

        var opts = defaults({
            isRoot: true,
            id,
        }, componentOpts);

        if (snapshot) {
            var addElReferences = (obj, parentEl) => {
                var el = parentEl.querySelector(`[data-wdl-id="${obj.id}"]`);

                if (el) {
                    obj.el = el;

                    if (obj.componentSnapshots) {
                        for (var componentName in obj.componentSnapshots) {
                            for (var index in obj.componentSnapshots[componentName]) {
                                addElReferences(obj.componentSnapshots[componentName][index], el);
                            }
                        }
                    }
                }
                return obj;
            };
            snapshot = addElReferences(snapshot, this.el);
            if (snapshot.state) {
                opts.initialState = snapshot.state;
            }
            if (snapshot.componentSnapshots) {
                opts.componentSnapshots = snapshot.componentSnapshots;
            }
            if (snapshot.el) {
                opts.el = snapshot.el;
            }
        }
        var Component = await this.Component;
        var component = new Component(opts);

        component.assignProps(
            Object.values(this.el.attributes)
                .reduce((finalObj, attr) => {
                    finalObj[attr.name] = attr.value;
                    return finalObj;
                }, {})
        );

        return component;
    }

    /**
     * @private
     */

    queuePatch() {
        var resolveFunc;
        var promise = new Promise((resolve) => {
            resolveFunc = resolve;
        })
            .then(currPatchRequests => {
                return this.constructor.patchMethods.reduce((acc, patcher) => {
                    return acc
                        .then(() => this[patcher](currPatchRequests))
                }, Promise.resolve())
                    .then(() => {
                        if (this._patchRequests.length) {
                            return Promise.reject('Rerender');
                        }
                    })
                    .then(() => {
                        this._patchPromise = null;
                        /**
                         * @event WeddellApp#patch
                         */
                        this.trigger('patch');
                        this.el.classList.remove('awaiting-patch');
                        return this.onPatch()
                    }, err => {
                        if (err === 'Rerender') {
                            return this.queuePatch();
                        }
                        console.error('Error patching:', err.stack)
                    })
            })

        var now = Date.now();
        var dt = now - this._lastPatchStartTime;
        this._lastPatchStartTime = Date.now();

        window.setTimeout(() => {
            
            this._suspendPromise
                .then(() => {
                    var currPatchRequests = this._patchRequests;
                    this._patchRequests = [];
                    resolveFunc(currPatchRequests)
                })
        }, Math.max(0, patchInterval - dt))

        return promise;
    }

    /**
     * @private
     */

    initPatchers() {
        var el = this._elInput;
        if (typeof el == 'string') {
            el = document.querySelector(el);
            if (!el) {
                throw new Error("Could not mount an element using provided query.");
            }
        }
        this._el = el;

        if (!(this.rootNode = this.el.firstChild)) {
            this.rootNode = document.createElement('div');
            this._widget = h('div');
        } else {
            this._widget = virtualize(this.rootNode, 'id');
        }

        if (this.styles) {
            createStyleEl('weddell-app-styles', 'weddell-app-styles').textContent = this.styles;
        }
    }

    /**
     * @private
     */

    static takeComponentStateSnapshot(component) {
        var obj = {
            id: component.id,
            state: Object.entries(component.state.collectChangedData())
                .reduce((acc, curr) => {
                    if (curr[0][0] !== '$') {
                        return Object.assign(acc, { [curr[0]]: curr[1] })
                    }
                    return acc;
                }, {})
        };
        var componentSnapshots = {};
        for (var componentName in component._componentInstances) {
            var components = component._componentInstances[componentName];
            for (var componentIndex in components) {
                if (!(componentName in componentSnapshots)) {
                    componentSnapshots[componentName] = {};
                }
                componentSnapshots[componentName][componentIndex] = this.takeComponentStateSnapshot(components[componentIndex]);
            }
        }
        if (Object.keys(componentSnapshots).length) {
            obj.componentSnapshots = componentSnapshots;
        }
        return obj;
    }

    /**
     * @private
     */

    patchDOM(patchRequests) {
        if (!this.rootNode.parentNode) {
            this.el.appendChild(this.rootNode);
        }
        this.component.refreshWidgets();
        var patches = VDOMDiff(this._widget, this.component._widget);
        var rootNode = VDOMPatch(this.rootNode, patches);
        this.rootNode = rootNode;
        this._widget = this.component._widget;

        this.trigger('patchdom');
    }
}

module.exports = WeddellApp;
