const DOMReady = require('document-ready-promise')();
const defaults = require('object.defaults/immutable');
const mix = require('mixwith-es5').mix;
const EventEmitterMixin = require('./event-emitter-mixin');
const VDOMPatch = require('virtual-dom/patch');
const VDOMDiff = require('virtual-dom/diff');
const h = require('virtual-dom/h');
const debounce = require('debounce');
const virtualize = require('vdom-virtualize');

const defaultOpts = {
    childStylesFirst: true,
    verbosity: 0,
    quietInterval: 100
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
        this.styles = opts.styles || this.constructor.styles;
        this.renderOrder = ['markup', 'styles'];
        this.quietInterval = opts.quietInterval;
        this.pipelineInitMethods = opts.pipelineInitMethods;
        this.componentInitOpts = Array.isArray(opts.Component) ? opts.Component[1] : {};
        this.shouldRender = {};
        this.childStylesFirst = opts.childStylesFirst; /*@TODO use this again*/

        Object.defineProperties(this, {
            Component: { value: this.constructor.Weddell.classes.Component.makeComponentClass(Array.isArray(opts.Component) ? opts.Component[0] : opts.Component) },
            component: { get: () => this._component },
            el: { get: () => this._el },
            _liveWidget: { value: null, writable: true },
            _lastPatchStartTime: { value: Date.now(), writable: true},
            _el: { value: null, writable: true },
            _initPromise: { value: null, writable: true },
            _elInput: { value: opts.el },
            _patchPromise: { value: null, writable: true },
            _snapshotData: { value: null, writable: true },
            patchPromise: { get: () => this._patchPromise },
            _RAFCallback: { value: null, writable: true },
            _patchRequests: { value: [], writable: true },
            _patchPromise: { value: null, writable: true },
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
            value: {app: this, components: {} }
        });

        if (opts.verbosity > 0 && opts.styles) {
            console.warn('You are using deprecated syntax: opts.styles on the app are no longer supported. Use static getter');
        }

        Object.defineProperties(this, {
            rootNode: { value: null, writable: true }
        })
    }

    onPatch() {}

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
                        if (styleIndex > -1) {
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
        var id = this.rootNode.getAttribute('data-wdl-id');
        var snapshot = this._snapshotData;
        if (snapshot && id && snapshot.id !== id) {
            throw new Error('Snapshot id does not match root element id.')
        }

        var opts = {
            isRoot: true,
            id,
        };

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
        
        var component = new (this.Component)(opts);       

        component.assignProps(
            Object.values(this.el.attributes)
                .reduce((finalObj, attr) => {
                    finalObj[attr.name] = attr.value;
                    return finalObj;
                }, {})
        );

        return component;
    }

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
                    this.trigger('patch');
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
            requestAnimationFrame(this._RAFCallback = () =>{
                this._RAFCallback = null;
                var currPatchRequests = this._patchRequests;
                this._patchRequests = [];
                resolveFunc(currPatchRequests);
            });   
        }, Math.max(0, patchInterval - dt))        
        
        return promise;
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

        if (!(this.rootNode = this.el.firstChild)) {
            this.rootNode = document.createElement('div');
            this._widget = h('div');
        } else {
            this._widget = virtualize(this.el);
        }

        if (this.styles) {
            createStyleEl('weddell-app-styles', 'weddell-app-styles').textContent = this.styles;
        }
    }

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

    initRootComponent() {
        return this.component.init(this.componentInitOpts)
            .then(() => this.component.mount())
            .then(() => this.awaitPatch()
                .then(() => {
                    this.el.classList.add('first-markup-render-complete', 'first-styles-render-complete', 'first-render-complete');
                }))
    }

    init() {
        this.on('createcomponent', evt => {
            this._createdComponents.push(evt.component);
        })

        return DOMReady
            .then(() => {
                window.dispatchEvent(
                    new CustomEvent('weddellinitbefore', {
                        detail: {  app: this }
                    })
                );

                this.initPatchers();
                this.el.classList.remove('init-complete', 'first-markup-render-complete', 'first-styles-render-complete', 'first-render-complete');

                this._component = this.makeComponent();
                    
                this.trigger('createcomponent', {component: this.component});
                this.trigger('createrootcomponent', {component: this.component});
                this.component.on('createcomponent', evt => this.trigger('createcomponent', Object.assign({}, evt)));

                this.component.on('requestpatch', evt => {
                    this._patchRequests = this._patchRequests.concat(evt);

                    this._initPromise.then(() => {
                        if (!this._patchPromise) {
                            this._patchPromise = this.queuePatch();
                        }
                    })
                });
                

                Object.seal(this);

                return this._initPromise = this.initRootComponent();
            })
            .then(result => {
                window.dispatchEvent(
                    new CustomEvent('weddellinit', {
                        detail: { app: this }
                    })
                );

                var quietCallback = debounce(() => {
                    this.trigger('quiet');
                }, this.quietInterval);
                
                var onPatch;
                this.on('patch', onPatch = () => {
                    var isRendering = this.component.reduceComponents((acc, component) => acc || !!component.renderPromise, false)
                    if (isRendering) {
                        this.awaitNextPatch()
                            .then(onPatch)
                    } else {
                        quietCallback();
                    }
                    this.component.trigger('patch');
                });
                this.el.classList.add('init-complete');
                return result;
            })
    }
}

module.exports = App;
