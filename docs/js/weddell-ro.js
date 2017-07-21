(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Weddell = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Expose array-compact
 */

module.exports = compact;


/**
 * Return an array copy without falsy values
 */

function compact (arr) {
  return arr.filter(validate);
}

function validate (item) {
  return !!item;
}

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
(function (global){
'use strict';

// there's 3 implementations written in increasing order of efficiency

// 1 - no Set type is defined
function uniqNoSet(arr) {
	var ret = [];

	for (var i = 0; i < arr.length; i++) {
		if (ret.indexOf(arr[i]) === -1) {
			ret.push(arr[i]);
		}
	}

	return ret;
}

// 2 - a simple Set type is defined
function uniqSet(arr) {
	var seen = new Set();
	return arr.filter(function (el) {
		if (!seen.has(el)) {
			seen.add(el);
			return true;
		}

		return false;
	});
}

// 3 - a standard Set type is defined and it has a forEach method
function uniqSetWithForEach(arr) {
	var ret = [];

	(new Set(arr)).forEach(function (el) {
		ret.push(el);
	});

	return ret;
}

// V8 currently has a broken implementation
// https://github.com/joyent/node/issues/8449
function doesForEachActuallyWork() {
	var ret = false;

	(new Set([true])).forEach(function (el) {
		ret = el;
	});

	return ret === true;
}

if ('Set' in global) {
	if (typeof Set.prototype.forEach === 'function' && doesForEachActuallyWork()) {
		module.exports = uniqSetWithForEach;
	} else {
		module.exports = uniqSet;
	}
} else {
	module.exports = uniqNoSet;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"./lib/is_arguments.js":7,"./lib/keys.js":8}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
'use strict';

var FindParent = {
  byMatcher: function(element, func, opts) {
    if (opts === undefined) {
      opts = {};
    }

    if (opts === null || Array.isArray(opts) || typeof opts !== 'object') {
      throw new Error('Expected opts to be an object.');
    }

    if (!element || element === document) {
      if (opts.throwOnMiss) {
        throw new Error('Expected to find parent node, but none was found.');
      }

      return undefined;
    }

    if (func(element)) {
      return element;
    }

    return this.byMatcher(element.parentNode, func, opts);
  },

  byClassName: function(element, className, opts) {
    return this.byMatcher(element, function(el) {
      return el.classList.contains(className);
    }, opts);
  },

  withDataAttribute: function(element, attName, opts) {
    return this.byMatcher(element, function(el) {
      return el.dataset.hasOwnProperty(attName);
    }, opts);
  }
};

module.exports = FindParent;

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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

},{"./mutable":15,"array-slice":3}],15:[function(require,module,exports){
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

},{"array-each":2,"array-slice":3,"for-own":16,"isobject":12}],16:[function(require,module,exports){
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

},{"for-in":11}],17:[function(require,module,exports){
var isarray = require('isarray')

/**
 * Expose `pathToRegexp`.
 */
module.exports = pathToRegexp
module.exports.parse = parse
module.exports.compile = compile
module.exports.tokensToFunction = tokensToFunction
module.exports.tokensToRegExp = tokensToRegExp

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g')

/**
 * Parse a string for the raw tokens.
 *
 * @param  {string}  str
 * @param  {Object=} options
 * @return {!Array}
 */
function parse (str, options) {
  var tokens = []
  var key = 0
  var index = 0
  var path = ''
  var defaultDelimiter = options && options.delimiter || '/'
  var res

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0]
    var escaped = res[1]
    var offset = res.index
    path += str.slice(index, offset)
    index = offset + m.length

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1]
      continue
    }

    var next = str[index]
    var prefix = res[2]
    var name = res[3]
    var capture = res[4]
    var group = res[5]
    var modifier = res[6]
    var asterisk = res[7]

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path)
      path = ''
    }

    var partial = prefix != null && next != null && next !== prefix
    var repeat = modifier === '+' || modifier === '*'
    var optional = modifier === '?' || modifier === '*'
    var delimiter = res[2] || defaultDelimiter
    var pattern = capture || group

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      partial: partial,
      asterisk: !!asterisk,
      pattern: pattern ? escapeGroup(pattern) : (asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?')
    })
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index)
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path)
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {string}             str
 * @param  {Object=}            options
 * @return {!function(Object=, Object=)}
 */
