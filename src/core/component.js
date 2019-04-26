const EventEmitterMixin = require('@weddell/event-emitter-mixin');
const defaults = require('defaults-es6');
const generateHash = require('../utils/make-hash');
const mix = require('@weddell/mixwith').mix;
const h = require('virtual-dom/h');
const VdomWidget = require('./vdom-widget');
const cloneVNode = require('../utils/clone-vnode');
const flatten = require('../utils/flatten');
const compact = require('../utils/compact');
const uniq = require('../utils/uniq');
const difference = require('../utils/difference');
const vdomDiff = require('virtual-dom/diff');
const flat = require('array.prototype.flat');
flat.shim();

const defaultOpts = {
    consts: {},
    store: {},
    inputs: null,
    isRoot: false
};
const defaultInitOpts = {};
var _generatedComponentClasses = {};
const testElement = document.createElement('div');

const renderInterval = 33.333;

/**
 * @typedef {Array} StoreWatchArgs
 * 
 * Arguments as passed into {@link https://github.com/gryphonmyers/weddell/tree/ft-new-render#storewatchkey-func-validator-invokeimmediately-onlyfireonce--removeeventlistenercallback Store#watch} (in the most basic use case, this will be an array with two items: a key and a callback function).
 */

/**
 * @callback StateTransform
 * 
 * @param {String} key
 * @param {*} value
 * 
 * @returns {*}
 */

/**
 * @callback WeddellComponentMixin
 * 
 * @param {function(new:WeddellComponent)} Component Base WeddellComponent class.
 * 
 * @returns {function(new:WeddellComponent)} Extended class (typically the base class with extensions applied).
 */

 /**
  * @callback CssTemplate
  * 
  * @param {object} locals
  * 
  * @returns {CssString}
  */

/**
 * @typedef {object} DomCreateEvtObj
 * 
 * @property {Element|null} el The DOM element that was created
 */

/**
 * @typedef {object} DomDestroyEvtObj
 * 
 * @property {Element|null} el The DOM element that was destroyed
 */

 /**
 * @typedef {object} DomChangeEvtObj
 * 
 * @property {Element|null} newEl The new DOM element that was created
 * @property {Element|null} prevEl The DOM element that was previously associated with this component
 */

/**
 * @callback VirtualDomTemplate
 * 
 * @param {object} locals Component state + helpers
 * @param {Function} h hyperscript implementation
 * 
 * @returns {VirtualNode}
 */

/**
 * @typedef {object} VirtualNode A virtual node object, as implemented by the virtual-dom library. 
 * 
 * @see {@link https://github.com/Matt-Esch/virtual-dom}
 */
 /**
  * Class representing a Weddell component. A component encapsulates some combination of scripts, markup and/or styles into an instantiable custom tag.
  * 
  * @alias Component
  * @static
  * @memberOf Weddell
  */

class WeddellComponent extends mix().with(EventEmitterMixin) {

    /**
     * Constructs a Weddell Component. One does not generally instantiate components directly, but rather includes them declaratively via markup tags. This information is available primarily for the purposes of plugin authorship. See the static {@link #Weddell.Component.markup markup}, {@link #Weddell.Component.state state}, and {@link #Weddell.Component.styles styles} properties for more typical component development entrypoints.
     * 
     * @param {object} opts
     * @param {object} opts.consts Base consts object that will be merged into static store declaration.
     * @param {object} opts.state Base state object that will be merged into static store declaration.
     * @param {object} opts.components
     * @param {object} [opts.initialState] Initial state of the component. 
     */
    
    constructor(opts) {
        opts = defaults(opts, defaultOpts);
        super(opts);
        var weddellGlobals = window[this.constructor.Weddell.consts.VAR_NAME];
        var Store = this.constructor.Weddell.classes.Store;
        if (weddellGlobals.verbosity > 0 && opts.inputs) {
            console.warn('you are using outdated syntax! opts.inputs is deprecated in favor of static getter.')
        }
        var inputs = compact(uniq((opts.inputs || []).concat(this.constructor.inputs)));

        Object.defineProperties(this, {
            id: { get: () => this._id },
            isRoot: { value: opts.isRoot },
            _content: { value: [], writable: true },
            content: {
                get: () => {
                    return this._content;
                }, set: val => {
                    var oldContent = this._content;
                    this._content = val;
                    if (vdomDiff(oldContent, val).a.length) {
                        this.markDirty();
                    }
                }
            },
            hasMounted: { get: () => this._hasMounted },
            isMounted: { get: () => this._isMounted },
            renderPromise: { get: () => this._renderPromise },
            childComponents: { get: () => this._childComponents },
            contentComponents: { get: () => this._contentComponents },
            hasRendered: { get: () => this._hasRendered },
            el: { get: () => this._el },
            isInit: { get: () => this._isInit },
            defaultInitOpts: { value: defaults(opts.defaultInitOpts, defaultInitOpts) },
            root: { value: opts.isRoot ? this : opts.root },
            inputs: { value: inputs },
            //@TODO inputs don't need to be stored on isntance at all
            renderers: { value: {} },
            _el: { value: null, writable: true },
            _lastRenderTimeStamps: {
                value: this.constructor.renderMethods
                    .reduce((acc, key) => Object.assign(acc, { [key]: null }), {})
            },
            _lastAccessedStateKeys: {
                value: this.constructor.renderMethods
                    .reduce((acc, key) => Object.assign(acc, { [key]: [] }), {})
            },
            _componentSnapshots: { value: opts.componentSnapshots || null },
            _dirtyRenderers: { value: true, writable: true },
            _contentComponents: { value: [], writable: true },
            _inlineEventHandlers: { writable: true, value: {} },
            _isMounted: { writable: true, value: null },
            _lastRenderedComponents: { writable: true, value: null },
            _childComponents: { writable: true, value: {} },
            _componentsRequestingPatch: { writable: true, value: [] },
            _renderPromise: { writable: true, value: null },
            _hasMounted: { writable: true, value: false },
            _hasRendered: { writable: true, value: false },
            _widgetIsDirty: { writable: true, value: false },
            _vTree: { writable: true, value: null },
            _prevVTree: { writable: true, value: null },
            _prevWidget: { writable: true, value: null },
            _dirtyWidgets: { writable: true, value: {} },
            _renderCache: {
                value: this.constructor.renderMethods
                    .reduce((acc, key) => Object.assign(acc, { [key]: [] }), {})
            },
            _isInit: { writable: true, value: false },
            _id: { value: opts.id || generateHash() },
            _componentListenerCallbacks: { value: {}, writable: true }
        });

        var inputMappings = this.constructor._inputMappings ? Object.entries(this.constructor._inputMappings)
            .filter(entry => this.inputs.find(input => input === entry[0] || input.key === entry[0]))
            .reduce((final, entry) => {
                final[entry[1]] = entry[0];
                return final;
            }, {}) : {};


        if (weddellGlobals.verbosity > 0 && opts.store) {
            console.warn("opts.store is deprecated in favor of static 'consts' getter. Update your code!");
        }

        if (weddellGlobals.verbosity > 0 && this.store) {
            console.warn("'store' property on instance is deprecated in favor of static 'consts' getter. Update your code!");
        }

        if (weddellGlobals.verbosity > 0 && this.constructor.store) {
            console.warn("'store' static getter on instance is deprecated in favor of static 'consts' getter. Update your code!");
        }

        Object.defineProperties(this, {
            _widget: { writable: true, value: new VdomWidget({ component: this, childWidgets: {} }) },
            props: {
                value: new Store(this.inputs.map(input => typeof input === 'string' ? input : input.key ? input.key : null), {
                    shouldMonitorChanges: true,
                    extends: (opts.parentComponent ? [opts.parentComponent.props, opts.parentComponent.state, opts.parentComponent.store] : null),
                    inputMappings,
                    validators: this.inputs.filter(input => typeof input === 'object').reduce((final, inputObj) => Object.assign(final, { [inputObj.key]: { validator: inputObj.validator, required: inputObj.required } }), {}),
                    shouldEvalFunctions: false,
                    requireSerializable: false,
                })
            },
            consts: {
                value: new Store(defaults({
                    $bind: this.bindEvent.bind(this),
                    $bindValue: this.bindEventValue.bind(this)
                }, this.constructor.consts || {}, opts.consts || {}, this.constructor.store || {}, this.store || {}, opts.store || {}), {
                    requireSerializable: false,
                    shouldMonitorChanges: false,
                    shouldEvalFunctions: false
                })
            },
            store: { get: () => this.consts }
        });

        if (weddellGlobals.verbosity > 0 && opts.state) {
            console.warn("opts.state is deprecated in favor of static 'state' getter. Update your code!");
        }

        var state = Object.assign({}, opts.state || {}, this.constructor.state);
        var component = this;
        var serializers = component.constructor.serializers;
        var deserializers = component.constructor.deserializers;

        Object.defineProperty(this, 'state', {
            value: new Store(defaults({
                $attributes: null,
                $id: () => this.id
            }, state), {
                    propertySets: this.constructor.propertySets,
                    initialState: opts.initialState,
                    overrides: [this.props],
                    proxies: [this.consts],
                    setTransform: function (key, value) {
                        return serializers && serializers[key]
                            ? serializers[key].call(this, value)
                            : value;
                    },
                    getTransform: function (key, value) {
                        return deserializers && deserializers[key]
                            ? deserializers[key].call(this, value)
                            : value;
                    }
                })
        })

        if (weddellGlobals.verbosity > 0 && opts.components) {
            console.warn("opts.components is deprecated in favor of static 'components' getter. Please update your code.");
        }
        var components = Object.assign({}, opts.components || {}, this.constructor.components);

        Object.defineProperties(this, {
            _componentInstances: {
                value:
                    Object.keys(components)
                        .map(key => key.toLowerCase())
                        .reduce((final, key) => {
                            final[key] = {};
                            return final;
                        }, {})
            },
            _locals: { value: new Store({}, { proxies: [this.state, this.consts], shouldMonitorChanges: false, shouldEvalFunctions: false }) }
        });

        Object.defineProperty(this, 'components', {
            value: Object.entries(components)
                .map(entry => [entry[0].toLowerCase(), entry[1]])
                .reduce((final, entry) => {
                    final[entry[0]] = { weddellClassInput: entry[1] };
                    return final;
                }, {})
        })

        this.getParent = () => opts.parentComponent || null;
        if (weddellGlobals.verbosity > 0 && opts.markupTemplate) {
            console.warn("You are using deprecated syntax. 'markupTemplate' will be removed in the next major version. Use static 'markup' getter.");
        }
        if (weddellGlobals.verbosity > 0 && (opts.stylesTemplate || this.constructor.dynamicStyles)) {
            console.warn("You are using deprecated syntax. 'stylesTemplate' and 'dynamicStyles' static getter will be removed in the next major version. Use static 'styles' getter for static styles, and instance 'styles' for runtime templates.");
        }
        this.vNodeTemplate = this.makeVNodeTemplate(this.constructor.markup, opts.markupTemplate);
        this.stylesTemplate = this.makeStylesTemplate(...[(this.constructor.dynamicStyles || opts.stylesTemplate)].concat(this.constructor.styles).filter(val => val).flat(10));

        weddellGlobals.components[this._id] = this;
    }

