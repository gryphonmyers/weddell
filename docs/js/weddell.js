(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Weddell = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * array-each <https://github.com/jonschlinkert/array-each>
 *
 * Copyright (c) 2015, 2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

/**
 * Loop over each item in an array and call the given function on every element.
 *
 * ```js
 * each(['a', 'b', 'c'], function(ele) {
 *   return ele + ele;
 * });
 * //=> ['aa', 'bb', 'cc']
 *
 * each(['a', 'b', 'c'], function(ele, i) {
 *   return i + ele;
 * });
 * //=> ['0a', '1b', '2c']
 * ```
 *
 * @name each
 * @alias forEach
 * @param {Array} `array`
 * @param {Function} `fn`
 * @param {Object} `thisArg` (optional) pass a `thisArg` to be used as the context in which to call the function.
 * @return {undefined}
 * @api public
 */

module.exports = function each(arr, cb, thisArg) {
  if (arr == null) return;

  var len = arr.length;
  var idx = -1;

  while (++idx < len) {
    var ele = arr[idx];
    if (cb.call(thisArg, ele, idx, arr) === false) {
      break;
    }
  }
};

},{}],2:[function(require,module,exports){
/*!
 * array-slice <https://github.com/jonschlinkert/array-slice>
 *
 * Copyright (c) 2014-2015, 2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

module.exports = function slice(arr, start, end) {
  var len = arr.length;
  var range = [];

  start = idx(arr, start);
  end = idx(arr, end, len);

  while (start < end) {
    range.push(arr[start++]);
  }
  return range;
};

function idx(arr, pos, end) {
  var len = arr.length;

  if (pos == null) {
    pos = end || 0;
  } else if (pos < 0) {
    pos = Math.max(len + pos, 0);
  } else {
    pos = Math.min(pos, len);
  }

  return pos;
}

},{}],3:[function(require,module,exports){
/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing. The function also has a property 'clear' 
 * that is a function which will clear the timer to prevent previously scheduled executions. 
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */

module.exports = function debounce(func, wait, immediate){
  var timeout, args, context, timestamp, result;
  if (null == wait) wait = 100;

  function later() {
    var last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        context = args = null;
      }
    }
  };

  var debounced = function(){
    context = this;
    args = arguments;
    timestamp = Date.now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };

  debounced.clear = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
};

},{}],4:[function(require,module,exports){
var pSlice = Array.prototype.slice;
var objectKeys = require('./lib/keys.js');
var isArguments = require('./lib/is_arguments.js');

var deepEqual = module.exports = function (actual, expected, opts) {
  if (!opts) opts = {};
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, opts);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer (x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') return false;
  return true;
}

function objEquiv(a, b, opts) {
  var i, key;
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b, opts);
  }
  if (isBuffer(a)) {
    if (!isBuffer(b)) {
      return false;
    }
    if (a.length !== b.length) return false;
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b);
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) return false;
  }
  return typeof a === typeof b;
}

},{"./lib/is_arguments.js":5,"./lib/keys.js":6}],5:[function(require,module,exports){
var supportsArgumentsClass = (function(){
  return Object.prototype.toString.call(arguments)
})() == '[object Arguments]';

exports = module.exports = supportsArgumentsClass ? supported : unsupported;

exports.supported = supported;
function supported(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
};

exports.unsupported = unsupported;
function unsupported(object){
  return object &&
    typeof object == 'object' &&
    typeof object.length == 'number' &&
    Object.prototype.hasOwnProperty.call(object, 'callee') &&
    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
    false;
};

},{}],6:[function(require,module,exports){
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}

},{}],7:[function(require,module,exports){
(function (document, promise) {
  if (typeof module !== 'undefined') module.exports = promise
  else document.ready = promise
})(window.document, function (chainVal) {
  'use strict'

  var d = document,
      w = window,
      loaded = /^loaded|^i|^c/.test(d.readyState),
      DOMContentLoaded = 'DOMContentLoaded',
      load = 'load'

  return new Promise(function (resolve) {
    if (loaded) return resolve(chainVal)

    function onReady () {
      resolve(chainVal)
      d.removeEventListener(DOMContentLoaded, onReady)
      w.removeEventListener(load, onReady)
    }

    d.addEventListener(DOMContentLoaded, onReady)
    w.addEventListener(load, onReady)
  })
})

},{}],8:[function(require,module,exports){
/*!
 * for-in <https://github.com/jonschlinkert/for-in>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

module.exports = function forIn(obj, fn, thisArg) {
  for (var key in obj) {
    if (fn.call(thisArg, obj[key], key, obj) === false) {
      break;
    }
  }
};

},{}],9:[function(require,module,exports){
/*!
 * for-own <https://github.com/jonschlinkert/for-own>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var forIn = require('for-in');
var hasOwn = Object.prototype.hasOwnProperty;

module.exports = function forOwn(obj, fn, thisArg) {
  forIn(obj, function(val, key) {
    if (hasOwn.call(obj, key)) {
      return fn.call(thisArg, obj[key], key, obj);
    }
  });
};

},{"for-in":8}],10:[function(require,module,exports){
/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

module.exports = function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
};

},{}],11:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.mixwith = mod.exports;
  }
})(undefined, function (exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var _appliedMixin = '__mixwith_appliedMixin';

  var apply = exports.apply = function (superclass, mixin) {
    var application = mixin(superclass);
    application.prototype[_appliedMixin] = unwrap(mixin);
    return application;
  };

  var isApplicationOf = exports.isApplicationOf = function (proto, mixin) {
    return proto.hasOwnProperty(_appliedMixin) && proto[_appliedMixin] === unwrap(mixin);
  };

  var hasMixin = exports.hasMixin = function (o, mixin) {
    while (o != null) {
      if (isApplicationOf(o, mixin)) return true;
      o = Object.getPrototypeOf(o);
    }
    return false;
  };

  var _wrappedMixin = '__mixwith_wrappedMixin';

  var wrap = exports.wrap = function (mixin, wrapper) {
    Object.setPrototypeOf(wrapper, mixin);
    if (!mixin[_wrappedMixin]) {
      mixin[_wrappedMixin] = mixin;
    }
    return wrapper;
  };

  var unwrap = exports.unwrap = function (wrapper) {
    return wrapper[_wrappedMixin] || wrapper;
  };

  var _cachedApplications = '__mixwith_cachedApplications';

  var Cached = exports.Cached = function (mixin) {
    return wrap(mixin, function (superclass) {
      // Get or create a symbol used to look up a previous application of mixin
      // to the class. This symbol is unique per mixin definition, so a class will have N
      // applicationRefs if it has had N mixins applied to it. A mixin will have
      // exactly one _cachedApplicationRef used to store its applications.

      var cachedApplications = superclass[_cachedApplications];
      if (!cachedApplications) {
        cachedApplications = superclass[_cachedApplications] = new Map();
      }

      var application = cachedApplications.get(mixin);
      if (!application) {
        application = mixin(superclass);
        cachedApplications.set(mixin, application);
      }

      return application;
    });
  };

  var DeDupe = exports.DeDupe = function (mixin) {
    return wrap(mixin, function (superclass) {
      return hasMixin(superclass.prototype, mixin) ? superclass : mixin(superclass);
    });
  };

  var HasInstance = exports.HasInstance = function (mixin) {
    if (Symbol && Symbol.hasInstance && !mixin[Symbol.hasInstance]) {
      Object.defineProperty(mixin, Symbol.hasInstance, {
        value: function value(o) {
          return hasMixin(o, mixin);
        }
      });
    }
    return mixin;
  };

  var BareMixin = exports.BareMixin = function (mixin) {
    return wrap(mixin, function (s) {
      return apply(s, mixin);
    });
  };

  var Mixin = exports.Mixin = function (mixin) {
    return DeDupe(Cached(BareMixin(mixin)));
  };

  var mix = exports.mix = function (superclass) {
    return new MixinBuilder(superclass);
  };

  var MixinBuilder = function () {
    function MixinBuilder(superclass) {
      _classCallCheck(this, MixinBuilder);

      this.superclass = superclass || function () {
        function _class() {
          _classCallCheck(this, _class);
        }

        return _class;
      }();
    }

    _createClass(MixinBuilder, [{
      key: 'with',
      value: function _with() {
        for (var _len = arguments.length, mixins = Array(_len), _key = 0; _key < _len; _key++) {
          mixins[_key] = arguments[_key];
        }

        return mixins.reduce(function (c, m) {
          return m(c);
        }, this.superclass);
      }
    }]);

    return MixinBuilder;
  }();
});

},{}],12:[function(require,module,exports){
'use strict';

var slice = require('array-slice');

var defaults = require('./mutable');

/**
 * Extends an empty object with properties of one or
 * more additional `objects`
 *
 * @name .defaults.immutable
 * @param  {Object} `objects`
 * @return {Object}
 * @api public
 */

module.exports = function immutableDefaults() {
  var args = slice(arguments);
  return defaults.apply(null, [{}].concat(args));
};

},{"./mutable":13,"array-slice":2}],13:[function(require,module,exports){
'use strict';

var each = require('array-each');
var slice = require('array-slice');
var forOwn = require('for-own');
var isObject = require('isobject');

/**
 * Extends the `target` object with properties of one or
 * more additional `objects`
 *
 * @name .defaults
 * @param  {Object} `target` The target object. Pass an empty object to shallow clone.
 * @param  {Object} `objects`
 * @return {Object}
 * @api public
 */

module.exports = function defaults(target, objects) {
  if (target == null) {
    return {};
  }

  each(slice(arguments, 1), function(obj) {
    if (isObject(obj)) {
      forOwn(obj, function(val, key) {
        if (target[key] == null) {
          target[key] = val;
        }
      });
    }
  });

  return target;
};

},{"array-each":1,"array-slice":2,"for-own":9,"isobject":10}],14:[function(require,module,exports){
var mix = require('mixwith-es5').mix;
var EventEmitterMixin = require('./event-emitter-mixin');
var hasMixin = require('mixwith-es5').hasMixin;

var ActionDispatcher = class extends mix(ActionDispatcher).with(EventEmitterMixin) {
    constructor(opts) {
        super(opts);
        this._dispatchees = [];
    }

    addDispatchee(dispatchee) {
        if (!hasMixin(dispatchee, EventEmitterMixin)) {
            console.warn("Attempted to add a non-event emitter object as a dispatchee to the action dispatcher.");
        }
        if (this._dispatchees.indexOf(dispatchee) === -1) {
            this._dispatchees.push(dispatchee);
            return this.trigger('adddispatchee', {dispatchee});
        }
        return false;
    }

    dispatch(actionName, actionData) {
        var result = this._dispatchees.map(dispatchee =>
            dispatchee.trigger(actionName, Object.assign({}, actionData)));
        this.trigger('dispatch', {actionName, actionData});
        return result;
    }
};

module.exports = ActionDispatcher;

},{"./event-emitter-mixin":17,"mixwith-es5":11}],15:[function(require,module,exports){
var DOMReady = require('document-ready-promise')();
var defaults = require('object.defaults/immutable');
var mix = require('mixwith-es5').mix;
var debounce = require('debounce');
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
    stylesTransforms: []
};

var App = class extends mix(App).with(EventEmitterMixin) {
    constructor(opts) {
        opts = defaults(opts, defaultOpts);
        super(opts);
        this.el = opts.el;
        this.styleEl = opts.styleEl;
        this.componentInitOpts = Array.isArray(opts.Component) ? opts.Component[1] : {};
        this.Component = this.makeComponentClass(Array.isArray(opts.Component) ? opts.Component[0] : opts.Component);
        this.component = null;
        this.renderInterval = opts.renderInterval;
        this.stylesRenderFormat = opts.stylesRenderFormat;
        this.markupRenderFormat = opts.markupRenderFormat;
        this.markupTransforms = opts.markupTransforms;
        this.stylesTransforms = opts.stylesTransforms;
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
        this.styleEl.textContent = CSSString;
    }

    renderMarkup(evt) {
        if (!(evt.renderFormat in this.renderers)) {
            throw "No appropriate markup renderer found for format: " + evt.renderFormat;
        }
        this.renderers[evt.renderFormat].call(this, evt.output);
        this._actionDispatcher.dispatch('renderdommarkup', Object.assign({}, evt));
    }

    renderStyles(evt) {
        var flattenStyles = function(obj) {
            return (obj.output ? obj.output : '') + (obj.components ? obj.components.map(flattenStyles).join('') : '');
        }
        this.renderCSS(flattenStyles(evt));
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

    makeComponent(componentInput) {
        return new (this.Component)({
            isRoot: true,
            targetStylesRenderFormat: this.stylesRenderFormat,
            targetMarkupRenderFormat: this.markupRenderFormat,
            markupTransforms: this.markupTransforms,
            stylesTransforms: this.stylesTransforms
        });
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

                this.component = this.makeComponent(this.Component);

                this.trigger('createcomponent', {component: this.component});
                this.trigger('createrootcomponent', {component: this.component});
                this.component.on('createcomponent', evt => this.trigger('createcomponent', Object.assign({}, evt)));

                this.component.on('markeddirty', evt => {
                    requestAnimationFrame(() => {
                        this.component.render(evt.pipelineName);
                    });
                });

                return this.component.init(this.componentInitOpts)
                    .then(() => {
                        this.component.on('rendermarkup', debounce(this.renderMarkup.bind(this), this.renderInterval));
                        this.component.on('renderstyles', debounce(this.renderStyles.bind(this), this.renderInterval));
                        this.component.render();
                    })
            })
    }
}