function compile (str, options) {
  return tokensToFunction(parse(str, options))
}

/**
 * Prettier encoding of URI path segments.
 *
 * @param  {string}
 * @return {string}
 */
function encodeURIComponentPretty (str) {
  return encodeURI(str).replace(/[\/?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
 *
 * @param  {string}
 * @return {string}
 */
function encodeAsterisk (str) {
  return encodeURI(str).replace(/[?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
  })
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length)

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$')
    }
  }

  return function (obj, opts) {
    var path = ''
    var data = obj || {}
    var options = opts || {}
    var encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i]

      if (typeof token === 'string') {
        path += token

        continue
      }

      var value = data[token.name]
      var segment

      if (value == null) {
        if (token.optional) {
          // Prepend partial segment prefixes.
          if (token.partial) {
            path += token.prefix
          }

          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encode(value[j])

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment
        }

        continue
      }

      segment = token.asterisk ? encodeAsterisk(value) : encode(value)

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {string} str
 * @return {string}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {!RegExp} re
 * @param  {Array}   keys
 * @return {!RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {!RegExp} path
 * @param  {!Array}  keys
 * @return {!RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g)

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        partial: false,
        asterisk: false,
        pattern: null
      })
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {!Array}  path
 * @param  {Array}   keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = []

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source)
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {string}  path
 * @param  {!Array}  keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function stringToRegexp (path, keys, options) {
  return tokensToRegExp(parse(path, options), keys, options)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {!Array}          tokens
 * @param  {(Array|Object)=} keys
 * @param  {Object=}         options
 * @return {!RegExp}
 */
function tokensToRegExp (tokens, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options)
    keys = []
  }

  options = options || {}

  var strict = options.strict
  var end = options.end !== false
  var route = ''

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]

    if (typeof token === 'string') {
      route += escapeString(token)
    } else {
      var prefix = escapeString(token.prefix)
      var capture = '(?:' + token.pattern + ')'

      keys.push(token)

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*'
      }

      if (token.optional) {
        if (!token.partial) {
          capture = '(?:' + prefix + '(' + capture + '))?'
        } else {
          capture = prefix + '(' + capture + ')?'
        }
      } else {
        capture = prefix + '(' + capture + ')'
      }

      route += capture
    }
  }

  var delimiter = escapeString(options.delimiter || '/')
  var endsWithDelimiter = route.slice(-delimiter.length) === delimiter

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?'
  }

  if (end) {
    route += '$'
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)'
  }

  return attachKeys(new RegExp('^' + route, flags(options)), keys)
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(string|RegExp|Array)} path
 * @param  {(Array|Object)=}       keys
 * @param  {Object=}               options
 * @return {!RegExp}
 */
function pathToRegexp (path, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */ (keys || options)
    keys = []
  }

  options = options || {}

  if (path instanceof RegExp) {
    return regexpToRegexp(path, /** @type {!Array} */ (keys))
  }

  if (isarray(path)) {
    return arrayToRegexp(/** @type {!Array} */ (path), /** @type {!Array} */ (keys), options)
  }

  return stringToRegexp(/** @type {string} */ (path), /** @type {!Array} */ (keys), options)
}

},{"isarray":18}],18:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],19:[function(require,module,exports){
var DOMReady = require('document-ready-promise')();
var defaults = require('object.defaults/immutable');
var mix = require('mixwith-es5').mix;
var debounce = require('debounce');
var Sig = require('./sig');
var EventEmitterMixin = require('./event-emitter-mixin');

Sig.addTypeAlias('HTMLString', 'String');
Sig.addTypeAlias('CSSString', 'String');

var defaultOpts = {
    renderInterval: 41.6667,
    markupRenderFormat: 'HTMLString',
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
                this.trigger('createcomponent', {component: this.component});
                this.component.on('createcomponent', evt =>
                    this.trigger('createcomponent', evt));

                return this.component.init(componentOpts)
                    .then(() => {
                        this.component.on('rendermarkup', debounce(this.renderMarkup.bind(this), this.renderInterval));
                        this.component.on('renderstyles', debounce(this.renderStyles.bind(this), this.renderInterval));
                    })
            })
    }
}