    /**
     * @todo Document serializers/deserializers
     * @todo document static event handlers
     */

     /**
     * Stub property. Typically, components will override the markup property to provide their components's virtual DOM template function. The template function is passed both component state and the application's hyperscript implementation ('h'). See the {@link https://github.com/Matt-Esch/virtual-dom virtual-dom} docs for more info about this syntax.
     * 
     * @type {VirtualDomTemplate}
     * 
     * @example
     * 
     * Component => class MyComponent extends Component {
     *  static get markup() {
     *      return (locals, h) =>
     *          h('.my-component', [
     *             h('div', {
     *              attributes: {
     *                  onclick: 'console.log("hello");'
     *              }
     *             }, 'Click Me')
     *          ])
     *  }
     * }
     * 
     * // Will render '<div class="my-component" onclick='console.log("hello");'>Click Me</div>' to DOM
     * 
     * @example <caption>Hscript can be a bit clunky to work with when your display logic gets more complex. Development tools like pug-vdom can port other, perhaps more succinct syntaxes to return virtual-dom nodes.</caption>
     * 
     * Component => class MyComponent extends Component {
     *  static get markup() {
     *      return require('./my-component.pug');
     *  }
     * }
     * 
     * // in './my-component.pug':
     * //
     * // .my-component
     * //   div(onclick="console.log('hello')") Click Me
     * 
     * // This example would require the use of the pug-vdom dev tool. weddell-dev-tools includes pug support 
     * // out of the box. Or you can write your own require hook to adapt your favorite template syntax to 
     * // return virtual dom nodes.
     */

    static get markup() {
        return null
    }

    /**
     * Stub property. Typically, components override this property, returning the keys and default state values. When a component is initialized, it will use this object when creating its own local transient state object. Once initialized, subsequent changes to any key in the WeddellComponent#state object will trigger component rerenders -> DOM patches. 
     * 
     * @type {object}
     * 
     * @example
     * Component => class MyComponent extends Component {
     *  static get state() {
     *      return {
     *          myContent: 'Foobar'
     *      }
     *  }
     *  static get markup() {
     *      return (locals, h) =>
     *          h('.my-component', [locals.myContent])
     *  }
     * }
     * 
     * // Will render '<div class="my-component">Foobar</div>' to DOM
     * 
     * @example <caption>Values saved to state must be serializable (strings, numbers, plain objects, arrays, bools). Trying to save a complete data type to state will cause an error to be thrown. If you really need to save non-serializable objects to state, look at the Component.serializers and Component.deserializers properties.</caption>
     * 
     * Component => class MyComponent extends Component {
     *  static get state() {
     *      return {
     *          myContent: new Foobar() //Don't do this!
     *      }
     *  }
     * 
     *  static get markup() {
     *      return (locals, h) =>
     *          h('.my-component', [locals.myContent])
     *  }
     * }
     * 
     * // Will throw an error. Instances of the Foobar class are not plain objects, and 
     * // thus are not serializable.
     * 
     * @example <caption>There is, however, an exception allowing serializable data in state: state values declared as functions will be interpreted as 'computed values'. These functions are executed in the context of the component state object, and will be recomputed when referenced state values change. Note: functions may only be specified in the initial declaration - you can NOT set a state value to a new function at runtime (that will result in an error being thrown).</caption>
     * 
     * Component => class MyComponent extends Component {
     *  static get state() {
     *      return {
     *          numbers: [1, 2],
     *          numbersDoubled: function(){
     *              return this.numbers.map(num => num * 2);
     *          }
     *      }
     *  }
     * 
     *  static get markup() {
     *      return (locals, h) =>
     *          h('.my-component', { attributes: { 
     *              onclick: locals.$bind('this.state.numbers = this.state.numbers.map(num => num + 1)') }
     *          }, locals.numbersDoubled)
     *  }
     * }
     * 
     * // '<div class="my-component">2 4</div>'
     * // * User clicks *
     * // '<div class="my-component">4 6</div>'
     * 
     * 
     * @example <caption>When inheriting from a parent component class, the ES6 class spec's super keyword makes it easy to merge with parent state.</caption> 
     * 
     * Component => class MyComponent extends MyParentComponentMixin(Component) {
     *  static get state() {
     *      return Object.assign({}, super.state, { //Note argument order - we default to super state, override with our state.
     *          numbersDoubledMinus1: function(){
     *              return this.numbersDoubled.map(num => num - 1);
     *          }
     *      });
     *  }
     * 
     *  static get markup() {
     *      return (locals, h) =>
     *          h('.my-component', locals.numbersDoubledMinus1)
     *  }
     * }
     * 
     * // Assuming 'MyParentComponentMixin' is the mixin from the previous example...
     * // '<div class="my-component">1 3</div>'
     * // * User clicks *
     * // '<div class="my-component">3 5</div>'
     * 
     * @example <caption>When working with objects and arrays in component state, be cognizant of the fact that you must set the state value itself in order for the necessary change events to fire, triggering DOM refresh. Getting this wrong can lead to hard-to-track-down bugs.</caption> 
     * 
     * Component => class MyComponent extends Component {
     *  static get state() {
     *      return {
     *          myObject: {
     *              myValue: 1
     *          }
     *      }
     *  }
     * 
     *  static get markup() {
     *      return (locals, h) =>
     *          h('.my-component', {
     *              attributes: {
     *                  onclick: locals.$bind('this.state.myObject.myValue += 1')
     *              }
     *          }, locals.myObject.myValue)
     *  }
     * }
     * 
     * // '<div class="my-component">1/div>'
     * // * User clicks *
     * // '<div class="my-component">1</div>'
     * // Even though our event handler was fired, the DOM did not get refreshed! Let's try this again...
     * 
     * Component => class MyComponent extends Component {
     *  static get state() {
     *      return {
     *          myObject: {
     *              myValue: 1
     *          }
     *      }
     *  }
     * 
     *  static get markup() {
     *      return (locals, h) =>
     *          h('.my-component', {
     *              attributes: {
     *                  onclick: locals.$bind('this.state.myObject = { ...this.state.myObject, myValue: this.state.myObject.myValue + 1 }')
     *              }
     *          }, locals.myObject.myValue)
     *  }
     * }
     * // '<div class="my-component">1/div>'
     * // * User clicks *
     * // '<div class="my-component">2</div>'
     * // There we go! Because we set this.state.myObject itself to a new value instead of just setting 
     * // a property on the existing value, the appropriate events got fired, and the DOM refreshed.
     * 
     */