module.exports = App;

},{"./action-dispatcher":14,"./component":16,"./event-emitter-mixin":17,"./sig":19,"debounce":3,"document-ready-promise":7,"mixwith-es5":11,"object.defaults/immutable":12}],16:[function(require,module,exports){
var EventEmitterMixin = require('./event-emitter-mixin');
var defaults = require('object.defaults/immutable');
var generateHash = require('../utils/make-hash');
var mix = require('mixwith-es5').mix;
var DeDupe = require('mixwith-es5').DeDupe;
var Sig = require('./sig');
var includes = require('../utils/includes');

Sig.addTypeAlias('CSSString', 'String');

var defaultOpts = {
    components: {},
    store: {},
    state: {},
    inputs: [],
    isRoot: false,
    stylesFormat: 'CSSString'
};

var defaultInitOpts = {};

var Component = class extends mix(Component).with(EventEmitterMixin) {
    constructor(opts) {
        opts = defaults(opts, defaultOpts);
        super(opts);
        Sig = this.constructor.Weddell.classes.Sig;
        var Pipeline = this.constructor.Weddell.classes.Pipeline;
        var Store = this.constructor.Weddell.classes.Store;

        Object.defineProperties(this, {
            isRoot: { value: opts.isRoot },
            _isInit: { writable: true, value: false},
            defaultInitOpts: { value: defaults(opts.defaultInitOpts, defaultInitOpts) },
            _id : { value: generateHash() },
            inputs : { value: opts.inputs },
            renderers: { value: {} },
            _tagDirectives: { value: {} }
        });

        var inputMappings = this.constructor._inputMappings;

        Object.defineProperties(this, {
            props: {
                value: new Store(this.inputs, {
                    shouldMonitorChanges: true,
                    extends: (opts.parentComponent ? [opts.parentComponent.props, opts.parentComponent.state, opts.parentComponent.store] : null),
                    inputMappings
                })
            },
            store: {
                value: new Store(Object.assign({
                    $bind: this.bindEvent.bind(this),
                    $act: this.createAction.bind(this)
                }, opts.store), {
                    shouldMonitorChanges: false,
                    shouldEvalFunctions: false
                })
            },
            state: {
                value: new Store(defaults({
                    $id: () => this._id
                }, opts.state))
            }
        });

        Object.defineProperties(this, {
            _componentInstances: { value:
                Object.keys(opts.components).reduce((final, key) => {
                    final[key] = {};
                    return final;
                }, {})
            },
            _locals: {value: new Store({}, { proxies: [this.props, this.state, this.store], shouldMonitorChanges: false, shouldEvalFunctions: false})}
        });

        Object.defineProperty(this, '_pipelines', {
            value: {
                markup: new Pipeline({
                    name: 'markup',
                    store: this._locals,
                    onRender: this.onRenderMarkup.bind(this),
                    isDynamic: !!opts.markupTemplate,
                    inputFormat: new Sig(opts.markupFormat),
                    transforms: opts.markupTransforms,
                    targetRenderFormat: opts.targetMarkupRenderFormat,
                    input: opts.markupTemplate || opts.markup || null
                }),
                styles: new Pipeline({
                    name: 'styles',
                    store: this._locals,
                    onRender: this.onRenderStyles.bind(this),
                    isDynamic: !!opts.stylesTemplate,
                    inputFormat: new Sig(opts.stylesFormat),
                    transforms: opts.stylesTransforms,
                    targetRenderFormat: opts.targetStylesRenderFormat,
                    input: opts.stylesTemplate || opts.styles || null
                })
            }
        });

        Object.defineProperty(this, 'components', {
            value: Object.entries(opts.components).reduce((final, entry) => {
                final[entry[0]] = this.createChildComponentClass(entry[0], entry[1])
                return final;
            }, {})
        })

        Object.entries(this._pipelines).forEach(entry =>
            entry[1].on('markeddirty', evt => {
                this.trigger('markeddirty', Object.assign({
                    pipeline: entry[1],
                    pipelineName: entry[0]
                }, evt))
            })
        );

        ['props', 'state'].forEach((propName) => {
            this[propName].on('change', evt => {
                this.markDirty(evt.changedKey);
            })
        });

        window[this.constructor.Weddell.consts.VAR_NAME].components[this._id] = this;
    }

    createAction(actionName, actionData) {
        this.trigger('createaction', {actionName, actionData});
    }

    onInit() {
        //Default event handler, noop
    }

    onRenderMarkup() {
        //Default event handler, noop
    }

    onRenderStyles() {
        //Default event handler, noop
    }

    addTagDirective(name, directive) {
        this._tagDirectives[name.toUpperCase()] = directive;
    }


    makeComponentClass(ComponentClass) {
        if (ComponentClass.prototype && (ComponentClass.prototype instanceof this.constructor.Weddell.classes.Component || ComponentClass.prototype.constructor === this.constructor.Weddell.classes.Component)) {
            return ComponentClass;
        } else if (typeof ComponentClass === 'function') {
            // We got a non-Component class function, so we assuming it is a component factory function
            return ComponentClass.call(this, this.constructor.Weddell.classes.Component);
        } else {
            //@TODO We may want to support plain objects here as well. Only problem is then we don't get the clean method inheritance and would have to additionally support passing method functions along as options, which is a bit messier.
            throw "Unsupported component input";
        }
    }

    createChildComponentClass(componentName, ChildComponent) {
        if (Array.isArray(ChildComponent)) {
            var initOpts = ChildComponent[2];
            var inputMappings = ChildComponent[1];
            ChildComponent = ChildComponent[0];
        }

        ChildComponent = this.makeComponentClass(ChildComponent);

        var parentComponent = this;
        var targetMarkupRenderFormat = this._pipelines.markup.inputFormat.parsed.returns || this._pipelines.markup.inputFormat.parsed.type;
        var targetStylesRenderFormat = this._pipelines.styles.inputFormat.parsed.returns || this._pipelines.styles.inputFormat.parsed.type;
        var markupTransforms = this._pipelines.markup.transforms;
        var stylesTransforms = this._pipelines.styles.transforms;;

        var obj = {}
        obj[componentName] = class extends ChildComponent {
            constructor(opts) {
                super(defaults({
                    parentComponent,
                    targetMarkupRenderFormat,
                    targetStylesRenderFormat,
                    markupTransforms,
                    stylesTransforms
                }, opts))

                parentComponent.trigger('createcomponent', {component: this, parentComponent, componentName});

                this.on('createcomponent', evt => {
                    parentComponent.trigger('createcomponent', Object.assign({}, evt));
                });

                this.on('markeddirty', evt => {
                    parentComponent.markDirty();
                });
            }
        }
        this.trigger('createcomponentclass', { ComponentClass: obj[componentName] });
        obj[componentName]._initOpts = initOpts;
        obj[componentName]._inputMappings = inputMappings;
        obj[componentName]._id = generateHash();

        return obj[componentName];
    }

    init(opts) {
        opts = defaults(opts, this.defaultInitOpts);
        if (!this._isInit) {
            this._isInit = true;
            return Promise.resolve(this.onInit(opts))
                .then(() => {
                    this.trigger('init');
                    return this;
                });
        }
        return Promise.resolve(this);
    }

    bindEvent(funcText, opts) {
        var consts = this.constructor.Weddell.consts;
        return "(function(event){" +
            (opts && opts.preventDefault ? 'event.preventDefault();' : '') +
            (opts && opts.stopPropagation ? 'event.stopPropagation();' : '') +
            funcText + ";}.bind(window['" + consts.VAR_NAME + "'].components['" + this._id + "'], event)())";
    }

    markDirty(changedKey) {
        return Object.values(this._pipelines).forEach((pipeline, pipelineType) => {
            pipeline.markDirty(changedKey);
        });
    }

    renderStyles() {
        this.trigger('beforerenderstyles');

        return this._pipelines.styles.render()
            .then(output => {
                return Promise.all(Object.entries(this.components).map(entry => {
                        var keys = Object.keys(this._componentInstances[entry[0]]);
                        if (keys.length) {
                            //TODO here we should probably just iterate over all component instances and render styles for each one, but we need some sort of mechanism for not repeating "static" styles
                            //TODO For now we just take the first instance and render that, assuming that all static styles are static styles, so no one instance's stles should be different from another
                            return this._componentInstances[entry[0]][keys[0]].renderStyles();//entry[1].renderStyles();
                        }
                        return {component: this, output: '', wasRenderered: false};
                    }))
                    .then(components => {
                        var evtObj = {
                            output,
                            component: this,
                            components,
                            wasRendered: true,
                            renderFormat: this._pipelines.styles.targetRenderFormat
                        };

                        this.trigger('renderstyles', Object.assign({}, evtObj));

                        return evtObj;
                    });
            });
    }

    render(pipelineType) {
        this.trigger('beforerender');

        if (!pipelineType) {
            return Promise.all(Object.keys(this._pipelines).map(pipelineType => this.render.call(this, pipelineType)));
        }
        var pipeline = this._pipelines[pipelineType];
        var args =  Array.from(arguments).slice(1);

        switch(pipelineType) {
            case 'markup':
                var output = this.renderMarkup.apply(this, args);
                break;
            case 'styles':
                output = this.renderStyles.apply(this, args);
                break;
            default:
        }

        return Promise.resolve(output)
            .then(evt => {
                this.trigger('render', Object.assign({}, evt));
                return evt;
            });
    }

    renderMarkup(content, props, targetFormat) {
        this.trigger('beforerendermarkup');

        var pipeline = this._pipelines.markup;

        if (!targetFormat) {
            targetFormat = pipeline.targetRenderFormat;
        }

        if (props) {
            Object.assign(this.props, Object.entries(props)
                .filter(entry => {
                    var result = includes(this.inputs, entry[0]);
                    if (!result) throw "Unsupported prop: '" + entry[0] + "' (hint: is this key in your inputs?)";
                    return result;
                })
                .reduce((finalObj, entry) => {
                    finalObj[entry[0]] = entry[1];
                    return finalObj;
                }, {}));
        }

        var components = {};
        var off = this.on('rendercomponent', componentResult => {
            if (!(componentResult.componentName in components)) {
                components[componentResult.componentName] = [];
            }
            components[componentResult.componentName].push(componentResult);
        });
        return pipeline.render(targetFormat)
            .then(output => {
                var renderFormat = targetFormat.val;
                if (!(renderFormat in this.renderers)) {
                    throw "No appropriate component markup renderer found for format: " + renderFormat;
                }
                return this.renderers[renderFormat].call(this, output, content)
                    .then(output => {
                        off();
                        var evObj = {
                            output,
                            component: this,
                            id: this._id,
                            components,
                            renderFormat
                        };

                        this.trigger('rendermarkup', Object.assign({}, evObj));
                        return evObj;
                    });
            });
    }

    makeComponentInstance(componentName, index, opts) {
        var instance = new (this.components[componentName])({
            store: defaults({
                $componentID: this.components[componentName]._id,
                $instanceKey: index
            })
        });
        return instance;
    }

    getComponentInstance(componentName, index) {
        var instances = this._componentInstances[componentName]
        if (instances && !(index in instances)) {
            this.markDirty(); //TODO right now we just assume that if the desired component instance doesn't exist that we should mark the whole component dirty. There is a possible optimization in here somewhere.
            return (instances[index] = this.makeComponentInstance(componentName, index)).init(this.constructor._initOpts);
        }
        return Promise.resolve(instances ? instances[index] : null);
    }

    cleanupComponentInstances() {
        //TODO right now, if a component becomes unused, it will continue to sit in memory and possibly generate events. We should probably clean them up.
    }
}

module.exports = Component;

},{"../utils/includes":25,"../utils/make-hash":26,"./event-emitter-mixin":17,"./sig":19,"mixwith-es5":11,"object.defaults/immutable":12}],17:[function(require,module,exports){
var Mixin = require('mixwith-es5').Mixin;
var hasMixin = require('mixwith-es5').hasMixin;
var defaults = require('object.defaults/immutable');
var includes = require('../utils/includes');

var EventEmitterMixin = Mixin(function(superClass) {
    return class extends superClass {
        constructor(opts) {
            super(opts);
            Object.defineProperties(this, {
                _callbacks: {value: {}}
            });
        }

        on(eventName, callback) {
            if (Array.isArray(eventName)) {
                eventName.forEach(evName => this.on(evName, callback));
            } else {
                if (!(eventName in this._callbacks)) {
                    this._callbacks[eventName] = [];
                }
                this._callbacks[eventName] = this._callbacks[eventName].concat(callback);
            }
            return () => this.off(eventName, callback);
        }

        once(eventName, callback) {
            var self = this;
            var off = this.on(eventName, function() {
                callback.apply(this, arguments);
                off();
            });
            return off;
        }

        off(eventName, callback) {
            if (Array.isArray(eventName)) {
                return eventName.map(off, callback);
            } else {
                if (eventName in this._callbacks) {
                    var i = this._callbacks[eventName].indexOf(callback);
                    if (i > -1) {
                        this._callbacks[eventName].splice(i, 1);
                    }
                    if (!this._callbacks[eventName].length) {
                        delete this._callbacks[eventName];
                    }
                    return true;
                }
                return false;
            }
        }

        trigger(eventName, eventObj, thisArg) {
            if (Array.isArray(eventName)) {
                return eventName.map(evtName => this.trigger(evtName, eventObj, thisArg));
            } else {
                if (eventName in this._callbacks) {
                    return this._callbacks[eventName].map(cb => cb.call(thisArg || this, eventObj));
                }
            }
        }
    }
});

module.exports = EventEmitterMixin;

},{"../utils/includes":25,"mixwith-es5":11,"object.defaults/immutable":12}],18:[function(require,module,exports){
var EventEmitterMixin = require('./event-emitter-mixin');
var mix = require('mixwith-es5').mix;

var Pipeline = class extends mix(Pipeline).with(EventEmitterMixin) {
    constructor(opts) {
        super(opts);
        var Sig = this.constructor.Weddell.classes.Sig;
        Object.defineProperties(this, {
            isDirty: {value: false, writable: true},
            name: {value: opts.name},
            template: {value: null, writable: true},
            input: {value: opts.input, writable: true},
            static: {value: null, writable: true},
            onRender: {value: opts.onRender},
            _store: {value: opts.store},
            _cache: {value: null, writable: true},
            _watchedProperties: {value: {}, writable: true},
            _promise: {value: Promise.resolve(), writable: true},
            _requestHandle: {value: null, writable: true},
            _currentResolve: {value: null, writable: true},
            inputFormat: { value: new Sig(opts.inputFormat) },
            _isDynamic: { value: opts.isDynamic, writable: true },
            transforms: { value: opts.transforms, writable: true },
            targetRenderFormat: { value: new Sig(opts.targetRenderFormat) },
            _instances: { value: {}, writable: true },
            _isInit: { value: false, writable: true }
        });
    }

    init() {
        if (!this._isInit) {
            if (this.input) {
                this.template = this.processInput(this.targetRenderFormat);
            }
            this._isInit = true;
        }
    }

    processInput(targetRenderFormat) {
        var input = this.input;
        var Transform = this.constructor.Weddell.classes.Transform;
        var Sig = this.constructor.Weddell.classes.Sig;
        var transforms;
        var inputFormat = this.inputFormat;
        var template;
        //TODO clean up this mess of a function
        if (this._isDynamic && inputFormat.parsed.type !== 'function') {
            var transforms = Transform.getMatchingTransforms(this.transforms, inputFormat, '(locals:Object, ...Any)=>Any')
            if (!transforms) {
                throw "Could not find appropriate transform to turn " + this.inputFormat + " into a template function.";
            }
            var templateTransform;
            transforms = transforms
                .reduce((finalVal, transform) => {
                    if (!finalVal) {
                        var returnType = new Sig(transform.to.parsed.returns);
                        var result = Transform.getTransformPath(this.transforms, returnType, targetRenderFormat);
                        if (result) {
                            templateTransform = transform;
                        }
                    }
                    return finalVal || result;
                }, null);
            if (!transforms) {
                throw "Could not find a tranform path from " + this.inputFormat.validated + ' to ' + targetRenderFormat.validated;
            }
            template = Transform.compose(templateTransform.applyTransform(input), transforms);
        } else if (this._isDynamic && inputFormat.parsed.type === 'function') {
            var returnType = new Sig(this.inputFormat.parsed.returns);
            transforms = this.transforms
                .reduce((finalVal, transform) => {
                    return finalVal || Transform.getTransformPath(this.transforms, returnType, targetRenderFormat);
                }, null);

            if (!targetRenderFormat.checkIfMatch(returnType)) {
                if (!transforms) {
                    throw "Could not find a tranform path from " + returnType.validated + ' to ' + targetRenderFormat.validated;
                }
                template = Transform.compose(input, transforms);
            } else {
                template = input;
            }
        } else {
            transforms = Transform.getTransformPath(this.transforms, this.inputFormat, targetRenderFormat);

            if (!transforms){
                throw "Could not find appropriate transform for " + this.inputFormat.validated + " to " + targetRenderFormat.validated;
            }

            template = function(){ return Transform.applyTransforms(input, transforms) };
        }

        return template;
    }

    markDirty(changedKey) {
        if (!this.isDirty && (!changedKey || (changedKey in this._watchedProperties))) {
            this.isDirty = true;
            this.trigger('markeddirty', {changedKey});
            return true;
        }
        return false;
    }

    callTemplate(locals, template) {
        return template.call(this, locals);
    }

    render(targetFormat) {
        if (!this._isInit) {
            this.init();
        }
        if (this.isDirty || !this._cache) {
            var Sig = this.constructor.Weddell.classes.Sig;
            var template = this.template;
            if (targetFormat) {
                targetFormat = new Sig(targetFormat);
                //TODO cache processed input formats so we don't run into cases where processInput is running every time state changes. We could probably also remove the initialization process and have this only happen lazily
                template = !targetFormat.checkIfMatch(this.targetRenderFormat) ? this.processInput(targetFormat) : this.template;
            }
            var accessed = {};
            var off = this._store.on('get', function(evt){
                accessed[evt.key] = 1;
            });
            var output = template ? this.callTemplate(this._store, template) : this.static;
            //TODO this could potentially miss some changed keys if they are accessed inside a promise callback within the template. We can't turn the event listener off later though, because then we might catch some keys accessed by other processes. a solution might be to come up with a way to only listen for keys accessed by THIS context
            off();
            this._watchedProperties = accessed;

            return Promise.resolve(output ? Promise.resolve(this.onRender ? this.onRender.call(this, output) : output)
                .then(() => {
                    this.isDirty = false;
                    this._cache = output
                    this.trigger('render', {output});
                    return output;
                }) : null);
        }
        return Promise.resolve(this._cache);
    }
}

module.exports = Pipeline;

},{"./event-emitter-mixin":17,"mixwith-es5":11}],19:[function(require,module,exports){
class Sig {
    constructor(str) {
        if (typeof str === 'object' && str.constructor === this.constructor) {
            Object.defineProperties(this, Object.getOwnPropertyDescriptors(str));
        } else {
            this.val = typeof str === 'object' ? this.constructor.format(str) : str;
            Object.defineProperties(this, {
                _parsed: { value: null, writable: true },
                _validated: { value: null, writable: true },
                parsed: {
                    get: () => this._parsed ? this._parsed : this._parsed = this.constructor.parse(this.val)
                },
                validated: {
                    get: () => this._validated ? this._validated : this._validated = this.constructor.format(this.parsed)
                }
            });
        }
    }

    static parseArgs(str) {
        return str ? str.split(',').map(arg => {
            var rest = arg.split('...');
            if (rest.length > 1) {
                arg = rest[1];
                return this.parseVal(arg, true);
            }
            return this.parseVal(arg);
        }) : [];
    }

    static parse(str) {
        var arr;
        var formatted = {};
        var arr = new RegExp(this.pattern).exec(str);
        if (arr) {
            if (arr[1] || arr[2] || arr[3]) {
                //func arguments and body
                return {
                    type: 'function',
                    name: arr[1],
                    args: this.parseArgs(arr[2]),
                    returns: this.parse(arr[3])
                }
            } else if (arr[4]) {
                //not func
                return this.parseVal(arr[4]);
            }
        }
        console.warn("No matches for signature:", str, "Please ensure it is valid");
    }

    static parseVal(str, variadic) {
        var parsed = str.split(':').map(str => str.trim());
        return {name: parsed[1] ? parsed[0] : undefined, type: parsed[1] || parsed[0], variadic};
    }

    static formatVal(obj) {
        return obj.name ? obj.name + ':' + obj.type : obj.type;
    }

    static formatArgs(args) {
        return args.map(arg => {
            return ((arg.variadic && '...') || '') + this.formatVal(arg);
        }).join(',');
    }

    static formatFunc(obj) {
        return (obj.name ? obj.name + ':' : '') + '(' + this.formatArgs(obj.args) + ')=>' + this.format(obj.returns)
    }

    static format(obj) {
        if (obj.type === 'function') {
            return this.formatFunc(obj);
        } else {
            return this.formatVal(obj);
        }
    }

    static compare(obj1, obj2, strict) {
        return obj1 && obj2 &&
            this.compareTypes(obj1.type, obj2.type, strict) &&
            (!obj1.name || !obj2.name || obj1.name === obj2.name) &&
            obj1.variadic === obj1.variadic &&
            ((obj1.type !== 'function' && obj2.type !== 'function') ||
            this.compare(obj1.returns, obj2.returns));        
    }

    static compareTypes(type1, type2, strict) {
        return type1 === 'Any' ||
            type2 === 'Any' ||
            type1 === type2 ||
            (strict ? false : this.checkTypeAliases(type1, type2));
    }

    static checkTypeAliases(type1, type2) {
        //TODO recursive check to get inherited aliases
        return this.customTypes.filter((typeObj) => typeObj.alias === type1)
            .some((typeObj) => typeObj.type === type2) ||
            this.customTypes.filter((typeObj) => typeObj.alias === type2)
                .some((typeObj) => typeObj.type === type1)
    }

    static addTypeAlias(alias, type) {
        if (alias === 'Any') throw "Cannot alias a type to 'Any'";
        this.customTypes.push({type, alias});
    }

    checkIfMatch(sig, strict) {
        if (typeof sig === 'string') {
            sig = new this.constructor(sig);
        }
        return sig.validated === this.validated ||
            this.constructor.compare(this.parsed, sig.parsed, strict);
    }

    wrap(funcName, args) {
        return new this.constructor((funcName ? funcName + ':' : '') + '(' + (args ? args.join(',') : '') + ')=>' + this.val);
    }
}

Sig.pattern = /(?:(?:(?:([^\(]*):)*\(([^\(]+)\)=>(.*))|(.+))/;
Sig.customTypes = [];

module.exports = Sig;

},{}],20:[function(require,module,exports){
var EventEmitterMixin = require('./event-emitter-mixin');
var deepEqual = require('deep-equal');
var defaults = require('object.defaults/immutable');
var includes = require('../utils/includes');
var difference = require('../utils/difference');
var generateHash = require('../utils/make-hash');
var mix = require('mixwith-es5').mix;

var defaultOpts = {
    shouldMonitorChanges: true,
    shouldEvalFunctions: true,
    inputMappings: {}
};

var Store = class extends mix(Store).with(EventEmitterMixin) {
    constructor(data, opts) {
        opts = defaults(opts, defaultOpts);
        super();

        Object.defineProperties(this, {
            shouldMonitorChanges: {value: opts.shouldMonitorChanges},
            shouldEvalFunctions: {value: opts.shouldEvalFunctions},
            _data: {configurable: false,value: {}},
            _dependencyKeys: {configurable: false,value: {}},
            _dependentKeys: {configurable: false,value: {}},
            _proxyObjs: {configurable: false,value: {}},
            _proxyProps: {configurable: false,value: {}},
            proxies: { value: Array.isArray(opts.proxies) ? opts.proxies : opts.proxies ? [opts.proxies] : [] },
            extends: { value: Array.isArray(opts.extends) ? opts.extends : opts.extends ? [opts.extends] : [] },
            inputMappings: { value: opts.inputMappings }
        });

        difference(Object.values(this.inputMappings), Object.keys(data)).forEach(key => {
            this.set(key, null);
        });

        if (data) {
            this.assign(data);
        }

        this.extends.forEach(obj => {
            obj.on('change', function(evt){
                if (evt.changedKey in this.inputMappings) {
                    evt = Object.assign({}, evt);
                    evt.changedKey = this.inputMappings[evt.changedKey];
                    this.trigger('change', evt);
                }
            }.bind(this));

            obj.on('get', function(evt){
                if (evt.key in this.inputMappings) {
                    evt = Object.assign({}, evt);
                    evt.key = this.inputMappings[evt.key];
                    this.trigger('change', evt);
                }
            }.bind(this));
        });

        Object.keys(this.inputMappings).forEach(key => {
            this.set(key, null, true);
        });

        this.proxies.forEach(proxy => {
            Object.keys(proxy).forEach(key => {
                this.set(key, null, true);
            });

            proxy.on('change', evt => {
                if (!(evt.changedKey in this._data) && !(evt.changedKey in this.inputMappings)) {
                    this.trigger('change', Object.assign({}, evt));
                }
            });
            proxy.on('get', evt => {
                if (!(evt.key in this._data) && !(evt.key in this.inputMappings)) {
                    this.trigger('get', Object.assign({}, evt));
                }
            });
        });
    }

    set(key, val, isReadOnly) {
        if (!(key in this)) {
            if (!isReadOnly) {
                var setter = function(newValue) {
                    if (this.shouldMonitorChanges) {
                        var oldValue = this._data[key];
                        if (oldValue && typeof oldValue == "object") {
                            var oldValue = assign({}, oldValue);
                        }
                    }
                    this._data[key] = newValue;
                    if (this.shouldMonitorChanges) {
                        if (!deepEqual(newValue, oldValue)) {
                            this.trigger('change', {changedKey: key, newValue, oldValue});
                            if (key in this._dependentKeys) {
                                this._dependentKeys[key].forEach((dependentKey) => {
                                    this.trigger('change', {changedKey: dependentKey, changedDependencyKey: key, newDependencyValue: newValue, oldDependencyValue: oldValue});
                                });
                            }
                        }
                    }
                }.bind(this);
            }

            Object.defineProperty(this, key, {
                configurable: false,
                enumerable: true,
                get: function() {
                    var value = this.getValue(key);
                    this.trigger('get', {key, value});
                    if (this.shouldEvalFunctions && typeof this._data[key] === 'function') {
                        return this.evaluateFunctionProperty(key);
                    }
                    return value;
                }.bind(this),
                set: setter
            });

            if (!isReadOnly) {
                this[key] = val;
            } else {
                this._data[key] = val;
            }
        }
    }

    getValue(key) {
        var val = this._data[key];
        var i = 0;
        var mappingEntry = Object.entries(this.inputMappings).find(entry => key === entry[1]);

        while(mappingEntry && this.extends[i] && (typeof val === 'undefined' || val === null)) {
            val = this.extends[i][mappingEntry[0]];
            i++;
        }
        i = 0;
        while (this.proxies[i] && (typeof val === 'undefined' || val === null)) {
            val = this.proxies[i][key];
            i++;
        }
        return val;
    }

    assign(data) {
        if (data) {
            if (Array.isArray(data)) {
                data.forEach(key => this.set(key, null));
            } else {
                Object.entries(data).forEach((entry) => {
                    this.set(entry[0], entry[1])
                });
            }
        }
    }

    evaluateFunctionProperty(key) {
        var dependencyKeys = [];
        var off = this.on('get', function(evt){
            dependencyKeys.push(evt.key);
        });
        this.trigger('evaluate.before', {key: key});
        var result = this._data[key].call(this);
        this.trigger('evaluate', {key: key});
        off();

        this.setDependencyKeys(key, dependencyKeys);

        return result;
    }

    setDependencyKeys(key, dependencyKeys) {
        if (key in this._dependencyKeys) {
            var unusedKeys = difference(this._dependencyKeys[key], dependencyKeys);
            var newKeys = difference(dependencyKeys, this._dependencyKeys[key]);
        } else {
            unusedKeys = [];
            newKeys = dependencyKeys;
        }

        newKeys.forEach(function(newKey){
            if (!(newKey in this._dependentKeys)) {
                this._dependentKeys[newKey] = [key];
            } else if (!includes(this._dependentKeys[newKey], key)) {
                this._dependentKeys[newKey] = this._dependentKeys[newKey].concat(key);
            }
        }.bind(this));

        unusedKeys.forEach(function(unusedKey){
            if (unusedKey in this._dependentKeys) {
                var i = this._dependentKeys[unusedKey].indexOf(key);
                if (i > -1) {
                    this._dependentKeys[unusedKey].splice(i,1);
                }
            }
        }.bind(this));

        return this._dependencyKeys[key] = dependencyKeys;
    }

    watch(key, func, shouldWaitForDefined) {
        if (typeof shouldWaitForDefined == 'undefined') shouldWaitForDefined = true;
        if (!Array.isArray(key)) {
            key = [key];
        }
        this.on('change', function(evt){
            if (includes(key, evt.changedKey)) {
                var vals = key.map(currKey=>this[currKey]);
                if (!shouldWaitForDefined || vals.every(val=>typeof val !== 'undefined')) {
                    func.apply(this, vals);
                }
            }
        });
    }
}

module.exports = Store;

},{"../utils/difference":24,"../utils/includes":25,"../utils/make-hash":26,"./event-emitter-mixin":17,"deep-equal":4,"mixwith-es5":11,"object.defaults/immutable":12}],21:[function(require,module,exports){
class Transform {
    constructor(opts) {
        var Sig = this.constructor.Weddell.classes.Sig;
        this.func = opts.func;
        this.from = new Sig(opts.from);
        this.to = new Sig(opts.to);
    }

    applyTransform(input) {
        return this.func(input);
    }

    static applyTransforms(input, transforms) {
        return transforms.reduce((finalVal, transform) => {
            return Array.isArray(transform) ? this.applyTransforms(finalVal, transform) : transform.applyTransform(finalVal);
        }, input);
    }

    static getMatchingTransforms(transforms, from, to) {
        return transforms.filter(transform => {
            return (!to || transform.to.checkIfMatch(to)) && (!from || transform.from.checkIfMatch(from));
        });
    }

    static compose(func, transforms) {
        return transforms.reduce((composed, transform) => {
            return function(){
                return transform.applyTransform(composed.apply(this, arguments));
            }
        }, func);
    }

    static getTransformPath(transforms, from, to, _soFar) {
        //TODO add heuristics to make this process faster
        if (!_soFar) _soFar = [];
        if (from.checkIfMatch(to)) {
            return _soFar;
        }
        return transforms.filter(transform => {
            return transform.from.checkIfMatch(from, true);
        }).reduce((finalVal, transform) => {
            return finalVal || this.getTransformPath(transforms, transform.to, to, _soFar.concat(transform));
        }, null);
    }
}

Transform.heuristics = {};

module.exports = Transform;

},{}],22:[function(require,module,exports){
var mix = require('mixwith-es5').mix;
var App = require('./app');
var Component = require('./component');
var Store = require('./store');
var Pipeline = require('./pipeline');
var Transform = require('./transform');
var Sig = require('./sig');
var includes = require('../utils/includes');

class _Weddell {
    static plugin(pluginObj) {
        class NewWeddell extends _Weddell {};
        if (!pluginObj.id) {
            throw 'Got a plugin with no ID assigned. Aborting';
        }
        if (!includes(NewWeddell.loadedPlugins, pluginObj.id)) {
            if (pluginObj.requires && !includes(NewWeddell.loadedPlugins, pluginObj.requires)) {
                [].concat(pluginObj.requires).forEach((plugReq) => {
                    throw 'Plugin ' + pluginObj.id + ' requires the plugin ' + plugReq + ', which is not loaded. Load ' + plugReq + ' first.';
                });
            }
            if (pluginObj.classes) {
                Object.entries(pluginObj.classes).forEach((entry) => {
                    var className = entry[0];
                    var classOrMixin = entry[1];
                    if (className in NewWeddell.classes) {
                        // Core class, we assume a mixin was passed and we should mix it
                        NewWeddell.classes[className] = mix(NewWeddell.classes[className]).with(classOrMixin);
                    } else {
                        // Helper class
                        NewWeddell.classes[className] = classOrMixin;
                    }
                });
                Object.values(NewWeddell.classes).forEach(function(commonClass){
                    commonClass.NewWeddell = NewWeddell;
                });
            }

            if (pluginObj.deps) {
                Object.entries(pluginObj.deps).forEach((entry) => {
                    if (entry[0] in NewWeddell.deps) {
                        throw 'Dependency conflict while loading plugin: ' + entry[0] + ' is taken.';
                    }
                    NewWeddell.deps[entry[0]] = entry[1];
                });
            }

            NewWeddell.loadedPlugins.push(pluginObj.id);
        } else {
            console.warn('Plugin ' + pluginObj.id + ' already loaded. Ignoring.');
        }
        return NewWeddell;
    }
}
_Weddell.loadedPlugins = [];
_Weddell.consts = {
    VAR_NAME: '_wdl',
    INDEX_ATTR_NAME: 'data-component-index'
};
_Weddell.deps = {};
_Weddell.classes = {App, Component, Store, Pipeline, Transform, Sig};
Object.values(_Weddell.classes).forEach(function(commonClass){
    commonClass.Weddell = _Weddell;
});
module.exports = _Weddell;

},{"../utils/includes":25,"./app":15,"./component":16,"./pipeline":18,"./sig":19,"./store":20,"./transform":21,"mixwith-es5":11}],23:[function(require,module,exports){
module.exports = require('../core/weddell');

},{"../core/weddell":22}],24:[function(require,module,exports){
// var includes = require('./includes');
module.exports = function(arr1, arr2) {
    return arr1.filter(function(i) {return arr2.indexOf(i) < 0;});
};

},{}],25:[function(require,module,exports){
module.exports = function(arr, val){
    return arr.some(currKey=>currKey === val);
}

},{}],26:[function(require,module,exports){
module.exports = function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

},{}]},{},[23])(23)
});