module.exports = App;

},{"./event-emitter-mixin":21,"./sig":23,"debounce":5,"document-ready-promise":9,"mixwith-es5":13,"object.defaults/immutable":14}],20:[function(require,module,exports){
var EventEmitterMixin = require('./event-emitter-mixin');
var defaults = require('object.defaults/immutable');
var generateHash = require('../utils/make-hash');
var mix = require('mixwith-es5').mix;
var DeDupe = require('mixwith-es5').DeDupe;
var uniq = require('array-uniq');
var compact = require('array-compact');
var Sig = require('./sig');

Sig.addTypeAlias('HTMLString', 'String');
Sig.addTypeAlias('CSSString', 'String');

var defaultOpts = {
    components: {},
    store: {},
    state: {},
    inputs: [],
    outputs: [],
    passthrough: [],
    markupFormat: 'HTMLString',
    stylesFormat: 'CSSString'
};

var defaultInitOpts = {
};

var Component = class extends mix(Component).with(EventEmitterMixin) {
    constructor(opts) {
        opts = defaults(opts, defaultOpts);
        super(opts);
        var Store = this.constructor.Weddell.classes.Store;
        var Pipeline = this.constructor.Weddell.classes.Pipeline;
        this.state = new Store(opts.state);
        this.store = new Store(Object.assign({
            $bind: this.bindEvent.bind(this),
            $component: this.importComponent.bind(this, 'markup')
        }, opts.store), {shouldMonitorChanges: false, shouldEvalFunctions: false});
        this.onInit = opts.onInit;
        this.markupFormat = opts.markupFormat;
        this.components = opts.components;
        this.defaultInitOpts = defaults(opts.defaultInitOpts, defaultInitOpts);

        Object.defineProperties(this, {
            _transformers: {value: []},
            _inputs : {value: opts.inputs},
            _outputs : {value: opts.outputs},
            _passthrough : {value: opts.passthrough},
            inputs: {get: () => uniq(compact(this._inputs.concat(this._passthrough))) },
            outputs: {get: () => uniq(compact(this._outputs.concat(this._passthrough))) },
            _locals : {value: new Store(null, {shouldMonitorChanges: false, shouldEvalFunctions: false})},
            _id : {value: generateHash()},
            _isInit: {writable: true,value: false}
        });
        Object.defineProperty(this, '_pipelines', {
            value: {
                styles: new Pipeline({
                    name: 'styles',
                    inputFormat: opts.stylesFormat,
                    targetRenderFormat: opts.targetStylesRenderFormat,
                    isDynamic: !!opts.stylesTemplate,
                    store: this._locals,
                    transforms: opts.stylesTransforms,
                    input: opts.stylesTemplate || opts.styles || null
                }),
                markup: new Pipeline({
                    name: 'markup',
                    inputFormat: opts.markupFormat,
                    targetRenderFormat: opts.targetMarkupRenderFormat,
                    isDynamic: !!opts.markupTemplate,
                    transforms: opts.markupTransforms,
                    store: this._locals,
                    input: opts.markupTemplate || opts.markup || null
                })
            },
            writable: true
        });
    }

    getOutput(pipelineName) {
        //TODO this should only output currently rendered components, or include a flag indicating whether or not they are rendered
        return {
            output: this._pipelines[pipelineName].import(),
            id: this._id,
            components: Object.values(this.components).map(comp => comp.getOutput(pipelineName))
        };
    }

    init(opts) {
        opts = defaults(opts, this.defaultInitOpts);

        var consts = this.constructor.Weddell.consts;

        if (!('components' in window[consts.VAR_NAME])) {
            Object.defineProperty(window[consts.VAR_NAME], 'components', {value: {}});
        }
        window[consts.VAR_NAME].components[this._id] = this;

        this.state.on('change', this.react.bind(this));
        this.state.proxy([this._locals, this.store], null, null, false);
        this.store.proxy([this._locals, this.state], null, null, true);
        this._locals.proxy([this, this.store, this.state], null, null, true);

        var promise = Promise.resolve();

        if (this.onInit) {
            promise = promise.then(() => {
                return this.onInit.call(this, opts)
            });
        }

        Object.entries(this._pipelines).forEach((entry) => {
            entry[1].on('render', (rendered) => {
                var output = this.getOutput(entry[0]);
                this.trigger('render' + entry[0], output);
                this.trigger('render', Object.assign({pipelineName: entry[0]}, output));
            });
            entry[1].init();
            //TODO bugfix: pipelines are initting twice
        });

        promise = promise
            .then(function(){
                return Promise.all(
                    Object.entries(this.components).map((entry) => {
                        var componentName = entry[0];
                        var component = entry[1];

                        if (Array.isArray(component)) {
                            var componentOpts = component[2];
                            var inputs = component[1];
                            component = component[0];
                        }
                        component = defaults(component, {
                            targetMarkupRenderFormat: this._pipelines.markup.targetRenderFormat,
                            targetStylesRenderFormat: this._pipelines.styles.targetRenderFormat,
                            markupTransforms: this._pipelines.markup.transforms,
                            stylesTransforms: this._pipelines.styles.transforms
                        });

                        component = new this.constructor(component);
                        this.trigger('createcomponent', {component, componentName});

                        component.on(['exit', 'enter'], this.render.bind(this));
                        this.components[componentName] = component;

                        component.on('render', (evt) => {
                            this.render(evt.pipelineName);
                        });

                        return component.init.call(component, componentOpts)
                            .then(function(){
                                if (inputs) {
                                    var prop;
                                    var inputTarget;
                                    var inputTargetKey;
                                    for (var key in inputs) {
                                        prop = inputs[key];
                                        key = key.split('.');
                                        inputTarget = component;

                                        if (this.outputs.indexOf(prop) == -1) {
                                            throw "Attempted to pass invalid output, '" + prop + "' from " + componentName;
                                        }

                                        while (key.length > 1) {
                                            inputTargetKey = key.shift();
                                            inputTarget = inputTarget.components[inputTargetKey];

                                            if (!inputTarget) {
                                                throw "Invalid input path supplied to component with name " + inputTargetKey;
                                            }

                                            if (inputTarget.inputs.indexOf(prop) == -1) {
                                                throw "Attempted to pass protected or nonexistent input, " + prop + " to component, " + inputTargetKey;
                                            }
                                        }

                                        this._locals.proxy([inputTarget._locals, inputTarget.state, inputTarget], prop, key[0], true);
                                    }
                                }
                            }.bind(this));
                    })
                );
            }.bind(this))
            .then(function(){
                this.render();
                this._isInit = true;
            }.bind(this));

        return promise;
    }

    bindEvent(funcText, opts) {
        var consts = this.constructor.Weddell.consts;
        return "(function(event){" +
            (opts && opts.preventDefault ? 'event.preventDefault();' : '') +
            (opts && opts.stopPropagation ? 'event.stopPropagation();' : '') +
            funcText + ";}.bind(window['" + consts.VAR_NAME + "'].components['" + this._id + "'], event)())";
    }

    importComponent(pipelineName, componentName) {
        if (!componentName in this.components) {
            console.warn("No component with name", componentName);
            return;
        }
        return this.components[componentName]._pipelines[pipelineName].import();
    }

    react(evt) {
        this.render(null, evt.changedKey);
    }

    render(pipelineName, changedKey) {
        var pipelines = pipelineName ? [this._pipelines[pipelineName]] : Object.values(this._pipelines);
        pipelines.forEach((pipeline) => pipeline.render(changedKey));
    }
}

module.exports = Component;

},{"../utils/make-hash":35,"./event-emitter-mixin":21,"./sig":23,"array-compact":1,"array-uniq":4,"mixwith-es5":13,"object.defaults/immutable":14}],21:[function(require,module,exports){
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

},{"../utils/includes":34,"mixwith-es5":13,"object.defaults/immutable":14}],22:[function(require,module,exports){
var EventEmitterMixin = require('./event-emitter-mixin');
var mix = require('mixwith-es5').mix;

var Renderer = class extends mix(Renderer).with(EventEmitterMixin) {
    constructor(opts) {
        super(opts);
        var Sig = this.constructor.Weddell.classes.Sig;
        Object.defineProperties(this, {
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
            transforms: {value: opts.transforms, writable: true},
            targetRenderFormat: {value: new Sig(opts.targetRenderFormat) }
        });
    }

    init() {
        if (this.input) {
            this.processInput();
        }
    }

    processInput(input) {
        var input = this.input;
        var Transform = this.constructor.Weddell.classes.Transform;
        var Sig = this.constructor.Weddell.classes.Sig;
        var transforms;
        var inputFormat = this.inputFormat;
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
                        var result = Transform.getTransformPath(this.transforms, returnType, this.targetRenderFormat);
                        if (result) {
                            templateTransform = transform;
                        }
                    }
                    return finalVal || result;
                }, null);
            if (!transforms) {
                throw "Could not find a tranform path from " + this.inputFormat.validated + ' to ' + this.targetRenderFormat.validated;
            }
            this.template = Transform.compose(templateTransform.applyTransform(input), transforms);
        } else if (this._isDynamic && inputFormat.parsed.type === 'function') {
            var returnType = new Sig(this.inputFormat.parsed.returns);
            transforms = this.transforms
                .reduce((finalVal, transform) => {
                    return finalVal || Transform.getTransformPath(this.transforms, returnType, this.targetRenderFormat);
                }, null);
                
            if (!this.targetRenderFormat.checkIfMatch(returnType)) {
                if (!transforms) {
                    throw "Could not find a tranform path from " + this.inputFormat.validated + ' to ' + this.targetRenderFormat.validated;
                }
                this.template = Transform.compose(input, transforms);
            } else {
                this.template = input;
            }
        } else {
            transforms = Transform.getTransformPath(this.transforms, this.inputFormat, this.targetRenderFormat);

            if (!transforms){
                throw "Could not find appropriate transform for " + this.inputFormat.validated + " to " + this.targetRenderFormat.validated;
            }

            this.static = Transform.applyTransforms(input, transforms);
        }
    }

    callTemplate(locals) {
        return this.template.call(this, locals);
    }

    render(changedKey) {
        if ((!changedKey || (changedKey in this._watchedProperties))) {
            var promise = new Promise((resolve) => {
                if (this._requestHandle) {
                    cancelAnimationFrame(this._requestHandle);
                    this._currentResolve(promise);
                }
                this._currentResolve = resolve;
                this._requestHandle = requestAnimationFrame(() => {
                    this._requestHandle = null;
                    var accessed = {};
                    var off = this._store.on('get', function(evt){
                        accessed[evt.key] = 1;
                    });
                    var output = this.template ? this.callTemplate(this._store) : this.static;
                    //TODO this could potentially miss some changed keys if they are accessed inside a promise callback within the template. We can't turn the event listener off later though, because then we might catch some keys accessed by other processes. a solution might be to come up with a way to only listen for keys accessed by THIS context
                    off();
                    this._watchedProperties = accessed;
                    resolve(
                        output ? Promise.resolve(this.onRender ? this.onRender.call(this, output) : output)
                            .then(() => {
                                this._cache = output
                                this.trigger('render', {output});
                                return output;
                            }) : null
                    );
                });
            });
            this._promise = promise;
        }
        return this._promise;
    }

    import() {
        return this._cache;
    }
}