    static get state() {
        return {};
    }

    /**
     * Stub property. Typically, components with custom CSS styles will override this property. Styles returned here will be dynamically inserted into style elements in the DOM's head when needed. Strings will be applied on a per-class basis (one copy for all component instances), while functions will be executed as a style template on a per-instance basis.
     * 
     * @returns {Array.<CssTemplate|CssString>|CssString|CssTemplate}
     * 
     * @example
     * 
     * Component => class MyComponent extends Component {
     *  static get styles() {
     *      return `
     *          .my-component {
     *              color: red;
     *          }
     *      `
     *  }
     * 
     *  static get markup() {
     *      return (locals, h) =>
     *          h('.my-component', 'Foo bar')
     *  }
     * }
     * 
     * // Once mounted and patched, the element will be rendered in DOM with red text.
     * 
     * @example <caption>You can also return a function instead of a string, in which case current component state is available for dynamic styling.</caption>
     * 
     * Component => class MyComponent extends Component {
     *  static get state() {
     *      return {
     *          myImg: 'https://mywebsite.com/myimage.jpg'
     *      }
     *  }
     * 
     *  static get styles() {
     *      return (locals) => `
     *          .my-component {
     *              background-image: url(${locals.myImg});
     *          }
     *      `
     *  }
     * 
     *  static get markup() {
     *      return (locals, h) =>
     *          h('.my-component', 'Foo bar')
     *  }
     * }
     * 
     * // Once mounted and patched, the element will be rendered with 'myimage.jpg' in the background.
     * 
     * @example <caption>Be careful with CSS template functions though! Unlike string values, template functions will be executed and rendered to DOM for every component instance, which can lead to performance issues. Ideally, static, class-level styles should be returned as strings, while styles making use of component instance state, if needed, should be returned as template functions. You can mix and match by returning an array of style values.</caption>
     * 
     * Component => class MyComponent extends Component {
     *  static get state() {
     *      return {
     *          myImg: 'https://mywebsite.com/myimage.jpg'
     *      }
     *  }
     * 
     *  static get styles() {
     *      return [
     *      (locals) => `
     *            .my-component {
     *                background-image: url(${locals.myImg});
     *            }
     *        `,
     *        `
     *            .my-component {
     *                color: red;
     *            }
     *        `
     *      ]
     *  }
     * 
     *  static get markup() {
     *      return (locals, h) =>
     *          h('.my-component', 'Foo bar')
     *  }
     * }
     * 
     * // Once mounted and patched, the element will be rendered with 'myimage.jpg' in the background and 
     * // red text. Since the red text does not need component state, we return it as a string, separately 
     * // from the background-image style - it will be more performant that way.
     * 
     * @example <caption>When inheriting from a parent component class, the ES6 class spec's super keyword makes it easy to extend the parent styles.</caption>
     * 
     * Component => class MyChildComponent extends MyParentComponentMixin(MyComponent) {
     * 
     *  static get styles() {
     *      return [
     *         `
     *              .my-component {
     *                  border: 2px solid red;
     *             }
     *          `
     *      ].concat(super.styles);
     *  }
     * }
     * 
     * // Assuming 'MyParentComponentMixin' is the mixin from the previous example, we would get an element
     * // rendered to DOM with 'myimage.jpg' in the background, red text, and a 2px solid red border
     */

    static get styles() {
        return '';
    }

    /**
     * Stub property. Typically, components with child components will override this property, supplying component mixins that can then be included in the component's markup template by the entry key. 
     * 
     * @type {Object.<string, WeddellComponentMixin>}
     * 
     * @example
     * 
     * Component => class MyComponent extends Component {
     *  static get markup(locals, h) {
     *      return h('.foo', [
     *          h('my-child-component')
     *      ]);
     *  }
     * 
     *  static get components() {
     *      return {
     *          'my-child-component': Component => class extends Component {
     *              static get markup(locals, h) {
     *                  return h('.bar', ['bar']);
     *              }
     *          }
     *      }
     *  }
     * }
     * 
     * // will render '<div class="foo"><div class="bar">bar</div></div>' into the DOM.
     * 
     * @example <caption>You can pass markup down from the parent component to the child by placing the 'content' tag in the child.</caption>
     * 
     * Component => class MyComponent extends Component {
     *  static get markup(locals, h) {
     *      return h('.foo', [
     *          h('my-child-component', [
     *              'This is my content'
     *          ])
     *      ]);
     *  }
     * 
     *  static get components() {
     *      return {
     *          'my-child-component': Component => class extends Component {
     *              static get markup(locals, h) {
     *                  return h('.bar', [
     *                      h('content')
     *                  ]);
     *              }
     *          }
     *      }
     *  }
     * }
     * 
     * // Will render as '<div class="foo"><div class="my-child-component">This is my content</div></div>'
     * 
     * 
     * @todo supply example demonstrating nested child tag scoping
     * @todo example showing static parent -> child state binding
     * @todo example showing custom event handlers
     * 
     */

    static get components() {
        return {};
    }

    /**
     * Stub property. Typically, components with inputs will override this property. The inputs property flags particular keys as being expected as input data from parent components.
     * 
     * @type {String[]}
     * 
     * @example
     * 
     * Component => class MyComponent extends Component {
     *  static get state() {
     *      return {
     *          myParentData: 'foo'
     *      }
     *  }
     *  static get markup(locals, h) {
     *      return h('.foo', [
     *          h('my-child-component', {
     *              attributes: {
     *                  myChildData: locals.myParentData
     *              }
     *          }, [
     *              'This is my content'
     *          ])
     *      ]);
     *  }
     * 
     *  static get components() {
     *      return {
     *          'my-child-component': Component => class extends Component {
     *              static get inputs() {
     *                  return ['myChildData']
     *              }
     * 
     *              static get state() {
     *                  return {
     *                      myChildData: 'bar'
     *                  }
     *              }
     * 
     *              static get markup(locals, h) {
     *                  return h('.bar', [
     *                      locals.myChildData
     *                  ]);
     *              }
     *          }
     *      }
     *  }
     * }
     * 
     * // Component will render as '<div class="foo"><div class="my-child-component">foo</div></div>'
     * // But note that not that if the inputs property did not include 'myChildData', or if the parent
     * // component did not pass 'locals.myParentData' into the child component, then it would render
     * // '<div class="foo"><div class="my-child-component">bar</div></div>'
     * 
     * @todo Clean up / fix object form of inputs, then document.
     */

    static get inputs() {
        return [];
    }

    /**
     * Stub property. Typically, components with constant helper values will override this property. These values will be proxied onto the component instance's 'state' property.
     * 
     * @type {object}
     * 
     * @todo Example showing const availability on state object.
     */

    static get consts() {
        return {};
    }

    /**
     * Stub property. Typically, components with property sets will override this property. Property sets group other state keys together into objects, making them more portable for passing down to components in a way that avoids unnecessary duplication.
     * 
     * @type {Object.<string, Object.<string, string>|String[]>}
     * 
     * @example
     * Component => class MyComponent extends Component {
     * 
     *  static get state() {
     *      return {
     *          myProperty1: 'foo',
     *          myProperty2: 'bar',
     *          myUnrelatedProperty: 'whoosh'
     *      }
     *  }
     * 
     *  static get propertySets() {
     *      return {
     *          propertiesForChild: [
     *              'myProperty1',
     *              'myProperty2'
     *          ]
     *      }
     *  }
     * 
     *  static get markup(locals, h) {
     *      return h('.foo', [
     *          h('my-child-component', {
     *              attributes: locals.propertiesForChild
     *          })
     *      ]);
     *  }
     * 
     *  static get components() {
     *      return {
     *          'my-child-component': Component => class extends Component {
     *              static get inputs() {
     *                  return [
     *                      'myProperty1',
     *                      'myProperty2'
     *                  ]   
     *              }
     * 
     *              static get state() {
     *                  return {
     *                      myProperty1: 'whizz',
     *                      myProperty2: 'bang'
     *                  }
     *              }
     * 
     *              static get markup(locals, h) {
     *                  return h('.bar', [
     *                      locals.myProperty1,
     *                      locals.myProperty2
     *                  ]);
     *              }
     *          }
     *      }
     *  }
     * }
     * 
     * // Will render as '<div class="foo"><div class="my-child-component">foo bar</div></div>'
     * 
     * @example <caption>You can also specify property sets as objects, if you need to proxy the value to a different key on the set object.</caption>
     * 
     * Component => class MyComponent extends Component {
     * 
     *  static get state() {
     *      return {
     *          myProperty1: 'foo',
     *          myProperty2: 'bar',
     *          myUnrelatedProperty: 'whoosh'
     *      }
     *  }
     * 
     *  static get propertySets() {
     *      return {
     *          propertiesForChild: {
     *              myProperty1: 'myChildProperty1',
     *              myProperty2: 'myChildProperty2'
     *          }
     *      }
     *  }
     * 
     *  static get markup(locals, h) {
     *      return h('.foo', [
     *          h('my-child-component', {
     *              attributes: locals.propertiesForChild
     *          })
     *      ]);
     *  }
     * 
     *  static get components() {
     *      return {
     *          'my-child-component': Component => class extends Component {
     *              static get inputs() {
     *                  return [
     *                      'myChildProperty1',
     *                      'myChildProperty2'
     *                  ]   
     *              }
     * 
     *              static get state() {
     *                  return {
     *                      myChildProperty1: 'whizz',
     *                      myChildProperty2: 'bang'
     *                  }
     *              }
     * 
     *              static get markup(locals, h) {
     *                  return h('.bar', [
     *                      locals.myChildProperty1,
     *                      locals.myChildProperty2
     *                  ]);
     *              }
     *          }
     *      }
     *  }
     * }
     * 
     * // Will render as '<div class="foo"><div class="my-child-component">foo bar</div></div>'
     * 
     */

    static get propertySets() {
        return {};
    }

    /**
     * Stub property. Typically, components needing non-serializable data in state will declare functions here for transforming specific keys from serialized data to complex data types at runtime.
     * 
     * @type {Object.<string, StateTransform>}
     * 
     * @example
     * class MyThing {
     *  constructor(num) {
     *      this.num = num;
     *  }
     *  repeat3() {
     *      return `${this.num}${this.num}${this.num}`
     *  }
     * }
     * 
     * Component => class MyComponent extends Component {
     * 
     *  static get deserializers() {
     *      return {
     *          myThing: function(key, value) {
     *              return new MyThing(value);
     *          }
     *      }
     *  }
     * 
     *  static get state() {
     *      return {
     *          myThing: 4
     *      }
     *  }
     * 
     *  static get markup(locals, h) {
     *      return h('.foo', [this.myThing.repeat3()]);
     *  }
     * 
     * // Will render as '<div class="foo">444</div>'
     *
     */

    static get deserializers() {
        return {};
    }

    static get hydrators() {
        return this.deserializers;
    }

    /**
     * Stub property. A companion property to deserializers - serialized values will be used when a value set directly to state is a complex data type, and will need to be serialized before committing it to state.
     * 
     * @type {Object.<string, StateTransform>}
     * 
     * @example
     * 
     * class MyThing {
     *  constructor(num) {
     *      this.num = num;
     *  }
     *  repeat3() {
     *      return `${this.num}${this.num}${this.num}`
     *  }
     * }
     * 
     * Component => class MyComponent extends Component {
     * 
     *  static get deserializers() {
     *      return {
     *          myThing: function(key, value) {
     *              return new MyThing(value);
     *          }
     *      }
     *  }
     *  static get serializers() {
     *      return {
     *          myThing: function(key, value) {
     *              return value.num
     *          }
     *      }
     *  }
     * 
     *  static get state() {
     *      return {
     *          myThing: new MyThing(4)
     *      }
     *  }
     * 
     *  static get markup(locals, h) {
     *      return h('.foo', [this.myThing.repeat3()]);
     *  }
     * 
     * // Will render as '<div class="foo">444</div>'. Note that with the serializer defined, the complex
     * // MyThing data type may be set directly to state.
     *
     */

    static get serializers() {
        return {};
    }

    /**
     * Stub property. Watch functions may be defined here, allowing for complex actions to be kicked off when component state changes. Watchers will be executed in state scope. Tip: if your watch function is really only setting other component state keys, you may be able to use a computed state propery instead (see example 3 {@link https://github.com/gryphonmyers/weddell/tree/ft-new-render#componentstate--object here}).
     * 
     * @type {StoreWatchArgs[]}
     * 
     * @example
     * 
     * Component => class MyComponent extends Component {
     * 
     *  static get watchers() {
     *      return [
     *          ['watchedUrl', function (watchedUrl) {
     *              if (watchedUrl) {
     *                  fetch(watchedUrl)
     *                      .then(res => res.json())
     *                      .then(data => this.fetchedData = data)
     *              }
     *          }]
     *      ]
     *  }
     * 
     *  static get state() {
     *      return {
     *          fetchedData: null,
     *          watchedUrl: null
     *      }
     *  }
     * 
     *  static get markup(locals, h) {
     *      return h('.foo', {
     *          attributes: {
     *              onclick: locals.$bind('this.state.watchedUrl = "https://mydataendpoint"')
     *          }
     *      }, locals.fetchedData ? 'Got data!' : 'No data yet.');
     *  }
     * 
     * // Will render as '<div class="foo">No data yet.</div>' initially.
     * // * User click *
     * // After the resource fetches, markup will rerender as 
     * // '<div class="foo">Got data!</div>'
     * 
     * @example <caption>For finer-grained control over when the watcher fires, supply a validator function as well.</caption>
     * 
     * Component => class MyComponent extends Component {
     * 
     *  static get watchers() {
     *      return [
     *          ['watchedUrl', function (watchedUrl) {
     *              fetch(watchedUrl)
     *                 .then(res => res.json())
     *                 .then(data => this.fetchedData = data)
     *          }, (watchedUrl) => watchedUrl && watchedUrl.match(/https:\/\//)]
     *      ]
     *  }
     * 
     *  static get state() {
     *      return {
     *          fetchedData: null,
     *          watchedUrl: null
     *      }
     *  }
     * 
     *  static get markup(locals, h) {
     *      return h('.foo', {
     *          attributes: {
     *              onclick: locals.$bind('this.state.watchedUrl = Math.random() ? "hey mom" : "https://mydataendpoint"')
     *          }
     *      }, locals.fetchedData ? 'Got data!' : 'No data yet.');
     *  }
     * 
     * // Will render as '<div class="foo">No data yet.</div>' initially.
     * // * User click *
     * // Depending on result of die roll, it may or may not fetch data, then render as:
     * // '<div class="foo">Got data!</div>' But the fetch call won't error!
     */

    static get watchers() {
        return [];
    }