module.exports = Renderer;

},{"./event-emitter-mixin":21,"mixwith-es5":13}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
var EventEmitterMixin = require('./event-emitter-mixin');
var deepEqual = require('deep-equal');
var defaults = require('object.defaults/immutable');
var includes = require('../utils/includes');
var difference = require('../utils/difference');
var generateHash = require('../utils/make-hash');
var mix = require('mixwith-es5').mix;

var defaultOpts = {
    shouldMonitorChanges: true,
    shouldEvalFunctions: true
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
            _proxyProps: {configurable: false,value: {}}
        });
        if (data) {
            this.assign(data);
        }
    }

    assign(data) {
        Object.entries(data).map(function(entry){
            Object.defineProperty(this, entry[0], {
                configurable: false,
                enumerable: true,
                get: function(){
                    this.trigger('get', {key: entry[0], value: this._data[entry[0]]});
                    if (this.shouldEvalFunctions && typeof this._data[entry[0]] === 'function') {
                        return this.evaluateFunctionProperty(entry[0]);
                    }
                    return this._data[entry[0]];
                }.bind(this),
                set: function(newValue) {
                    if (this.shouldMonitorChanges) {
                        var oldValue = this._data[entry[0]];
                        if (oldValue && typeof oldValue == "object") {
                            var oldValue = assign({}, oldValue);
                        }
                    }
                    this._data[entry[0]] = newValue;
                    if (this.shouldMonitorChanges) {
                        if (!deepEqual(newValue, oldValue)) {
                            this.trigger('change', {changedKey: entry[0], newValue: newValue, oldValue: oldValue});
                            if (entry[0] in this._dependentKeys) {
                                this._dependentKeys[entry[0]].forEach(function(dependentKey){
                                    this.trigger('change', {changedKey: dependentKey, changedDependencyKey: entry[0], newDependencyValue: newValue, oldDependencyValue: oldValue});
                                }.bind(this));
                            }
                        }
                    }
                }.bind(this)
            });
            this[entry[0]] = entry[1];
        }.bind(this));
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

    proxy(obj, proxyKey, proxyAlias, isReadOnly) {
        if (Array.isArray(obj)) {
            obj.forEach(subObj => this.proxy.call(this, subObj, proxyKey, proxyAlias, isReadOnly));
        } else if (typeof proxyKey == 'string') {
            var objhash = Object.entries(this._proxyObjs).find(entry => entry[1] === obj);
            objhash = objhash ? objhash[0] : null;
            if (!objhash) {
                objhash = generateHash();
                //TODO this whole thing kind of sucks and could be done better
                this._proxyObjs[objhash] = obj;
                this._proxyProps[objhash] = [];
                this.on('change', function(eventObj){
                    if (includes(this._proxyProps[objhash], eventObj.changedKey)) {
                        obj.trigger('change', eventObj);
                    }
                }.bind(this));
                this.on('get', function(eventObj){
                    if (includes(this._proxyProps[objhash], eventObj.key)) {
                        obj.trigger('get', eventObj);
                    }
                }.bind(this));
            }
            if (!(proxyKey in obj)) {
                if (!proxyAlias) proxyAlias = proxyKey;
                var setter;
                if (!isReadOnly) {
                    setter = function(newValue){
                        this[proxyKey] = newValue;
                    }.bind(this);
                }
                Object.defineProperty(obj, proxyAlias, {
                    configurable: false,
                    enumerable: true,
                    get: function(){
                        return this[proxyKey];
                    }.bind(this),
                    set: setter
                });
                this._proxyProps[objhash].push(proxyKey);
            }
        } else {
            Object.keys(this).forEach(key => this.proxy.call(this, obj, key, null, isReadOnly));
        }
    }
}