    /**
     * Component lifecycle hook method that may be overridden. Called whenever a component instance finishes rendering and mounting into a parent component.
     * 
     * @returns {Promise|void} Returning a promise will defer completion of the mount process.
     */

    onMount() { }

    /**
     * Component lifecycle hook method that may be overridden. Called whenever a component instance finishes rendering and mounting into a parent component, but only the first time it mounts. Subsequent unmounts and mounts will not call this method again. 
     * 
     * @returns {Promise|void} Returning a promise will defer completion of the mount process.
     */

    onFirstMount() { }

    /**
     * Component lifecycle hook method that may be overridden. Called whenever a component instance is unmounted from its parent component. 
     * 
     * @returns {Promise|void} Returning a promise will defer completion of the unmount process.
     */

    onUnmount() { }

    /**
     * Component lifecycle hook method that may be overridden. Called whenever a component instance finishes initializing. 
     * 
     * @returns {Promise|void} Returning a promise will defer completion of the init process.
     */

    onInit() { }

    /**
     * Component lifecycle hook method that may be overridden. Called after the component finishes rendering. 
     * 
     * @returns {Promise|void} Returning a promise will defer completion of the render process (not advised unless you know what you are doing).
     */

    onRender() { }

    /**
     * Component lifecycle hook method that may be overridden. Called the first time the component is ever rendered, but not on subsequent rerenders. 
     * 
     * @returns {Promise|void} Returning a promise will defer rendering (not advised unless you know what you are doing).
     */
    
    onFirstRender() { }

    /**
     * Component lifecycle hook method that may be overridden. Called after the component finishes rendering markup as part of its rendering process. 
     * 
     * @returns {Promise|void} Returning a promise will defer completion of the markup render process, and thus the render process as a whole (not advised unless you know what you are doing).
     */

    onRenderMarkup() { }

    /**
     * Component lifecycle hook method that may be overridden. Called after the component finishes rendering styles as part of its rendering process. 
     * 
     * @returns {Promise|void} Returning a promise will defer completion of the styles render process, and thus the render process as a whole (not advised unless you know what you are doing).
     */

    onRenderStyles() { }

    /**
     * Component lifecycle hook method that may be overridden. Called when a DOM element is created and set to this component's 'el' property.
     * 
     * @param {DomCreateEvtObj} evt
     * 
     * @returns {void} 
     */

    onDOMCreate(evt) { }

    /**
     * Component lifecycle hook method that may be overridden. Called when the DOM element associated with this component moves to a new location in the DOM.
     * 
     * @param {DomChangeEvtObj} evt
     * 
     * @returns {void} 
     */

    onDOMMove(evt) { }

    /**
     * Component lifecycle hook method that may be overridden. Called when the DOM element associated with this component changes.
     * 
     * @param {DomChangeEvtObj} evt
     * 
     * @returns {void} 
     */

    onDOMChange(evt) { }

    /**
     * Component lifecycle hook method that may be overridden. Called either when a new DOM element is created for this component, or when the DOM element associated with it changes.
     * 
     * @param {DomChangeEvtObj} evt
     * 
     * @returns {void} 
     */
    onDOMCreateOrChange(evt) { }

    /**
     * Component lifecycle hook method that may be overridden. Called when a DOM element that was previously associated with this component is destroyed.
     * 
     * @param {DomDestroyEvtObj} evt
     * 
     * @returns {void} 
     */

    onDOMDestroy(evt) { }
    
    /**
     * Binds a function body string to the scope of this component. This string will then typically be used in a native DOM event handler attribute. 
     * 
     * @param {String} funcText 
     * @param {object} opts
     * @param {object} [opts.preventDefault=false] If true, resulting event handler will invoke event.preventDefault before executing function code.
     * @param {object} [opts.stopPropagation=false] If true, resulting event handler will invoke event.stopPropagation before executing function code.
     * 
     * @example <caption>Not a standard use case</caption>
     * 
     * component.el.onclick = component.bindEvent('console.log(this.id)');
     * component.el.click();
     * console.log(component.id)
     * 
     * // myId
     * // myId
     * @example <caption>This function is also proxied onto component state as '$bind'</caption>
     * 
     * class MyComponentClass {
     *  static get markup(locals, h) {
     *      return h('div', {
     *          attributes: {
     *              onclick: locals.$bind('console.log(this.id)')
     *          }
     *      });
     *  }
     * }
     * 
     * //Once a component instance has been mounted, assuming we have an reference to it...
     * 
     * myComponentInstance.el.click();
     * 
     * // myId
     */

    bindEvent(funcText, opts = {}) {
        var consts = this.constructor.Weddell.consts;
        return `${opts.preventDefault ? `event.preventDefault();` : ''}${opts.stopPropagation ? `event.stopPropagation();` : ''}Promise.resolve((window['${consts.VAR_NAME}'] && window['${consts.VAR_NAME}'].app) || new Promise(function(resolve){ window.addEventListener('weddellinitbefore', function(evt) { resolve(evt.detail.app) }) })).then(function(app) { app.awaitComponentMount('${this.id}').then(function(component){ (function() {${funcText}}.bind(component))()})})`;
    }

    /**
     * Syntax sugar method very similar to bindEvent, but slightly less verbose for DOM elements with a value (inputs, etc) that you would like to bind to component state.
     * 
     * @param {String} propName Property name in component state to bind to.
     * @param {object} opts See bindEvent opts.
     * 
     * @example <caption>As with bindEvent, bindEventValue is also proxied into component state object as '$bindValue'.</caption>
     * 
     * class MyComponentClass {
     * 
     *  static get state() {
     *      return {
     *          myInputValue: null
     *      }
     *  }
     * 
     *  static get markup(locals, h) {
     *      return h('input', {
     *          attributes: {
     *              onchange: locals.$bindValue('myInputValue')
     *          }
     *      });
     *  }
     * }
     * 
     * //Once a component instance has been mounted, assuming we have an reference to it...
     * 
     * console.log(myComponentInstance.state.myInputValue);
     * 
     * // null
     * 
     * // The user enters the text 'Tiny Tigers' into the input field in browser...
     * 
     * console.log(myComponentInstance.state.myInputValue);
     * 
     * // Tiny Tigers
     *
     */

    bindEventValue(propName, opts) {
        return this.bindEvent("this.state['" + propName + "'] = event.target.value", opts);
    }
    

    /**
     * Calls the specified callback for this component and all child components.
     * 
     * @todo Document callback param structure 
     * 
     * @param {Function} callback Reducer function to use. 
     * @param {Function} [filterFunc] Filter function to exclude some components
     */

    walkComponents(callback, filterFunc = () => true) {
        if (filterFunc(this)) {
            callback(this)
        }
        for (var componentName in this._componentInstances) {
            Object.values(this._componentInstances[componentName])
                .forEach(instance => instance.walkComponents(callback, filterFunc))
        }
    }

    /**
     * Calls the specified reducer for this component and all child components.
     * 
     * @todo Document callback param structure 
     * 
     * @param {Function} callback Reducer function to use. 
     * @param {*} initialVal The initial value to use for the reduce function.
     * @param {Function} [filterFunc] Filter function to exclude some components
     * @returns {*}
     */

    reduceComponents(callback, initialVal, filterFunc = () => true, depth = 0) {
        var acc = initialVal;
        if (filterFunc(this)) {
            acc = callback(acc, this, depth)
        }
        for (var componentName in this._componentInstances) {
            acc = Object.values(this._componentInstances[componentName])
                .reduce((acc, instance) => instance.reduceComponents(callback, acc, filterFunc, depth + 1), acc);
        }
        return acc;
    }    

    /**
     * Calls the specified reducer recursively for all parent components upward from this one.
     * 
     * @param {Function} callback Reducer function to use. 
     * @param {*} initialVal The initial value to use for the reduce function.
     * 
     * @returns {*}
     */

    reduceParents(callback, initialVal) {
        var parent = this.getParent();
        var shouldRecurse = true;
        initialVal = callback.call(this, initialVal, this, () => shouldRecurse = false);
        return parent && shouldRecurse ? parent.reduceParents(callback, initialVal) : initialVal;
    }

    /**
     * Performs a recursive scan upward from this component, to the application's root component.
     * 
     * @todo Document this more thoroughly
     * 
     * @returns {object}
     */

    collectComponentTree() {
        var parent = this.getParent();
        return Object.entries(this.components)
            .reduce((acc, entry) => {
                return Object.assign(acc, {
                    [entry[0].toLowerCase()]: {
                        sourceInstance: this,
                        componentClass: entry[1]
                    }
                })
            }, parent ? parent.collectComponentTree() : {});
    }

    /**
     * Queries the component tree for components that are currently mounted (rendered and typically in DOM or soon-to-be in DOM).
     * 
     * @returns {WeddellComponent[]}
     */

    getMountedChildComponents() {
        return this.reduceComponents((acc, component) =>
            acc.concat(component), [], component =>
                component !== this && component._isMounted);
    }

    /**
     * Returns a promise that will resolve with the result of querying this component's DOM element using querySelector, once the component has a DOM element to query. 
     * 
     * @param {string} query A DOM query, as expected by Element#querySelector.
     * 
     * @returns {Promise.<Element|null>}
     */

    queryDOM(query) {
        return this.awaitDom()
            .then(el => el.querySelector(query));
    }

    /**
     * Returns a promise that will resolve with the result of querying this component's DOM element using querySelectorAll, once the component has a DOM element to query. 
     * 
     * @param {string} query A DOM query, as expected by Element#querySelectorAll.
     * 
     * @returns {Promise.<NodeListOf<Element>>}
     */

    queryDOMAll(query) {
        return this.awaitDom()
            .then(el => el.querySelectorAll(query));
    }

    /**
     * Returns a promise that will resolve once this component fires a specific event. 
     * 
     * @param {string} eventName The name of the event to wait for. 
     * 
     * @returns {Promise}
     */

    awaitEvent(eventName) {
        var resolveProm;
        //@TODO add evt obj filter
        var promise = new Promise(function (resolve) {
            resolveProm = resolve;
        });
        this.once(eventName, function (evt) {
            resolveProm(evt);
        });
        return promise;
    }

    /**
     * Returns a promise that will resolve once this component has finished rendering, and the next application patch has completed (which should mean all state changes have been propagated to the DOM).
     * 
     * @returns {Promise}
     */

    awaitPatch() {
        return this.awaitRender().then(() => (this.root || this).awaitEvent('patch'));
    }

    /**
     * Returns a promise that will resolve once this component mounts (or immediately, if it is already mounted). Note that mounting does not necessarily mean that application changes have been propagated to the DOM.
     * 
     * @returns {Promise}
     */

    awaitMount() {
        return this.isMounted ? Promise.resolve() : this.awaitEvent('mount');
    }

    /**
     * Returns a promise that will resolve once a DOM element has been created for this component (or immediately, if it already has one). The promise is resolved with this component's DOM element.
     * 
     * @returns {Promise.<Element>}
     */

    awaitDom() {
        return this.el ? Promise.resolve(this.el) : this.awaitEvent('domcreate').then(evt => evt.el);
    }

    /**
     * Returns a promise that will resolve once the pending render promise has completed (or immediately, if there is no pending render promise).
     * 
     * @returns {Promise}
     */

    awaitRender(val) {
        return (this.renderPromise ? this.renderPromise : Promise.resolve())
            .then(() => val);
    }

    /**
     * @example
     * console.log(MyWeddellComponentClass.isWeddellComponent)
     * // true
     */

    static get isWeddellComponent() {
        return true;
    }

    /**
     * @private
     */

    makeNewWidget() {
        this._prevWidget = this._widget;
        var newWidget = new VdomWidget({ component: this });
        newWidget.bindChildren(this);
        if (this._prevWidget) {
            this._prevWidget.unbindChildren();
        }
        this._widgetIsDirty = false;
        return this._widget = newWidget;
    }    

    /**
     * @private
     */

    static get tagDirectives() {
        return {
            content: function (vNode, children, props, renderedComponents) {
                return this.content;
            }
        }
    }

    /**
     * @private
     */

    replaceComponentPlaceholders(vNode, renderedComponents = []) {
        var components;
        var componentName;

        if (Array.isArray(vNode)) {
            return Promise.all(vNode.map(child => this.replaceComponentPlaceholders(child, renderedComponents)))
        } else if (!vNode.tagName) {
            return vNode;
        } else if ((componentName = vNode.tagName.toLowerCase()) in this.constructor.tagDirectives) {
            return Promise.resolve(this.constructor.tagDirectives[componentName].call(this, vNode, vNode.children || [], vNode.properties.attributes, renderedComponents));
        }

        return this.replaceComponentPlaceholders(vNode.children || [], renderedComponents)
            .then(children => {
                if (componentName in (components = this.collectComponentTree())) {
                    var props = vNode.properties.attributes;
                    var content = children || [];
                    if (!(componentName in renderedComponents)) {
                        renderedComponents[componentName] = [];
                    }
                    var index = (vNode.properties.attributes && vNode.properties.attributes[this.constructor.Weddell.consts.INDEX_ATTR_NAME]) || renderedComponents[componentName].length;

                    return this.makeChildComponentWidget(componentName, index, content, props, renderedComponents);
                }

                if (children.some((child, ii) => vNode.children[ii] !== child)) {
                    return cloneVNode(vNode, flatten(children));
                }
                return cloneVNode(vNode, null, true);
            })
    }

    /**
     * @private
     * @param {*} results 
     */

    requestPatch(results) {
        this.trigger('requestpatch', { results: results ? Object.create(results) : {}, id: this.id, classId: this.constructor.id });
    }

    /**
     * @private
     */

    makeVNodeTemplate() {
        /*
        * Take instance and static template inputs, return a function that will generate the correct output.
        */

        return [...arguments].reduce((acc, curr) => {
            if (!acc) {
                if (typeof curr === 'function') {
                    return this.wrapTemplate(curr, 'renderVNode', h);
                }
                if (typeof curr === 'string') {
                    //TODO support template string parser;
                }
            }
            return acc;
        }, null);
    }

    /**
     * @private
     */

    makeStylesTemplate() {
        var [instanceStyleBlocks, classStyleBlocks] = [...arguments]
            .reduce((acc, curr) =>
                typeof curr === 'function' ? [[...acc[0], curr], acc[1]] : [acc[0], [...acc[1], curr]], [[], []]);

        return this.wrapTemplate((locals) => {
            var instanceStyles = instanceStyleBlocks.map(styleBlock => styleBlock.call(this, locals));
            return Object.defineProperties({}, {
                dynamicStyles: {
                    get: () => instanceStyles
                },
                staticStyles: {
                    get: () => classStyleBlocks
                }
            })
        }, 'renderStyles');
    }

    /**
     * @private
     * @param {*} func 
     * @param {*} renderMethodName 
     */

    wrapTemplate(func, renderMethodName) {
        return () => {
            var accessed = {};

            this.state.on('get', evt => {
                accessed[evt.key] = 1;
            });

            var result = func.apply(this, [this.state].concat(Array.from(arguments).slice(2)));

            this._lastRenderTimeStamps[renderMethodName] = Date.now();
            this._renderCache[renderMethodName] = result;
            this._lastAccessedStateKeys[renderMethodName] = accessed;

            return result;
        }
    }

    /**
     * @private
     */

    renderStyles() {
        return Promise.resolve(this.stylesTemplate())
            .then(results => {
                return Promise.resolve(this.onRenderStyles())
                    .then(() => results);
            })
    }

    /**
     * @private
     */