module.exports = Store;

},{"../utils/difference":33,"../utils/includes":34,"../utils/make-hash":35,"./event-emitter-mixin":21,"deep-equal":6,"mixwith-es5":13,"object.defaults/immutable":14}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
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
    VAR_NAME: '_wdl'
};
_Weddell.deps = {};
_Weddell.classes = {App, Component, Store, Pipeline, Transform, Sig};
Object.values(_Weddell.classes).forEach(function(commonClass){
    commonClass.Weddell = _Weddell;
});
module.exports = _Weddell;

},{"../utils/includes":34,"./app":19,"./component":20,"./pipeline":22,"./sig":23,"./store":24,"./transform":25,"mixwith-es5":13}],27:[function(require,module,exports){
var Mixin = require('mixwith-es5').Mixin;
var mix = require('mixwith-es5').mix;
var Router = require('./router');
var StateMachineMixin = require('./state-machine-mixin');
var MachineStateMixin = require('./machine-state-mixin');

module.exports = function(_Weddell){
    return _Weddell.plugin({
        id: 'router',
        classes:  {
            App: Mixin(function(App){
                return class extends App {
                    constructor(opts) {
                        super(opts);
                        this.router = new Router({
                            routes: opts.routes,
                            onRoute: function(matches, componentNames) {
                                var component = this.component;
                                var promises = [];
                                var key = 0;
                                while (component && component.components) {
                                    if (componentNames[key]) {
                                        var newComponent = component.getState(componentNames[key]);
                                        if (newComponent) {
                                            promises.push(component.changeState(newComponent));
                                            component = newComponent;
                                        } else {
                                            throw "Could not navigate to component " + key;
                                        }
                                    } else {
                                        if (component.currentState) {
                                            promises.push(component.changeState(null));
                                        }
                                        component = component.currentState;
                                    }
                                    key++;
                                }
                                return Promise.all(promises);
                            }.bind(this)
                        });
                    }

                    init() {
                        return super.init()
                            .then(() => {
                                return this.router.init();
                            });
                    }
                }
            }),
            Component: Mixin(function(Component){
                var RouterComponent = class extends mix(Component).with(StateMachineMixin, MachineStateMixin) {
                    constructor(opts) {
                        opts.stateClass = RouterComponent;
                        super(opts);
                        var routerLocals = {
                            $router: this.importRouterView.bind(this)
                        };
                        this.store.assign(routerLocals);
                        this._locals.assign(routerLocals);

                        this.on('createcomponent', (evt) => {
                            this.addState(evt.componentName, evt.component);
                        });
                    }

                    importRouterView() {
                        return this.currentState ? this.currentState._pipelines.markup.import() : '';
                    }
                }
                return RouterComponent;
            }),
            Router
        }
    });
}

},{"./machine-state-mixin":28,"./router":29,"./state-machine-mixin":30,"mixwith-es5":13}],28:[function(require,module,exports){
var mix = require('mixwith-es5').mix;
var EventEmitterMixin = require('../../core/event-emitter-mixin');
var DeDupe = require('mixwith-es5').DeDupe;
var Mixin = require('mixwith-es5').Mixin;

var MachineState = Mixin(function(superClass) {
    return class extends mix(superClass).with(DeDupe(EventEmitterMixin)) {
        constructor(opts) {
            super(opts);
            this.onEnterState = opts.onEnterState;
            this.onExitState = opts.onExitState;
            this.onUpdateState = opts.onUpdateState;
        }

        stateAction(methodName, eventName) {
            return Promise.resolve(this[methodName] && this[methodName]())
                .then(() => this.trigger(eventName));
        }

        exitState() {
            return this.stateAction('onExitState', 'exit');
        }

        enterState() {
            return this.stateAction('onEnterState', 'enter');
        }

        updateState() {
            return this.stateAction('onUpdateState', 'update');
        }
    }
});
module.exports = MachineState;

},{"../../core/event-emitter-mixin":21,"mixwith-es5":13}],29:[function(require,module,exports){
var defaults = require('object.defaults/immutable');
var pathToRegexp = require('path-to-regexp');
var findParent = require('find-parent');

var defaultOpts = {};

class Router {
    constructor(opts) {
        opts = defaults(opts, defaultOpts);
        this.currentRoute = null;
        this.routes = [];
        this.onRoute = opts.onRoute;
        if (opts.routes) {
            this.addRoutes(opts.routes);
        }
    }
    //TODO allow for absolute routes prefixed with /

    route(pathName, params) {
        var promise = Promise.resolve(null);

        if (typeof pathName === 'string') {
            var matches = Router.matchRoute(pathName, this.routes);
        } else if (Array.isArray(pathName)) {
            matches = pathName;
        } else { //assuming a route object was passed
            matches = [{route: pathName, match: null}];
        }
        if (matches) {
            promise = Promise.all(matches.map((currMatch) => {
                    if (typeof currMatch.route.handler == 'function') {
                        return Promise.resolve(currMatch.route.handler.call(currMatch.route, matches));
                    } else {
                        return currMatch.route.handler;
                    }
                }))
                .then(this.onRoute.bind(this, matches))
                .then(() => {
                    if (matches.route.replaceState) {
                        history.replaceState({fullPath: matches.fullPath}, document.title, matches.fullPath);
                    } else {
                        history.pushState({fullPath: matches.fullPath}, document.title, matches.fullPath);
                    }
                    this.currentRoute = matches.fullPath;
                });
        }

        return promise;
    }

    static matchRoute(pathName, routes) {
        var result = null;
        var fullPath = '';
        routes.forEach(function(currRoute){
            var params = [];
            var match = pathToRegexp(currRoute.pattern, params, {end:false}).exec(pathName);
            if (match) {
                result = [];
                result.push({route: currRoute, match, params});
                fullPath += match[0];
                if (currRoute.children) {
                    var newPath = match[0].charAt(match[0].length - 1) == '/' ? match[0] : match[0] + '/';
                    var childMatches = Router.matchRoute(match.input.replace(newPath, ''), currRoute.children);
                    result = childMatches ? result.concat(childMatches) : result;
                    fullPath = childMatches ? fullPath + childMatches.fullPath : fullPath;
                }
                result.route = result[result.length - 1].route;
                result.fullPath = fullPath;
                return false;
            }
        });
        return result;
    }

    addRoutes(routes) {
        this.routes = this.routes.concat(routes);
    }

    init() {
        if (this.routes) {
            addEventListener('popstate', this.onPopState.bind(this));

            document.body.addEventListener('click', (evt) => {
                var clickedATag = findParent.byMatcher(evt.target, el => el.tagName === 'A');
                if (clickedATag) {
                    var matches = Router.matchRoute(clickedATag.getAttribute('href'), this.routes);
                    //TODO figure out how to do route parameters / named routes
                    if (matches) {
                        evt.preventDefault();
                        this.route(matches);
                    }
                }
            });

            return this.route(location.pathname + location.hash);
        }
        return Promise.resolve();
    }

    onPopState() {
        if (evt && evt.fullPath) {
            this.route(evt.fullPath);
        }
    }
}
module.exports = Router;

},{"find-parent":10,"object.defaults/immutable":14,"path-to-regexp":17}],30:[function(require,module,exports){
var mix = require('mixwith-es5').mix;
var EventEmitterMixin = require('../../core/event-emitter-mixin');
var DeDupe = require('mixwith-es5').DeDupe;
var MachineState = require('./machine-state-mixin');
var Mixin = require('mixwith-es5').Mixin;
var hasMixin = require('mixwith-es5').hasMixin;

var StateMachine = Mixin(function(superClass) {
    return class extends mix(superClass).with(DeDupe(EventEmitterMixin)) {
        constructor(opts) {
            super(opts);
            Object.defineProperties(this, {
                stateClass: {value: opts.stateClass},
                currentState: {writable: true, value: null},
                previousState: {writable: true, value: null},
                previousState: {writable: true, value: null},
                states: {value: {}}
            });
            if (!hasMixin(this, MachineState)) {
                console.warn("Supplied state class does not extend MachineState. Expect unreliable results.");
            }
        }

        static checkIfIsState(state) {
            return state.prototype === this.stateClass || state.prototype instanceof this.stateClass;
        }

        getState(state) {
            if (!state) {
                return null;
            }
            if (typeof state == 'string') {
                return this.states[state] || null;
            } else if (state.constructor === this.stateClass || state instanceof this.stateClass) {
                return state;
            }
            return null;
        }

        addState(key, state, onEnter, onExit) {
            if (this.stateClass.checkIfIsState(state)) {
                this.states[key] = state;
            }
        }

        changeState(state) {
            state = this.getState(state);

            var promise = Promise.resolve();
            if (state && this.currentState === state) {
                promise = Promise.resolve(this.currentState.updateState())
                    .then(() => {
                        this.trigger('updatestate', {updatedState: this.currentState});
                        return this.onUpdateState ? this.onUpdateState() : null;
                    });
            } else {
                if (this.currentState) {
                    promise = Promise.resolve(this.currentState.exitState())
                        .then(() => {
                            this.trigger('exitstate', {exitedState: this.currentState, enteredState: state});
                            this.previousState = this.currentState;
                            this.currentState = null;
                            return this.onExitState ? this.onExitState() : null;
                        });
                }
                if (state) {
                    promise = promise
                        .then(() => state.enterState())
                        .then(() => {
                            this.currentState = state;
                            this.trigger('enterstate', {exitedState: this.currentState, enteredState: state});

                            return this.onEnterState ? this.onEnterState() : null;
                        });
                }
            }
            return promise;
        }
    }
})
module.exports = StateMachine;

},{"../../core/event-emitter-mixin":21,"./machine-state-mixin":28,"mixwith-es5":13}],31:[function(require,module,exports){
module.exports = require('../plugins/router')(require('./weddell'));

},{"../plugins/router":27,"./weddell":32}],32:[function(require,module,exports){
module.exports = require('../core/weddell');

},{"../core/weddell":26}],33:[function(require,module,exports){
var includes = require('./includes');
module.exports = function(arr1, arr2) {
    return Array.from(arguments).slice(1).reduce(function(finalArr, currArr){
        return finalArr.concat(currArr.reduce(function(currFinalArr, currVal){
            if (!includes(arguments[0], currVal)) {
                return currFinalArr.concat(currVal);
            }
            return currFinalArr;
        }, []));
    }, []);
};

},{"./includes":34}],34:[function(require,module,exports){
module.exports = function(arr, val){
    return arr.some(currKey=>currKey === val);
}

},{}],35:[function(require,module,exports){
module.exports = function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

},{}]},{},[31])(31)
});