    renderVNode() {
        var vTree = this.vNodeTemplate();

        if (Array.isArray(vTree)) {
            if (vTree.length > 1) {
                console.warn('Template output was truncated in', this.constructor.name, 'component. Component templates must return a single vNode!');
            }
            vTree = vTree[0];
        }

        var renderedComponents = [];

        return (vTree ? this.replaceComponentPlaceholders(vTree, renderedComponents)
            .then(vTree => {
                this._prevVTree = this._vTree;
                this._vTree = vTree;

                return Promise.all(renderedComponents)
                    .then(rendered => {
                        return Promise.all(difference(this._lastRenderedComponents || [], rendered).map(toUnmount => toUnmount.unmount()))
                            .then(() => {
                                this._lastRenderedComponents = rendered
                            })
                    })
                    .then(() => true)
            }) : this._vTree ? Promise.all((this._lastRenderedComponents || []).map(toUnmount => toUnmount.unmount()))
                .then(() => {
                    this._prevVTree = this._vTree;
                    this._lastRenderedComponents = null;
                    this.markWidgetDirty()
                    this._vTree = null;

                    return true;
                }) : Promise.resolve(false)
        )
            .then(didRender => {
                if (didRender) {
                    var evt = { components: renderedComponents };
                    this._childComponents = renderedComponents;
                    this.markWidgetDirty()
                    this.trigger('rendermarkup', evt);
                    this.onRenderMarkup(Object.assign({}, evt));
                }
            })
            .then(() => this._vTree)
    }

    /**
     * @private
     */

    refreshWidgets() {
        if (this._widgetIsDirty) {
            this.makeNewWidget();
        }
    }

    /**
     * @private
     */

    checkChangedKey(key) {
        return Object.entries(this._lastAccessedStateKeys)
            .reduce((acc, entry) => key in entry[1] ? Object.assign(acc || {}, { [entry[0]]: 1 }) : acc, null);
    }

    /**
     * @private
     */

    static get generatedComponentClasses() {
        return _generatedComponentClasses;
    }

    /**
     * @private
     */

    makeChildComponentWidget(componentName, index, content, props, renderedComponents = []) {
        var parent = this.reduceParents((acc, component) => {
            return acc || (componentName in component.components ? component : acc);
        }, null);

        if (!parent) {
            throw new Error('Unrecognized component name:', componentName);
        }

        var prom = parent.getInitComponentInstance(componentName, index);
        if (!(componentName in renderedComponents)) {
            renderedComponents[componentName] = [];
        }
        renderedComponents[componentName].push(prom);
        renderedComponents.push(prom);
        return prom
            .then(component => {
                renderedComponents[componentName].splice(renderedComponents[componentName].indexOf(prom), 1, component);
                renderedComponents.splice(renderedComponents.indexOf(prom), 1, component);
                component.assignProps(props, this);
                var contentComponents = [];

                return component.replaceComponentPlaceholders(content, contentComponents)
                    .then(innerContent => {                        
                        component.content = innerContent;

                        if ((contentComponents.length !== component._contentComponents.length) || contentComponents.some((subComponent, ii) => component._contentComponents[ii] !== subComponent)) {
                            component.trigger('contentcomponentschange', { currentComponents: contentComponents, previousComponents: component._contentComponents })
                        }
                        component._contentComponents = contentComponents;

                        for (var propName in contentComponents) {
                            var contentComponent = contentComponents[propName];
                            if (!(propName in renderedComponents)) {
                                renderedComponents[propName] = [];
                            }
                            if (Array.isArray(contentComponents[propName])) {
                                renderedComponents[propName] = uniq(renderedComponents[propName].concat(contentComponents[propName]));
                            } else {
                                if (renderedComponents.indexOf(contentComponent) === -1) {
                                    renderedComponents.push(contentComponent);
                                }
                            }
                        }

                        return component.mount(this)
                            .then(didMount => {
                                parent.trigger('componentplaceholderreplaced', { component });
                                return component.makeNewWidget();
                            })
                    })
            });
    }

    /**
     * @private
     */

    requestRender(dirtyRenderers) {
        var now = Date.now()
        var lastRenderTime = Object.values(this._lastRenderTimeStamps).reduce((acc, val) => isNaN(val) ? acc : Math.max(val, acc), 0)
        var dt = now - lastRenderTime;
        if (!this.hasRendered || dt >= renderInterval) {
            return this.render(dirtyRenderers);
        } else {
            return (this._renderPromise = new Promise(resolve => setTimeout(resolve, renderInterval - dt))
                .then(() => this.render(dirtyRenderers)));
        }
    }

    /**
     * @private
     */

    markDirty(dirtyRenderers = {}) {
        if (this.renderPromise || !this.isMounted) {
            this._dirtyRenderers = Object.assign(this._dirtyRenderers || {}, dirtyRenderers)
            return this.renderPromise;
        } else {
            return this.requestRender(dirtyRenderers);
        }
    }

    /**
     * @private
     */

    render(dirtyRenderers = null) {
        var promise = Promise.resolve()
            .then(() => {
                return this.constructor.renderMethods
                    .reduce((acc, method) => {
                        return acc
                            .then(results => {
                                return Promise.resolve(this[method]())
                                    .then(result => {
                                        Object.defineProperty(results, method, { get: () => result, enumerable: true });
                                        return results;
                                    })
                            })
                    }, Promise.resolve({}))
                    .then(results => {
                        return Promise.resolve(results)
                            .then(results => {
                                if (this._dirtyRenderers) {
                                    var dirtyRenderers = this._dirtyRenderers;
                                    this._dirtyRenderers = null;
                                    return Promise.reject(dirtyRenderers);
                                }
                                return results;
                            })
                            .then(results => {
                                this._renderPromise = null;
                                this.requestPatch(results);
                                return results;
                            }, dirtyRenderers => this.render(dirtyRenderers))
                    }, err => {
                        throw err;
                    })
                    .then(results => {
                        if (!this.hasRendered) {
                            this._hasRendered = true;
                            this.trigger('firstrender');
                            this.trigger('render');
                            return Promise.all([this.onRender(), this.onFirstRender()])
                                .then(() => results)
                        }
                        this.trigger('render');
                        return Promise.resolve(this.onRender()).then(() => results);
                    })
            })
        return !this._renderPromise ? (this._renderPromise = promise) : promise;
    }

    /**
     * @private
     */

    static set generatedComponentClasses(val) {
        return _generatedComponentClasses = val;
    }

    /**
     * @private
     */

    static async makeComponentClass(ComponentClass) {
        await ComponentClass;
        if (typeof ComponentClass === 'function' && !ComponentClass.isWeddellComponent) {
            //@TODO this is unreliable
            // We got a non-Component class function, so we assume it is a component factory function
            var str = ComponentClass.toString();
            if (str in this.generatedComponentClasses) {
                return this.generatedComponentClasses[str];
            } else {
                var result = await ComponentClass.call(this, this.Weddell.classes.Component);
                return this.generatedComponentClasses[str] = this.bootstrapComponentClass(result);
            }
        } else {
            return this.bootstrapComponentClass(ComponentClass);
        }
    }

    /**
     * @private
     */

    static bootstrapComponentClass(ComponentClass) {
        var WeddellComponent = this.Weddell.classes.Component;
        if (ComponentClass.prototype && (ComponentClass.prototype instanceof WeddellComponent || ComponentClass.prototype.constructor === WeddellComponent)) {
            if (!ComponentClass.id) {
                var id = generateHash();
                var BaseClass = ComponentClass;
                ComponentClass = class Component extends BaseClass {
                    static get id() {
                        return id;
                    }

                    static get BaseClass() {
                        return BaseClass;
                    }
                }
            }
            return ComponentClass;
        } else {
            //@TODO We may want to support plain objects here as well. Only problem is then we don't get the clean method inheritance and would have to additionally support passing method functions along as options, which is a bit messier.
            throw "Unsupported component input";
        }
    }

    /**
     * @private
     */

    async createChildComponentClass(componentName, ChildComponent) {
        if (Array.isArray(ChildComponent)) {
            var initOpts = ChildComponent[2];
            var inputMappings = ChildComponent[1];
            ChildComponent = ChildComponent[0];
        }
        ChildComponent = await this.constructor.makeComponentClass(ChildComponent);

        var parentComponent = this;
        var root = this.root;

        var obj = {};

        obj[componentName] = class extends ChildComponent {
            constructor(opts) {
                super(defaults({
                    root,
                    parentComponent,
                }, opts))

                parentComponent.trigger('createcomponent', { component: this, parentComponent, componentName });

                this.on('createcomponent', evt => {
                    parentComponent.trigger('createcomponent', Object.assign({}, evt));
                });
            }
        }

        this.trigger('createcomponentclass', { ComponentClass: obj[componentName] });

        Object.defineProperties(obj[componentName], {
            _initOpts: { value: initOpts },
            _inputMappings: { value: inputMappings }
        })

        return obj[componentName];
    }

    /**
     * @private
     */

    assignProps(props, parentScope) {
        if (props) {
            this.inputs.filter(input => !(input in props || input.key in props))
                .forEach(input => {
                    this.props[input.key || input] = null;
                });

            var parsedProps = Object.entries(props)
                .reduce((acc, entry) => {
                    if (this.inputs.some(input => input === entry[0] || input.key === entry[0])) {
                        acc[0][entry[0]] = entry[1];
                    } else if (entry[0].slice(0, 2) === 'on' && !(entry[0] in testElement)) {
                        //TODO support more spec-compliant data- attrs
                        acc[1][entry[0]] = entry[1];
                    } else {
                        acc[2][entry[0]] = entry[1];
                    }
                    return acc;
                }, [{}, {}, {}]);//first item props, second item event handlers, third item attributes

            Object.assign(this.props, parsedProps[0]);
            this.bindInlineEventHandlers(parsedProps[1], parentScope);
            this.state.$attributes = Object.entries(parsedProps[2])
                .filter(entry => typeof entry[1] === 'string')
                .reduce((acc, curr) => Object.assign(acc, { [curr[0]]: curr[1] }), {});
        }
    }

    /**
     * @private
     */

    bindInlineEventHandlers(handlersObj, scope) {
        var results = Object.entries(this._inlineEventHandlers)
            .reduce((acc, currHandlerEntry) => {
                if (currHandlerEntry[0] in acc[1]) {
                    if (currHandlerEntry[1].handlerString !== handlersObj[currHandlerEntry[0]]) {
                        //there is a new handler for this event, and it does not match existing handler. replace
                        acc[0].push(currHandlerEntry);
                    } else {
                        //there is a new handler for this event and it does match existing handler. Do nothing
                        delete acc[1][currHandlerEntry[0]];
                    }
                }
                return acc;
            }, [[], Object.assign({}, handlersObj)]); //arr[0] handlers to remove, arr[1] events to add

        var handlerEntriesToRemove = results[0];
        var handlersToAdd = results[1];

        handlerEntriesToRemove.forEach(handlerEntry => {
            handlerEntry[1].off()
            delete this._inlineEventHandlers[handlerEntry[0]];
        });

        for (var eventName in handlersToAdd) {
            var handlerString = handlersToAdd[eventName];
            this._inlineEventHandlers[eventName] = { handlerString };
            try {
                var callback = new Function('component', 'event', handlerString).bind(scope, this)
            } catch (err) {
                throw "Failed parsing event handler for component: " + err.stack;
            }
            this._inlineEventHandlers[eventName].off = this.on(eventName.slice(2), callback);
        }
    }

    /**
     * @private
     */

    init(opts) {
        opts = defaults(opts, this.defaultInitOpts);
        if (!this._isInit) {
            this._isInit = true;

            ['props', 'state'].forEach((propName) => {
                this[propName].on('change', evt => {
                    // if (evt.target === this[propName]) {
                    var dirtyRenderers = this.checkChangedKey(evt.changedKey);
                    if (dirtyRenderers) {
                        this.markDirty(dirtyRenderers);
                    }
                    // }
                })
            });

            this.constructor.watchers
                .forEach(entry => this.state.watch(...entry))

            return Promise.resolve(this.onInit(opts))
                .then(() => {
                    this.trigger('init');
                    return this;
                });
        }
        return Promise.resolve(this);
    }

    /**
     * @private
     */

    addComponentEvents(componentName, childComponent, index) {
        var componentKeyIndex;
        if (this.constructor.componentEventListeners && (componentKeyIndex = Object.keys(this.constructor.componentEventListeners).map(key => key.toLowerCase()).indexOf(componentName)) > -1) {
            if (!(componentName in this._componentListenerCallbacks)) {
                this._componentListenerCallbacks[componentName] = {}
            }
            this._componentListenerCallbacks[componentName][index] = Object.entries(this.constructor.componentEventListeners[Object.keys(this.constructor.componentEventListeners)[componentKeyIndex]])
                .map(entry => {
                    return childComponent.on(entry[0], function () {
                        if (childComponent.isMounted) {
                            entry[1].apply(this, Array.from(arguments).concat(childComponent));
                        }
                    }.bind(this))
                })
        }
    }

    /**
     * @private
     */

    unmount() {
        if (this._isMounted === true) {
            for (var eventName in this._inlineEventHandlers) {
                this._inlineEventHandlers[eventName].off();
                delete this._inlineEventHandlers[eventName];
            }
            this._isMounted = false;

            return Promise.resolve(this.onUnmount())
                .then(() => {
                    return Promise.all((this._lastRenderedComponents || []).map(component => component.unmount()))
                })
                .then(() => {
                    this.markWidgetDirty()
                    return true;
                });
        }
        return Promise.resolve(false);
    }

    /**
     * @private
     */

    mount(domParent) {
        if (!this._isMounted) {
            return this._isMounted = this.render()
                .then(() => {
                    this._isMounted = true;
                    var hadMounted = this.hasMounted;
                    if (!this.hasMounted) {
                        this._hasMounted = true;
                        this.trigger('firstmount');
                    }
                    this.trigger('mount');

                    return hadMounted ? this.onMount() : Promise.all([this.onMount(), this.onFirstMount()])
                })
                .then(() => {
                    this.markWidgetDirty()
                    return true;
                });
        }
        return Promise.resolve(false);
    }

    /**
     * @private
     */

    markWidgetDirty() {
        this._widgetIsDirty = true;

        this.trigger('widgetdirty');
    }

    /**
     * @private
     */

    extractSnapshotOpts(snapshot) {
        if (!snapshot || !snapshot.id) {
            throw new Error(`Malformed snapshot: id is missing`)
        }

        return ['state', 'componentSnapshots', 'el']
            .reduce((acc, curr) =>
                snapshot[curr] ? Object.assign(acc, { [curr === 'state' ? 'initialState' : curr]: snapshot[curr] }) : acc, { id: snapshot.id });

    }

    /**
     * @private
     */

    async makeComponentInstance(componentName, index, componentOpts = {}) {
        componentName = componentName.toLowerCase();

        if (!componentName in this.components) {
            throw new Error(`${componentName} is not a recognized component name for component type ${this.constructor.name}`);
        }

        if (this.components[componentName].weddellClassInput) {
            this.components[componentName] = this.createChildComponentClass(componentName, this.components[componentName].weddellClassInput);
        }
        var ComponentClass = await this.components[componentName];

        var opts = defaults({
            consts: defaults({
                $componentID: ComponentClass._id,
                $instanceKey: index
            }),
            store: {}
        }, componentOpts);

        var snapshot;

        if (this._componentSnapshots && this._componentSnapshots[componentName] && (snapshot = this._componentSnapshots[componentName][index])) {
            Object.assign(opts, this.extractSnapshotOpts(snapshot));
        }

        var instance = new ComponentClass(opts);
        this.addComponentEvents(componentName, instance, index);

        instance.on('requestpatch', evt => {
            this._componentsRequestingPatch.push(instance);
            this.trigger('requestpatch', Object.assign({}, evt));
        });

        return instance;
    }

    /**
     * @private
     */

    getComponentInstance(componentName, index) {
        componentName = componentName.toLowerCase()
        var instances = this._componentInstances[componentName];
        return instances[index];
    }

    /**
     * @private
     */

    async getInitComponentInstance(componentName, index) {
        componentName = componentName.toLowerCase()
        var instance = this.getComponentInstance(componentName, index);
        if (!instance) {
            var instance = this._componentInstances[componentName][index] = await this.makeComponentInstance(componentName, index);
            return instance
                .init(this.components[componentName]._initOpts);
        }

        return instance
    }

    /**
     * @private
     */

    static get renderMethods() {
        return ['renderVNode', 'renderStyles'];
    }

    /**
     * @private
     */

    cleanupComponentInstances() {
        //TODO right now, if a component becomes unused, it will continue to sit in memory and possibly generate events. We should probably clean them up.
    }
}

module.exports = WeddellComponent;
