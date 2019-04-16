(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Weddell = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
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

},{"./lib/is_arguments.js":4,"./lib/keys.js":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}

},{}],6:[function(require,module,exports){
var makeDefaultsFunc = require('./src/make-defaults-func');
module.exports = makeDefaultsFunc(true, require('./src/array-merge'));

},{"./src/array-merge":7,"./src/make-defaults-func":9}],7:[function(require,module,exports){
module.exports = function() {
    return Array.from(arguments).slice(1).reduce((finalArr, arr) => {
        return finalArr.concat(arr.filter(item => finalArr.indexOf(item) < 0));
    }, arguments[0]);
};
},{}],8:[function(require,module,exports){
var makeDefaultsFunc = require('./make-defaults-func');
module.exports = makeDefaultsFunc(false);

},{"./make-defaults-func":9}],9:[function(require,module,exports){
module.exports = function(deep, merge) {
    return function defaults() {
        return Array.from(arguments).slice(1).reduce((sourceObj, obj) => {
            Object.entries(obj).forEach((entry) => {
                if (typeof sourceObj[entry[0]] === 'undefined') {
                    sourceObj[entry[0]] = entry[1];
                } else if (deep && [entry[1], sourceObj[entry[0]]].every(val => val && typeof val === 'object' && val.constructor.name === 'Object')) {
                    sourceObj[entry[0]] = defaults(sourceObj[entry[0]], entry[1]);
                } else if (merge && [entry[1], sourceObj[entry[0]]].every(val => val && typeof val === 'object' && Array.isArray(val))) {
                    sourceObj[entry[0]] = merge(sourceObj[entry[0]], entry[1]);
                }
            });
            return sourceObj;
        }, Object.assign({}, arguments[0]));
    }
};

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
'use strict';

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
})(this, function (exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  const _cachedApplicationRef = exports._cachedApplicationRef = Symbol('_cachedApplicationRef');

  const _mixinRef = exports._mixinRef = Symbol('_mixinRef');

  const _originalMixin = exports._originalMixin = Symbol('_originalMixin');

  const wrap = exports.wrap = (mixin, wrapper) => {
    Object.setPrototypeOf(wrapper, mixin);
    if (!mixin[_originalMixin]) {
      mixin[_originalMixin] = mixin;
    }
    return wrapper;
  };

  const Cached = exports.Cached = mixin => wrap(mixin, superclass => {
    // Get or create a symbol used to look up a previous application of mixin
    // to the class. This symbol is unique per mixin definition, so a class will have N
    // applicationRefs if it has had N mixins applied to it. A mixin will have
    // exactly one _cachedApplicationRef used to store its applications.
    let applicationRef = mixin[_cachedApplicationRef];
    if (!applicationRef) {
      applicationRef = mixin[_cachedApplicationRef] = Symbol(mixin.name);
    }
    // Look up an existing application of `mixin` to `c`, return it if found.
    if (superclass.hasOwnProperty(applicationRef)) {
      return superclass[applicationRef];
    }
    // Apply the mixin
    let application = mixin(superclass);
    // Cache the mixin application on the superclass
    superclass[applicationRef] = application;
    return application;
  });

  const HasInstance = exports.HasInstance = mixin => {
    if (Symbol.hasInstance && !mixin.hasOwnProperty(Symbol.hasInstance)) {
      Object.defineProperty(mixin, Symbol.hasInstance, {
        value: function (o) {
          const originalMixin = this[_originalMixin];
          while (o != null) {
            if (o.hasOwnProperty(_mixinRef) && o[_mixinRef] === originalMixin) {
              return true;
            }
            o = Object.getPrototypeOf(o);
          }
          return false;
        }
      });
    }
    return mixin;
  };

  const BareMixin = exports.BareMixin = mixin => wrap(mixin, superclass => {
    // Apply the mixin
    let application = mixin(superclass);

    // Attach a reference from mixin applition to wrapped mixin for RTTI
    // mixin[@@hasInstance] should use this.
    application.prototype[_mixinRef] = mixin[_originalMixin];
    return application;
  });

  const Mixin = exports.Mixin = mixin => Cached(HasInstance(BareMixin(mixin)));

  const mix = exports.mix = superClass => new MixinBuilder(superClass);

  class MixinBuilder {
    constructor(superclass) {
      this.superclass = superclass;
    }

    with() {
      return Array.from(arguments).reduce((c, m) => m(c), this.superclass);
    }

  }
});
},{}],13:[function(require,module,exports){
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

},{"isarray":14}],14:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],15:[function(require,module,exports){
/*!
* vdom-virtualize
* Copyright 2014 by Marcel Klehr <mklehr@gmx.net>
*
* (MIT LICENSE)
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/
var VNode = require("virtual-dom/vnode/vnode")
  , VText = require("virtual-dom/vnode/vtext")
  , VComment = require("./vcomment")

module.exports = createVNode

function createVNode(domNode, keyAttribute) {
  keyAttribute = keyAttribute || null // XXX: Leave out `key` for now... merely used for (re-)ordering

  if(domNode.nodeType == 1) return createFromElement(domNode, keyAttribute)
  if(domNode.nodeType == 3) return createFromTextNode(domNode, keyAttribute)
  if(domNode.nodeType == 8) return createFromCommentNode(domNode, keyAttribute)
  return
}

function createFromTextNode(tNode) {
  return new VText(tNode.nodeValue)
}


function createFromCommentNode(cNode) {
  return new VComment(cNode.nodeValue)
}


function createFromElement(el, keyAttribute) {
  var tagName = el.tagName
  , namespace = el.namespaceURI == 'http://www.w3.org/1999/xhtml'? null : el.namespaceURI
  , properties = getElementProperties(tagName, el)
  , children = []
  , key = (keyAttribute && el.getAttribute(keyAttribute)) || null

  for (var i = 0; i < el.childNodes.length; i++) {
    children.push(createVNode(el.childNodes[i], keyAttribute))
  }

  return new VNode(tagName, properties, children, key, namespace)
}


function getElementProperties(tagName, el) {
  var obj = {}

  for(var i=0; i<props.length; i++) {
    var propName = props[i]
    if(!el[propName] || (elementReadOnlyProperties[tagName.toLowerCase()] && elementReadOnlyProperties[tagName.toLowerCase()].indexOf(propName) > -1)) continue

    // Special case: style
    // .style is a DOMStyleDeclaration, thus we need to iterate over all
    // rules to create a hash of applied css properties.
    //
    // You can directly set a specific .style[prop] = value so patching with vdom
    // is possible.
    if("style" == propName) {
      var css = {}
        , styleProp
      if ('undefined' !== typeof el.style.length) {
        for(var j=0; j<el.style.length; j++) {
          styleProp = el.style[j]
          css[styleProp] = el.style.getPropertyValue(styleProp) // XXX: add support for "!important" via getPropertyPriority()!
        }
      } else { // IE8
        for (var styleProp in el.style) {
          if (el.style[styleProp] && el.style.hasOwnProperty(styleProp)) {
            css[styleProp] = el.style[styleProp];
          }
        }
      }

      if(Object.keys(css).length) obj[propName] = css
      continue
    }

    // https://msdn.microsoft.com/en-us/library/cc848861%28v=vs.85%29.aspx
    // The img element does not support the HREF content attribute.
    // In addition, the href property is read-only for the img Document Object Model (DOM) object
    if (el.tagName.toLowerCase() === 'img' && propName === 'href') {
      continue;
    }

    // Special case: dataset
    // we can iterate over .dataset with a simple for..in loop.
    // The all-time foo with data-* attribs is the dash-snake to camelCase
    // conversion.
    //
    // *This is compatible with h(), but not with every browser, thus this section was removed in favor
    // of attributes (specified below)!*
    //
    // .dataset properties are directly accessible as transparent getters/setters, so
    // patching with vdom is possible.
    /*if("dataset" == propName) {
      var data = {}
      for(var p in el.dataset) {
        data[p] = el.dataset[p]
      }
      obj[propName] = data
      return
    }*/

    // Special case: attributes
    // these are a NamedNodeMap, but we can just convert them to a hash for vdom,
    // because of https://github.com/Matt-Esch/virtual-dom/blob/master/vdom/apply-properties.js#L57
    if("attributes" == propName){
      var atts = Array.prototype.slice.call(el[propName]);
      var hash = {}
      for(var k=0; k<atts.length; k++){
        var name = atts[k].name;
        if(obj[name] || obj[attrBlacklist[name]]) continue;
        hash[name] = el.getAttribute(name);
      }
      obj[propName] = hash;
      continue
    }
    if("tabIndex" == propName && el.tabIndex === -1) continue

    // Special case: contentEditable
    // browser use 'inherit' by default on all nodes, but does not allow setting it to ''
    // diffing virtualize dom will trigger error
    // ref: https://github.com/Matt-Esch/virtual-dom/issues/176
    if("contentEditable" == propName && el[propName] === 'inherit') continue

    if('object' === typeof el[propName]) continue

    // default: just copy the property
    obj[propName] = el[propName]
  }

  return obj
}

var elementReadOnlyProperties = {
  'select': [
    'type'
  ]
};

/**
 * DOMNode property white list
 * Taken from https://github.com/Raynos/react/blob/dom-property-config/src/browser/ui/dom/DefaultDOMPropertyConfig.js
 */
var props =

module.exports.properties = [
 "accept"
,"accessKey"
,"action"
,"alt"
,"async"
,"autoComplete"
,"autoPlay"
,"cellPadding"
,"cellSpacing"
,"checked"
,"className"
,"colSpan"
,"content"
,"contentEditable"
,"controls"
,"crossOrigin"
,"data"
//,"dataset" removed since attributes handles data-attributes
,"defer"
,"dir"
,"download"
,"draggable"
,"encType"
,"formNoValidate"
,"href"
,"hrefLang"
,"htmlFor"
,"httpEquiv"
,"icon"
,"id"
,"label"
,"lang"
,"list"
,"loop"
,"max"
,"mediaGroup"
,"method"
,"min"
,"multiple"
,"muted"
,"name"
,"noValidate"
,"pattern"
,"placeholder"
,"poster"
,"preload"
,"radioGroup"
,"readOnly"
,"rel"
,"required"
,"rowSpan"
,"sandbox"
,"scope"
,"scrollLeft"
,"scrolling"
,"scrollTop"
,"selected"
,"span"
,"spellCheck"
,"src"
,"srcDoc"
,"srcSet"
,"start"
,"step"
,"style"
,"tabIndex"
,"target"
,"title"
,"type"
,"value"

// Non-standard Properties
,"autoCapitalize"
,"autoCorrect"
,"property"

, "attributes"
]

var attrBlacklist =
module.exports.attrBlacklist = {
  'class': 'className'
}

},{"./vcomment":16,"virtual-dom/vnode/vnode":48,"virtual-dom/vnode/vtext":50}],16:[function(require,module,exports){
module.exports = VirtualComment

function VirtualComment(text) {
  this.text = String(text)
}

VirtualComment.prototype.type = 'Widget'

VirtualComment.prototype.init = function() {
  return document.createComment(this.text)
}

VirtualComment.prototype.update = function(previous, domNode) {
  if(this.text === previous.text) return
  domNode.nodeValue = this.text
}

},{}],17:[function(require,module,exports){
var createElement = require("./vdom/create-element.js")

module.exports = createElement

},{"./vdom/create-element.js":29}],18:[function(require,module,exports){
var diff = require("./vtree/diff.js")

module.exports = diff

},{"./vtree/diff.js":52}],19:[function(require,module,exports){
var h = require("./virtual-hyperscript/index.js")

module.exports = h

},{"./virtual-hyperscript/index.js":37}],20:[function(require,module,exports){
/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * ECMAScript compliant, uniform cross-browser split method
 */

/**
 * Splits a string into an array of strings using a regex or string separator. Matches of the
 * separator are not included in the result array. However, if `separator` is a regex that contains
 * capturing groups, backreferences are spliced into the result each time `separator` is matched.
 * Fixes browser bugs compared to the native `String.prototype.split` and can be used reliably
 * cross-browser.
 * @param {String} str String to split.
 * @param {RegExp|String} separator Regex or string to use for separating the string.
 * @param {Number} [limit] Maximum number of items to include in the result array.
 * @returns {Array} Array of substrings.
 * @example
 *
 * // Basic use
 * split('a b c d', ' ');
 * // -> ['a', 'b', 'c', 'd']
 *
 * // With limit
 * split('a b c d', ' ', 2);
 * // -> ['a', 'b']
 *
 * // Backreferences in result array
 * split('..word1 word2..', /([a-z]+)(\d+)/i);
 * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
 */
module.exports = (function split(undef) {

  var nativeSplit = String.prototype.split,
    compliantExecNpcg = /()??/.exec("")[1] === undef,
    // NPCG: nonparticipating capturing group
    self;

  self = function(str, separator, limit) {
    // If `separator` is not a regex, use `nativeSplit`
    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
      return nativeSplit.call(str, separator, limit);
    }
    var output = [],
      flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + // Proposed for ES6
      (separator.sticky ? "y" : ""),
      // Firefox 3+
      lastLastIndex = 0,
      // Make `global` and avoid `lastIndex` issues by working with a copy
      separator = new RegExp(separator.source, flags + "g"),
      separator2, match, lastIndex, lastLength;
    str += ""; // Type-convert
    if (!compliantExecNpcg) {
      // Doesn't need flags gy, but they don't hurt
      separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
    }
    /* Values for `limit`, per the spec:
     * If undefined: 4294967295 // Math.pow(2, 32) - 1
     * If 0, Infinity, or NaN: 0
     * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
     * If negative number: 4294967296 - Math.floor(Math.abs(limit))
     * If other: Type-convert, then use the above rules
     */
    limit = limit === undef ? -1 >>> 0 : // Math.pow(2, 32) - 1
    limit >>> 0; // ToUint32(limit)
    while (match = separator.exec(str)) {
      // `separator.lastIndex` is not reliable cross-browser
      lastIndex = match.index + match[0].length;
      if (lastIndex > lastLastIndex) {
        output.push(str.slice(lastLastIndex, match.index));
        // Fix browsers whose `exec` methods don't consistently return `undefined` for
        // nonparticipating capturing groups
        if (!compliantExecNpcg && match.length > 1) {
          match[0].replace(separator2, function() {
            for (var i = 1; i < arguments.length - 2; i++) {
              if (arguments[i] === undef) {
                match[i] = undef;
              }
            }
          });
        }
        if (match.length > 1 && match.index < str.length) {
          Array.prototype.push.apply(output, match.slice(1));
        }
        lastLength = match[0].length;
        lastLastIndex = lastIndex;
        if (output.length >= limit) {
          break;
        }
      }
      if (separator.lastIndex === match.index) {
        separator.lastIndex++; // Avoid an infinite loop
      }
    }
    if (lastLastIndex === str.length) {
      if (lastLength || !separator.test("")) {
        output.push("");
      }
    } else {
      output.push(str.slice(lastLastIndex));
    }
    return output.length > limit ? output.slice(0, limit) : output;
  };

  return self;
})();

},{}],21:[function(require,module,exports){
'use strict';

var OneVersionConstraint = require('individual/one-version');

var MY_VERSION = '7';
OneVersionConstraint('ev-store', MY_VERSION);

var hashKey = '__EV_STORE_KEY@' + MY_VERSION;

module.exports = EvStore;

function EvStore(elem) {
    var hash = elem[hashKey];

    if (!hash) {
        hash = elem[hashKey] = {};
    }

    return hash;
}

},{"individual/one-version":24}],22:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

var doccy;

if (typeof document !== 'undefined') {
    doccy = document;
} else {
    doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }
}

module.exports = doccy;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":2}],23:[function(require,module,exports){
(function (global){
'use strict';

/*global window, global*/

var root = typeof window !== 'undefined' ?
    window : typeof global !== 'undefined' ?
    global : {};

module.exports = Individual;

function Individual(key, value) {
    if (key in root) {
        return root[key];
    }

    root[key] = value;

    return value;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],24:[function(require,module,exports){
'use strict';

var Individual = require('./index.js');

module.exports = OneVersion;

function OneVersion(moduleName, version, defaultValue) {
    var key = '__INDIVIDUAL_ONE_VERSION_' + moduleName;
    var enforceKey = key + '_ENFORCE_SINGLETON';

    var versionValue = Individual(enforceKey, version);

    if (versionValue !== version) {
        throw new Error('Can only have one copy of ' +
            moduleName + '.\n' +
            'You already have version ' + versionValue +
            ' installed.\n' +
            'This means you cannot install version ' + version);
    }

    return Individual(key, defaultValue);
}

},{"./index.js":23}],25:[function(require,module,exports){
"use strict";

module.exports = function isObject(x) {
	return typeof x === "object" && x !== null;
};

},{}],26:[function(require,module,exports){
var nativeIsArray = Array.isArray
var toString = Object.prototype.toString

module.exports = nativeIsArray || isArray

function isArray(obj) {
    return toString.call(obj) === "[object Array]"
}

},{}],27:[function(require,module,exports){
var patch = require("./vdom/patch.js")

module.exports = patch

},{"./vdom/patch.js":32}],28:[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook.js")

module.exports = applyProperties

function applyProperties(node, props, previous) {
    for (var propName in props) {
        var propValue = props[propName]

        if (propValue === undefined) {
            removeProperty(node, propName, propValue, previous);
        } else if (isHook(propValue)) {
            removeProperty(node, propName, propValue, previous)
            if (propValue.hook) {
                propValue.hook(node,
                    propName,
                    previous ? previous[propName] : undefined)
            }
        } else {
            if (isObject(propValue)) {
                patchObject(node, props, previous, propName, propValue);
            } else {
                node[propName] = propValue
            }
        }
    }
}

function removeProperty(node, propName, propValue, previous) {
    if (previous) {
        var previousValue = previous[propName]

        if (!isHook(previousValue)) {
            if (propName === "attributes") {
                for (var attrName in previousValue) {
                    node.removeAttribute(attrName)
                }
            } else if (propName === "style") {
                for (var i in previousValue) {
                    node.style[i] = ""
                }
            } else if (typeof previousValue === "string") {
                node[propName] = ""
            } else {
                node[propName] = null
            }
        } else if (previousValue.unhook) {
            previousValue.unhook(node, propName, propValue)
        }
    }
}

function patchObject(node, props, previous, propName, propValue) {
    var previousValue = previous ? previous[propName] : undefined

    // Set attributes
    if (propName === "attributes") {
        for (var attrName in propValue) {
            var attrValue = propValue[attrName]

            if (attrValue === undefined) {
                node.removeAttribute(attrName)
            } else {
                node.setAttribute(attrName, attrValue)
            }
        }

        return
    }

    if(previousValue && isObject(previousValue) &&
        getPrototype(previousValue) !== getPrototype(propValue)) {
        node[propName] = propValue
        return
    }

    if (!isObject(node[propName])) {
        node[propName] = {}
    }

    var replacer = propName === "style" ? "" : undefined

    for (var k in propValue) {
        var value = propValue[k]
        node[propName][k] = (value === undefined) ? replacer : value
    }
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
    }
}

},{"../vnode/is-vhook.js":43,"is-object":25}],29:[function(require,module,exports){
var document = require("global/document")

var applyProperties = require("./apply-properties")

var isVNode = require("../vnode/is-vnode.js")
var isVText = require("../vnode/is-vtext.js")
var isWidget = require("../vnode/is-widget.js")
var handleThunk = require("../vnode/handle-thunk.js")

module.exports = createElement

function createElement(vnode, opts) {
    var doc = opts ? opts.document || document : document
    var warn = opts ? opts.warn : null

    vnode = handleThunk(vnode).a

    if (isWidget(vnode)) {
        return vnode.init()
    } else if (isVText(vnode)) {
        return doc.createTextNode(vnode.text)
    } else if (!isVNode(vnode)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", vnode)
        }
        return null
    }

    var node = (vnode.namespace === null) ?
        doc.createElement(vnode.tagName) :
        doc.createElementNS(vnode.namespace, vnode.tagName)

    var props = vnode.properties
    applyProperties(node, props)

    var children = vnode.children

    for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts)
        if (childNode) {
            node.appendChild(childNode)
        }
    }

    return node
}

},{"../vnode/handle-thunk.js":41,"../vnode/is-vnode.js":44,"../vnode/is-vtext.js":45,"../vnode/is-widget.js":46,"./apply-properties":28,"global/document":22}],30:[function(require,module,exports){
// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

var noChild = {}

module.exports = domIndex

function domIndex(rootNode, tree, indices, nodes) {
    if (!indices || indices.length === 0) {
        return {}
    } else {
        indices.sort(ascending)
        return recurse(rootNode, tree, indices, nodes, 0)
    }
}

function recurse(rootNode, tree, indices, nodes, rootIndex) {
    nodes = nodes || {}


    if (rootNode) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode
        }

        var vChildren = tree.children

        if (vChildren) {

            var childNodes = rootNode.childNodes

            for (var i = 0; i < tree.children.length; i++) {
                rootIndex += 1

                var vChild = vChildren[i] || noChild
                var nextIndex = rootIndex + (vChild.count || 0)

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recurse(childNodes[i], vChild, indices, nodes, rootIndex)
                }

                rootIndex = nextIndex
            }
        }
    }

    return nodes
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false
    }

    var minIndex = 0
    var maxIndex = indices.length - 1
    var currentIndex
    var currentItem

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0
        currentItem = indices[currentIndex]

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right
        } else if (currentItem < left) {
            minIndex = currentIndex + 1
        } else  if (currentItem > right) {
            maxIndex = currentIndex - 1
        } else {
            return true
        }
    }

    return false;
}

function ascending(a, b) {
    return a > b ? 1 : -1
}

},{}],31:[function(require,module,exports){
var applyProperties = require("./apply-properties")

var isWidget = require("../vnode/is-widget.js")
var VPatch = require("../vnode/vpatch.js")

var updateWidget = require("./update-widget")

module.exports = applyPatch

function applyPatch(vpatch, domNode, renderOptions) {
    var type = vpatch.type
    var vNode = vpatch.vNode
    var patch = vpatch.patch

    switch (type) {
        case VPatch.REMOVE:
            return removeNode(domNode, vNode)
        case VPatch.INSERT:
            return insertNode(domNode, patch, renderOptions)
        case VPatch.VTEXT:
            return stringPatch(domNode, vNode, patch, renderOptions)
        case VPatch.WIDGET:
            return widgetPatch(domNode, vNode, patch, renderOptions)
        case VPatch.VNODE:
            return vNodePatch(domNode, vNode, patch, renderOptions)
        case VPatch.ORDER:
            reorderChildren(domNode, patch)
            return domNode
        case VPatch.PROPS:
            applyProperties(domNode, patch, vNode.properties)
            return domNode
        case VPatch.THUNK:
            return replaceRoot(domNode,
                renderOptions.patch(domNode, patch, renderOptions))
        default:
            return domNode
    }
}

function removeNode(domNode, vNode) {
    var parentNode = domNode.parentNode

    if (parentNode) {
        parentNode.removeChild(domNode)
    }

    destroyWidget(domNode, vNode);

    return null
}

function insertNode(parentNode, vNode, renderOptions) {
    var newNode = renderOptions.render(vNode, renderOptions)

    if (parentNode) {
        parentNode.appendChild(newNode)
    }

    return parentNode
}

function stringPatch(domNode, leftVNode, vText, renderOptions) {
    var newNode

    if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, vText.text)
        newNode = domNode
    } else {
        var parentNode = domNode.parentNode
        newNode = renderOptions.render(vText, renderOptions)

        if (parentNode && newNode !== domNode) {
            parentNode.replaceChild(newNode, domNode)
        }
    }

    return newNode
}

function widgetPatch(domNode, leftVNode, widget, renderOptions) {
    var updating = updateWidget(leftVNode, widget)
    var newNode

    if (updating) {
        newNode = widget.update(leftVNode, domNode) || domNode
    } else {
        newNode = renderOptions.render(widget, renderOptions)
    }

    var parentNode = domNode.parentNode

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    if (!updating) {
        destroyWidget(domNode, leftVNode)
    }

    return newNode
}

function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
    var parentNode = domNode.parentNode
    var newNode = renderOptions.render(vNode, renderOptions)

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    return newNode
}

function destroyWidget(domNode, w) {
    if (typeof w.destroy === "function" && isWidget(w)) {
        w.destroy(domNode)
    }
}

function reorderChildren(domNode, moves) {
    var childNodes = domNode.childNodes
    var keyMap = {}
    var node
    var remove
    var insert

    for (var i = 0; i < moves.removes.length; i++) {
        remove = moves.removes[i]
        node = childNodes[remove.from]
        if (remove.key) {
            keyMap[remove.key] = node
        }
        domNode.removeChild(node)
    }

    var length = childNodes.length
    for (var j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j]
        node = keyMap[insert.key]
        // this is the weirdest bug i've ever seen in webkit
        domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to])
    }
}

function replaceRoot(oldRoot, newRoot) {
    if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
        oldRoot.parentNode.replaceChild(newRoot, oldRoot)
    }

    return newRoot;
}

},{"../vnode/is-widget.js":46,"../vnode/vpatch.js":49,"./apply-properties":28,"./update-widget":33}],32:[function(require,module,exports){
var document = require("global/document")
var isArray = require("x-is-array")

var render = require("./create-element")
var domIndex = require("./dom-index")
var patchOp = require("./patch-op")
module.exports = patch

function patch(rootNode, patches, renderOptions) {
    renderOptions = renderOptions || {}
    renderOptions.patch = renderOptions.patch && renderOptions.patch !== patch
        ? renderOptions.patch
        : patchRecursive
    renderOptions.render = renderOptions.render || render

    return renderOptions.patch(rootNode, patches, renderOptions)
}

function patchRecursive(rootNode, patches, renderOptions) {
    var indices = patchIndices(patches)

    if (indices.length === 0) {
        return rootNode
    }

    var index = domIndex(rootNode, patches.a, indices)
    var ownerDocument = rootNode.ownerDocument

    if (!renderOptions.document && ownerDocument !== document) {
        renderOptions.document = ownerDocument
    }

    for (var i = 0; i < indices.length; i++) {
        var nodeIndex = indices[i]
        rootNode = applyPatch(rootNode,
            index[nodeIndex],
            patches[nodeIndex],
            renderOptions)
    }

    return rootNode
}

function applyPatch(rootNode, domNode, patchList, renderOptions) {
    if (!domNode) {
        return rootNode
    }

    var newNode

    if (isArray(patchList)) {
        for (var i = 0; i < patchList.length; i++) {
            newNode = patchOp(patchList[i], domNode, renderOptions)

            if (domNode === rootNode) {
                rootNode = newNode
            }
        }
    } else {
        newNode = patchOp(patchList, domNode, renderOptions)

        if (domNode === rootNode) {
            rootNode = newNode
        }
    }

    return rootNode
}

function patchIndices(patches) {
    var indices = []

    for (var key in patches) {
        if (key !== "a") {
            indices.push(Number(key))
        }
    }

    return indices
}

},{"./create-element":29,"./dom-index":30,"./patch-op":31,"global/document":22,"x-is-array":26}],33:[function(require,module,exports){
var isWidget = require("../vnode/is-widget.js")

module.exports = updateWidget

function updateWidget(a, b) {
    if (isWidget(a) && isWidget(b)) {
        if ("name" in a && "name" in b) {
            return a.id === b.id
        } else {
            return a.init === b.init
        }
    }

    return false
}

},{"../vnode/is-widget.js":46}],34:[function(require,module,exports){
'use strict';

module.exports = AttributeHook;

function AttributeHook(namespace, value) {
    if (!(this instanceof AttributeHook)) {
        return new AttributeHook(namespace, value);
    }

    this.namespace = namespace;
    this.value = value;
}

AttributeHook.prototype.hook = function (node, prop, prev) {
    if (prev && prev.type === 'AttributeHook' &&
        prev.value === this.value &&
        prev.namespace === this.namespace) {
        return;
    }

    node.setAttributeNS(this.namespace, prop, this.value);
};

AttributeHook.prototype.unhook = function (node, prop, next) {
    if (next && next.type === 'AttributeHook' &&
        next.namespace === this.namespace) {
        return;
    }

    var colonPosition = prop.indexOf(':');
    var localName = colonPosition > -1 ? prop.substr(colonPosition + 1) : prop;
    node.removeAttributeNS(this.namespace, localName);
};

AttributeHook.prototype.type = 'AttributeHook';

},{}],35:[function(require,module,exports){
'use strict';

var EvStore = require('ev-store');

module.exports = EvHook;

function EvHook(value) {
    if (!(this instanceof EvHook)) {
        return new EvHook(value);
    }

    this.value = value;
}

EvHook.prototype.hook = function (node, propertyName) {
    var es = EvStore(node);
    var propName = propertyName.substr(3);

    es[propName] = this.value;
};

EvHook.prototype.unhook = function(node, propertyName) {
    var es = EvStore(node);
    var propName = propertyName.substr(3);

    es[propName] = undefined;
};

},{"ev-store":21}],36:[function(require,module,exports){
'use strict';

module.exports = SoftSetHook;

function SoftSetHook(value) {
    if (!(this instanceof SoftSetHook)) {
        return new SoftSetHook(value);
    }

    this.value = value;
}

SoftSetHook.prototype.hook = function (node, propertyName) {
    if (node[propertyName] !== this.value) {
        node[propertyName] = this.value;
    }
};

},{}],37:[function(require,module,exports){
'use strict';

var isArray = require('x-is-array');

var VNode = require('../vnode/vnode.js');
var VText = require('../vnode/vtext.js');
var isVNode = require('../vnode/is-vnode');
var isVText = require('../vnode/is-vtext');
var isWidget = require('../vnode/is-widget');
var isHook = require('../vnode/is-vhook');
var isVThunk = require('../vnode/is-thunk');

var parseTag = require('./parse-tag.js');
var softSetHook = require('./hooks/soft-set-hook.js');
var evHook = require('./hooks/ev-hook.js');

module.exports = h;

function h(tagName, properties, children) {
    var childNodes = [];
    var tag, props, key, namespace;

    if (!children && isChildren(properties)) {
        children = properties;
        props = {};
    }

    props = props || properties || {};
    tag = parseTag(tagName, props);

    // support keys
    if (props.hasOwnProperty('key')) {
        key = props.key;
        props.key = undefined;
    }

    // support namespace
    if (props.hasOwnProperty('namespace')) {
        namespace = props.namespace;
        props.namespace = undefined;
    }

    // fix cursor bug
    if (tag === 'INPUT' &&
        !namespace &&
        props.hasOwnProperty('value') &&
        props.value !== undefined &&
        !isHook(props.value)
    ) {
        props.value = softSetHook(props.value);
    }

    transformProperties(props);

    if (children !== undefined && children !== null) {
        addChild(children, childNodes, tag, props);
    }


    return new VNode(tag, props, childNodes, key, namespace);
}

function addChild(c, childNodes, tag, props) {
    if (typeof c === 'string') {
        childNodes.push(new VText(c));
    } else if (typeof c === 'number') {
        childNodes.push(new VText(String(c)));
    } else if (isChild(c)) {
        childNodes.push(c);
    } else if (isArray(c)) {
        for (var i = 0; i < c.length; i++) {
            addChild(c[i], childNodes, tag, props);
        }
    } else if (c === null || c === undefined) {
        return;
    } else {
        throw UnexpectedVirtualElement({
            foreignObject: c,
            parentVnode: {
                tagName: tag,
                properties: props
            }
        });
    }
}

function transformProperties(props) {
    for (var propName in props) {
        if (props.hasOwnProperty(propName)) {
            var value = props[propName];

            if (isHook(value)) {
                continue;
            }

            if (propName.substr(0, 3) === 'ev-') {
                // add ev-foo support
                props[propName] = evHook(value);
            }
        }
    }
}

function isChild(x) {
    return isVNode(x) || isVText(x) || isWidget(x) || isVThunk(x);
}

function isChildren(x) {
    return typeof x === 'string' || isArray(x) || isChild(x);
}

function UnexpectedVirtualElement(data) {
    var err = new Error();

    err.type = 'virtual-hyperscript.unexpected.virtual-element';
    err.message = 'Unexpected virtual child passed to h().\n' +
        'Expected a VNode / Vthunk / VWidget / string but:\n' +
        'got:\n' +
        errorString(data.foreignObject) +
        '.\n' +
        'The parent vnode is:\n' +
        errorString(data.parentVnode)
        '\n' +
        'Suggested fix: change your `h(..., [ ... ])` callsite.';
    err.foreignObject = data.foreignObject;
    err.parentVnode = data.parentVnode;

    return err;
}

function errorString(obj) {
    try {
        return JSON.stringify(obj, null, '    ');
    } catch (e) {
        return String(obj);
    }
}

},{"../vnode/is-thunk":42,"../vnode/is-vhook":43,"../vnode/is-vnode":44,"../vnode/is-vtext":45,"../vnode/is-widget":46,"../vnode/vnode.js":48,"../vnode/vtext.js":50,"./hooks/ev-hook.js":35,"./hooks/soft-set-hook.js":36,"./parse-tag.js":38,"x-is-array":26}],38:[function(require,module,exports){
'use strict';

var split = require('browser-split');

var classIdSplit = /([\.#]?[a-zA-Z0-9\u007F-\uFFFF_:-]+)/;
var notClassId = /^\.|#/;

module.exports = parseTag;

function parseTag(tag, props) {
    if (!tag) {
        return 'DIV';
    }

    var noId = !(props.hasOwnProperty('id'));

    var tagParts = split(tag, classIdSplit);
    var tagName = null;

    if (notClassId.test(tagParts[1])) {
        tagName = 'DIV';
    }

    var classes, part, type, i;

    for (i = 0; i < tagParts.length; i++) {
        part = tagParts[i];

        if (!part) {
            continue;
        }

        type = part.charAt(0);

        if (!tagName) {
            tagName = part;
        } else if (type === '.') {
            classes = classes || [];
            classes.push(part.substring(1, part.length));
        } else if (type === '#' && noId) {
            props.id = part.substring(1, part.length);
        }
    }

    if (classes) {
        if (props.className) {
            classes.push(props.className);
        }

        props.className = classes.join(' ');
    }

    return props.namespace ? tagName : tagName.toUpperCase();
}

},{"browser-split":20}],39:[function(require,module,exports){
'use strict';

var DEFAULT_NAMESPACE = null;
var EV_NAMESPACE = 'http://www.w3.org/2001/xml-events';
var XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink';
var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';

// http://www.w3.org/TR/SVGTiny12/attributeTable.html
// http://www.w3.org/TR/SVG/attindex.html
var SVG_PROPERTIES = {
    'about': DEFAULT_NAMESPACE,
    'accent-height': DEFAULT_NAMESPACE,
    'accumulate': DEFAULT_NAMESPACE,
    'additive': DEFAULT_NAMESPACE,
    'alignment-baseline': DEFAULT_NAMESPACE,
    'alphabetic': DEFAULT_NAMESPACE,
    'amplitude': DEFAULT_NAMESPACE,
    'arabic-form': DEFAULT_NAMESPACE,
    'ascent': DEFAULT_NAMESPACE,
    'attributeName': DEFAULT_NAMESPACE,
    'attributeType': DEFAULT_NAMESPACE,
    'azimuth': DEFAULT_NAMESPACE,
    'bandwidth': DEFAULT_NAMESPACE,
    'baseFrequency': DEFAULT_NAMESPACE,
    'baseProfile': DEFAULT_NAMESPACE,
    'baseline-shift': DEFAULT_NAMESPACE,
    'bbox': DEFAULT_NAMESPACE,
    'begin': DEFAULT_NAMESPACE,
    'bias': DEFAULT_NAMESPACE,
    'by': DEFAULT_NAMESPACE,
    'calcMode': DEFAULT_NAMESPACE,
    'cap-height': DEFAULT_NAMESPACE,
    'class': DEFAULT_NAMESPACE,
    'clip': DEFAULT_NAMESPACE,
    'clip-path': DEFAULT_NAMESPACE,
    'clip-rule': DEFAULT_NAMESPACE,
    'clipPathUnits': DEFAULT_NAMESPACE,
    'color': DEFAULT_NAMESPACE,
    'color-interpolation': DEFAULT_NAMESPACE,
    'color-interpolation-filters': DEFAULT_NAMESPACE,
    'color-profile': DEFAULT_NAMESPACE,
    'color-rendering': DEFAULT_NAMESPACE,
    'content': DEFAULT_NAMESPACE,
    'contentScriptType': DEFAULT_NAMESPACE,
    'contentStyleType': DEFAULT_NAMESPACE,
    'cursor': DEFAULT_NAMESPACE,
    'cx': DEFAULT_NAMESPACE,
    'cy': DEFAULT_NAMESPACE,
    'd': DEFAULT_NAMESPACE,
    'datatype': DEFAULT_NAMESPACE,
    'defaultAction': DEFAULT_NAMESPACE,
    'descent': DEFAULT_NAMESPACE,
    'diffuseConstant': DEFAULT_NAMESPACE,
    'direction': DEFAULT_NAMESPACE,
    'display': DEFAULT_NAMESPACE,
    'divisor': DEFAULT_NAMESPACE,
    'dominant-baseline': DEFAULT_NAMESPACE,
    'dur': DEFAULT_NAMESPACE,
    'dx': DEFAULT_NAMESPACE,
    'dy': DEFAULT_NAMESPACE,
    'edgeMode': DEFAULT_NAMESPACE,
    'editable': DEFAULT_NAMESPACE,
    'elevation': DEFAULT_NAMESPACE,
    'enable-background': DEFAULT_NAMESPACE,
    'end': DEFAULT_NAMESPACE,
    'ev:event': EV_NAMESPACE,
    'event': DEFAULT_NAMESPACE,
    'exponent': DEFAULT_NAMESPACE,
    'externalResourcesRequired': DEFAULT_NAMESPACE,
    'fill': DEFAULT_NAMESPACE,
    'fill-opacity': DEFAULT_NAMESPACE,
    'fill-rule': DEFAULT_NAMESPACE,
    'filter': DEFAULT_NAMESPACE,
    'filterRes': DEFAULT_NAMESPACE,
    'filterUnits': DEFAULT_NAMESPACE,
    'flood-color': DEFAULT_NAMESPACE,
    'flood-opacity': DEFAULT_NAMESPACE,
    'focusHighlight': DEFAULT_NAMESPACE,
    'focusable': DEFAULT_NAMESPACE,
    'font-family': DEFAULT_NAMESPACE,
    'font-size': DEFAULT_NAMESPACE,
    'font-size-adjust': DEFAULT_NAMESPACE,
    'font-stretch': DEFAULT_NAMESPACE,
    'font-style': DEFAULT_NAMESPACE,
    'font-variant': DEFAULT_NAMESPACE,
    'font-weight': DEFAULT_NAMESPACE,
    'format': DEFAULT_NAMESPACE,
    'from': DEFAULT_NAMESPACE,
    'fx': DEFAULT_NAMESPACE,
    'fy': DEFAULT_NAMESPACE,
    'g1': DEFAULT_NAMESPACE,
    'g2': DEFAULT_NAMESPACE,
    'glyph-name': DEFAULT_NAMESPACE,
    'glyph-orientation-horizontal': DEFAULT_NAMESPACE,
    'glyph-orientation-vertical': DEFAULT_NAMESPACE,
    'glyphRef': DEFAULT_NAMESPACE,
    'gradientTransform': DEFAULT_NAMESPACE,
    'gradientUnits': DEFAULT_NAMESPACE,
    'handler': DEFAULT_NAMESPACE,
    'hanging': DEFAULT_NAMESPACE,
    'height': DEFAULT_NAMESPACE,
    'horiz-adv-x': DEFAULT_NAMESPACE,
    'horiz-origin-x': DEFAULT_NAMESPACE,
    'horiz-origin-y': DEFAULT_NAMESPACE,
    'id': DEFAULT_NAMESPACE,
    'ideographic': DEFAULT_NAMESPACE,
    'image-rendering': DEFAULT_NAMESPACE,
    'in': DEFAULT_NAMESPACE,
    'in2': DEFAULT_NAMESPACE,
    'initialVisibility': DEFAULT_NAMESPACE,
    'intercept': DEFAULT_NAMESPACE,
    'k': DEFAULT_NAMESPACE,
    'k1': DEFAULT_NAMESPACE,
    'k2': DEFAULT_NAMESPACE,
    'k3': DEFAULT_NAMESPACE,
    'k4': DEFAULT_NAMESPACE,
    'kernelMatrix': DEFAULT_NAMESPACE,
    'kernelUnitLength': DEFAULT_NAMESPACE,
    'kerning': DEFAULT_NAMESPACE,
    'keyPoints': DEFAULT_NAMESPACE,
    'keySplines': DEFAULT_NAMESPACE,
    'keyTimes': DEFAULT_NAMESPACE,
    'lang': DEFAULT_NAMESPACE,
    'lengthAdjust': DEFAULT_NAMESPACE,
    'letter-spacing': DEFAULT_NAMESPACE,
    'lighting-color': DEFAULT_NAMESPACE,
    'limitingConeAngle': DEFAULT_NAMESPACE,
    'local': DEFAULT_NAMESPACE,
    'marker-end': DEFAULT_NAMESPACE,
    'marker-mid': DEFAULT_NAMESPACE,
    'marker-start': DEFAULT_NAMESPACE,
    'markerHeight': DEFAULT_NAMESPACE,
    'markerUnits': DEFAULT_NAMESPACE,
    'markerWidth': DEFAULT_NAMESPACE,
    'mask': DEFAULT_NAMESPACE,
    'maskContentUnits': DEFAULT_NAMESPACE,
    'maskUnits': DEFAULT_NAMESPACE,
    'mathematical': DEFAULT_NAMESPACE,
    'max': DEFAULT_NAMESPACE,
    'media': DEFAULT_NAMESPACE,
    'mediaCharacterEncoding': DEFAULT_NAMESPACE,
    'mediaContentEncodings': DEFAULT_NAMESPACE,
    'mediaSize': DEFAULT_NAMESPACE,
    'mediaTime': DEFAULT_NAMESPACE,
    'method': DEFAULT_NAMESPACE,
    'min': DEFAULT_NAMESPACE,
    'mode': DEFAULT_NAMESPACE,
    'name': DEFAULT_NAMESPACE,
    'nav-down': DEFAULT_NAMESPACE,
    'nav-down-left': DEFAULT_NAMESPACE,
    'nav-down-right': DEFAULT_NAMESPACE,
    'nav-left': DEFAULT_NAMESPACE,
    'nav-next': DEFAULT_NAMESPACE,
    'nav-prev': DEFAULT_NAMESPACE,
    'nav-right': DEFAULT_NAMESPACE,
    'nav-up': DEFAULT_NAMESPACE,
    'nav-up-left': DEFAULT_NAMESPACE,
    'nav-up-right': DEFAULT_NAMESPACE,
    'numOctaves': DEFAULT_NAMESPACE,
    'observer': DEFAULT_NAMESPACE,
    'offset': DEFAULT_NAMESPACE,
    'opacity': DEFAULT_NAMESPACE,
    'operator': DEFAULT_NAMESPACE,
    'order': DEFAULT_NAMESPACE,
    'orient': DEFAULT_NAMESPACE,
    'orientation': DEFAULT_NAMESPACE,
    'origin': DEFAULT_NAMESPACE,
    'overflow': DEFAULT_NAMESPACE,
    'overlay': DEFAULT_NAMESPACE,
    'overline-position': DEFAULT_NAMESPACE,
    'overline-thickness': DEFAULT_NAMESPACE,
    'panose-1': DEFAULT_NAMESPACE,
    'path': DEFAULT_NAMESPACE,
    'pathLength': DEFAULT_NAMESPACE,
    'patternContentUnits': DEFAULT_NAMESPACE,
    'patternTransform': DEFAULT_NAMESPACE,
    'patternUnits': DEFAULT_NAMESPACE,
    'phase': DEFAULT_NAMESPACE,
    'playbackOrder': DEFAULT_NAMESPACE,
    'pointer-events': DEFAULT_NAMESPACE,
    'points': DEFAULT_NAMESPACE,
    'pointsAtX': DEFAULT_NAMESPACE,
    'pointsAtY': DEFAULT_NAMESPACE,
    'pointsAtZ': DEFAULT_NAMESPACE,
    'preserveAlpha': DEFAULT_NAMESPACE,
    'preserveAspectRatio': DEFAULT_NAMESPACE,
    'primitiveUnits': DEFAULT_NAMESPACE,
    'propagate': DEFAULT_NAMESPACE,
    'property': DEFAULT_NAMESPACE,
    'r': DEFAULT_NAMESPACE,
    'radius': DEFAULT_NAMESPACE,
    'refX': DEFAULT_NAMESPACE,
    'refY': DEFAULT_NAMESPACE,
    'rel': DEFAULT_NAMESPACE,
    'rendering-intent': DEFAULT_NAMESPACE,
    'repeatCount': DEFAULT_NAMESPACE,
    'repeatDur': DEFAULT_NAMESPACE,
    'requiredExtensions': DEFAULT_NAMESPACE,
    'requiredFeatures': DEFAULT_NAMESPACE,
    'requiredFonts': DEFAULT_NAMESPACE,
    'requiredFormats': DEFAULT_NAMESPACE,
    'resource': DEFAULT_NAMESPACE,
    'restart': DEFAULT_NAMESPACE,
    'result': DEFAULT_NAMESPACE,
    'rev': DEFAULT_NAMESPACE,
    'role': DEFAULT_NAMESPACE,
    'rotate': DEFAULT_NAMESPACE,
    'rx': DEFAULT_NAMESPACE,
    'ry': DEFAULT_NAMESPACE,
    'scale': DEFAULT_NAMESPACE,
    'seed': DEFAULT_NAMESPACE,
    'shape-rendering': DEFAULT_NAMESPACE,
    'slope': DEFAULT_NAMESPACE,
    'snapshotTime': DEFAULT_NAMESPACE,
    'spacing': DEFAULT_NAMESPACE,
    'specularConstant': DEFAULT_NAMESPACE,
    'specularExponent': DEFAULT_NAMESPACE,
    'spreadMethod': DEFAULT_NAMESPACE,
    'startOffset': DEFAULT_NAMESPACE,
    'stdDeviation': DEFAULT_NAMESPACE,
    'stemh': DEFAULT_NAMESPACE,
    'stemv': DEFAULT_NAMESPACE,
    'stitchTiles': DEFAULT_NAMESPACE,
    'stop-color': DEFAULT_NAMESPACE,
    'stop-opacity': DEFAULT_NAMESPACE,
    'strikethrough-position': DEFAULT_NAMESPACE,
    'strikethrough-thickness': DEFAULT_NAMESPACE,
    'string': DEFAULT_NAMESPACE,
    'stroke': DEFAULT_NAMESPACE,
    'stroke-dasharray': DEFAULT_NAMESPACE,
    'stroke-dashoffset': DEFAULT_NAMESPACE,
    'stroke-linecap': DEFAULT_NAMESPACE,
    'stroke-linejoin': DEFAULT_NAMESPACE,
    'stroke-miterlimit': DEFAULT_NAMESPACE,
    'stroke-opacity': DEFAULT_NAMESPACE,
    'stroke-width': DEFAULT_NAMESPACE,
    'surfaceScale': DEFAULT_NAMESPACE,
    'syncBehavior': DEFAULT_NAMESPACE,
    'syncBehaviorDefault': DEFAULT_NAMESPACE,
    'syncMaster': DEFAULT_NAMESPACE,
    'syncTolerance': DEFAULT_NAMESPACE,
    'syncToleranceDefault': DEFAULT_NAMESPACE,
    'systemLanguage': DEFAULT_NAMESPACE,
    'tableValues': DEFAULT_NAMESPACE,
    'target': DEFAULT_NAMESPACE,
    'targetX': DEFAULT_NAMESPACE,
    'targetY': DEFAULT_NAMESPACE,
    'text-anchor': DEFAULT_NAMESPACE,
    'text-decoration': DEFAULT_NAMESPACE,
    'text-rendering': DEFAULT_NAMESPACE,
    'textLength': DEFAULT_NAMESPACE,
    'timelineBegin': DEFAULT_NAMESPACE,
    'title': DEFAULT_NAMESPACE,
    'to': DEFAULT_NAMESPACE,
    'transform': DEFAULT_NAMESPACE,
    'transformBehavior': DEFAULT_NAMESPACE,
    'type': DEFAULT_NAMESPACE,
    'typeof': DEFAULT_NAMESPACE,
    'u1': DEFAULT_NAMESPACE,
    'u2': DEFAULT_NAMESPACE,
    'underline-position': DEFAULT_NAMESPACE,
    'underline-thickness': DEFAULT_NAMESPACE,
    'unicode': DEFAULT_NAMESPACE,
    'unicode-bidi': DEFAULT_NAMESPACE,
    'unicode-range': DEFAULT_NAMESPACE,
    'units-per-em': DEFAULT_NAMESPACE,
    'v-alphabetic': DEFAULT_NAMESPACE,
    'v-hanging': DEFAULT_NAMESPACE,
    'v-ideographic': DEFAULT_NAMESPACE,
    'v-mathematical': DEFAULT_NAMESPACE,
    'values': DEFAULT_NAMESPACE,
    'version': DEFAULT_NAMESPACE,
    'vert-adv-y': DEFAULT_NAMESPACE,
    'vert-origin-x': DEFAULT_NAMESPACE,
    'vert-origin-y': DEFAULT_NAMESPACE,
    'viewBox': DEFAULT_NAMESPACE,
    'viewTarget': DEFAULT_NAMESPACE,
    'visibility': DEFAULT_NAMESPACE,
    'width': DEFAULT_NAMESPACE,
    'widths': DEFAULT_NAMESPACE,
    'word-spacing': DEFAULT_NAMESPACE,
    'writing-mode': DEFAULT_NAMESPACE,
    'x': DEFAULT_NAMESPACE,
    'x-height': DEFAULT_NAMESPACE,
    'x1': DEFAULT_NAMESPACE,
    'x2': DEFAULT_NAMESPACE,
    'xChannelSelector': DEFAULT_NAMESPACE,
    'xlink:actuate': XLINK_NAMESPACE,
    'xlink:arcrole': XLINK_NAMESPACE,
    'xlink:href': XLINK_NAMESPACE,
    'xlink:role': XLINK_NAMESPACE,
    'xlink:show': XLINK_NAMESPACE,
    'xlink:title': XLINK_NAMESPACE,
    'xlink:type': XLINK_NAMESPACE,
    'xml:base': XML_NAMESPACE,
    'xml:id': XML_NAMESPACE,
    'xml:lang': XML_NAMESPACE,
    'xml:space': XML_NAMESPACE,
    'y': DEFAULT_NAMESPACE,
    'y1': DEFAULT_NAMESPACE,
    'y2': DEFAULT_NAMESPACE,
    'yChannelSelector': DEFAULT_NAMESPACE,
    'z': DEFAULT_NAMESPACE,
    'zoomAndPan': DEFAULT_NAMESPACE
};

module.exports = SVGAttributeNamespace;

function SVGAttributeNamespace(value) {
  if (SVG_PROPERTIES.hasOwnProperty(value)) {
    return SVG_PROPERTIES[value];
  }
}

},{}],40:[function(require,module,exports){
'use strict';

var isArray = require('x-is-array');

var h = require('./index.js');


var SVGAttributeNamespace = require('./svg-attribute-namespace');
var attributeHook = require('./hooks/attribute-hook');

var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

module.exports = svg;

function svg(tagName, properties, children) {
    if (!children && isChildren(properties)) {
        children = properties;
        properties = {};
    }

    properties = properties || {};

    // set namespace for svg
    properties.namespace = SVG_NAMESPACE;

    var attributes = properties.attributes || (properties.attributes = {});

    for (var key in properties) {
        if (!properties.hasOwnProperty(key)) {
            continue;
        }

        var namespace = SVGAttributeNamespace(key);

        if (namespace === undefined) { // not a svg attribute
            continue;
        }

        var value = properties[key];

        if (typeof value !== 'string' &&
            typeof value !== 'number' &&
            typeof value !== 'boolean'
        ) {
            continue;
        }

        if (namespace !== null) { // namespaced attribute
            properties[key] = attributeHook(namespace, value);
            continue;
        }

        attributes[key] = value
        properties[key] = undefined
    }

    return h(tagName, properties, children);
}

function isChildren(x) {
    return typeof x === 'string' || isArray(x);
}

},{"./hooks/attribute-hook":34,"./index.js":37,"./svg-attribute-namespace":39,"x-is-array":26}],41:[function(require,module,exports){
var isVNode = require("./is-vnode")
var isVText = require("./is-vtext")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")

module.exports = handleThunk

function handleThunk(a, b) {
    var renderedA = a
    var renderedB = b

    if (isThunk(b)) {
        renderedB = renderThunk(b, a)
    }

    if (isThunk(a)) {
        renderedA = renderThunk(a, null)
    }

    return {
        a: renderedA,
        b: renderedB
    }
}

function renderThunk(thunk, previous) {
    var renderedThunk = thunk.vnode

    if (!renderedThunk) {
        renderedThunk = thunk.vnode = thunk.render(previous)
    }

    if (!(isVNode(renderedThunk) ||
            isVText(renderedThunk) ||
            isWidget(renderedThunk))) {
        throw new Error("thunk did not return a valid node");
    }

    return renderedThunk
}

},{"./is-thunk":42,"./is-vnode":44,"./is-vtext":45,"./is-widget":46}],42:[function(require,module,exports){
module.exports = isThunk

function isThunk(t) {
    return t && t.type === "Thunk"
}

},{}],43:[function(require,module,exports){
module.exports = isHook

function isHook(hook) {
    return hook &&
      (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") ||
       typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"))
}

},{}],44:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version
}

},{"./version":47}],45:[function(require,module,exports){
var version = require("./version")

module.exports = isVirtualText

function isVirtualText(x) {
    return x && x.type === "VirtualText" && x.version === version
}

},{"./version":47}],46:[function(require,module,exports){
module.exports = isWidget

function isWidget(w) {
    return w && w.type === "Widget"
}

},{}],47:[function(require,module,exports){
module.exports = "2"

},{}],48:[function(require,module,exports){
var version = require("./version")
var isVNode = require("./is-vnode")
var isWidget = require("./is-widget")
var isThunk = require("./is-thunk")
var isVHook = require("./is-vhook")

module.exports = VirtualNode

var noProperties = {}
var noChildren = []

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName
    this.properties = properties || noProperties
    this.children = children || noChildren
    this.key = key != null ? String(key) : undefined
    this.namespace = (typeof namespace === "string") ? namespace : null

    var count = (children && children.length) || 0
    var descendants = 0
    var hasWidgets = false
    var hasThunks = false
    var descendantHooks = false
    var hooks

    for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            var property = properties[propName]
            if (isVHook(property) && property.unhook) {
                if (!hooks) {
                    hooks = {}
                }

                hooks[propName] = property
            }
        }
    }

    for (var i = 0; i < count; i++) {
        var child = children[i]
        if (isVNode(child)) {
            descendants += child.count || 0

            if (!hasWidgets && child.hasWidgets) {
                hasWidgets = true
            }

            if (!hasThunks && child.hasThunks) {
                hasThunks = true
            }

            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                descendantHooks = true
            }
        } else if (!hasWidgets && isWidget(child)) {
            if (typeof child.destroy === "function") {
                hasWidgets = true
            }
        } else if (!hasThunks && isThunk(child)) {
            hasThunks = true;
        }
    }

    this.count = count + descendants
    this.hasWidgets = hasWidgets
    this.hasThunks = hasThunks
    this.hooks = hooks
    this.descendantHooks = descendantHooks
}

VirtualNode.prototype.version = version
VirtualNode.prototype.type = "VirtualNode"

},{"./is-thunk":42,"./is-vhook":43,"./is-vnode":44,"./is-widget":46,"./version":47}],49:[function(require,module,exports){
var version = require("./version")

VirtualPatch.NONE = 0
VirtualPatch.VTEXT = 1
VirtualPatch.VNODE = 2
VirtualPatch.WIDGET = 3
VirtualPatch.PROPS = 4
VirtualPatch.ORDER = 5
VirtualPatch.INSERT = 6
VirtualPatch.REMOVE = 7
VirtualPatch.THUNK = 8

module.exports = VirtualPatch

function VirtualPatch(type, vNode, patch) {
    this.type = Number(type)
    this.vNode = vNode
    this.patch = patch
}

VirtualPatch.prototype.version = version
VirtualPatch.prototype.type = "VirtualPatch"

},{"./version":47}],50:[function(require,module,exports){
var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"

},{"./version":47}],51:[function(require,module,exports){
var isObject = require("is-object")
var isHook = require("../vnode/is-vhook")

module.exports = diffProps

function diffProps(a, b) {
    var diff

    for (var aKey in a) {
        if (!(aKey in b)) {
            diff = diff || {}
            diff[aKey] = undefined
        }

        var aValue = a[aKey]
        var bValue = b[aKey]

        if (aValue === bValue) {
            continue
        } else if (isObject(aValue) && isObject(bValue)) {
            if (getPrototype(bValue) !== getPrototype(aValue)) {
                diff = diff || {}
                diff[aKey] = bValue
            } else if (isHook(bValue)) {
                 diff = diff || {}
                 diff[aKey] = bValue
            } else {
                var objectDiff = diffProps(aValue, bValue)
                if (objectDiff) {
                    diff = diff || {}
                    diff[aKey] = objectDiff
                }
            }
        } else {
            diff = diff || {}
            diff[aKey] = bValue
        }
    }

    for (var bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {}
            diff[bKey] = b[bKey]
        }
    }

    return diff
}

function getPrototype(value) {
  if (Object.getPrototypeOf) {
    return Object.getPrototypeOf(value)
  } else if (value.__proto__) {
    return value.__proto__
  } else if (value.constructor) {
    return value.constructor.prototype
  }
}

},{"../vnode/is-vhook":43,"is-object":25}],52:[function(require,module,exports){
var isArray = require("x-is-array")

var VPatch = require("../vnode/vpatch")
var isVNode = require("../vnode/is-vnode")
var isVText = require("../vnode/is-vtext")
var isWidget = require("../vnode/is-widget")
var isThunk = require("../vnode/is-thunk")
var handleThunk = require("../vnode/handle-thunk")

var diffProps = require("./diff-props")

module.exports = diff

function diff(a, b) {
    var patch = { a: a }
    walk(a, b, patch, 0)
    return patch
}

function walk(a, b, patch, index) {
    if (a === b) {
        return
    }

    var apply = patch[index]
    var applyClear = false

    if (isThunk(a) || isThunk(b)) {
        thunks(a, b, patch, index)
    } else if (b == null) {

        // If a is a widget we will add a remove patch for it
        // Otherwise any child widgets/hooks must be destroyed.
        // This prevents adding two remove patches for a widget.
        if (!isWidget(a)) {
            clearState(a, patch, index)
            apply = patch[index]
        }

        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b))
    } else if (isVNode(b)) {
        if (isVNode(a)) {
            if (a.tagName === b.tagName &&
                a.namespace === b.namespace &&
                a.key === b.key) {
                var propsPatch = diffProps(a.properties, b.properties)
                if (propsPatch) {
                    apply = appendPatch(apply,
                        new VPatch(VPatch.PROPS, a, propsPatch))
                }
                apply = diffChildren(a, b, patch, apply, index)
            } else {
                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
                applyClear = true
            }
        } else {
            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
            applyClear = true
        }
    } else if (isVText(b)) {
        if (!isVText(a)) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
            applyClear = true
        } else if (a.text !== b.text) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
        }
    } else if (isWidget(b)) {
        if (!isWidget(a)) {
            applyClear = true
        }

        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b))
    }

    if (apply) {
        patch[index] = apply
    }

    if (applyClear) {
        clearState(a, patch, index)
    }
}

function diffChildren(a, b, patch, apply, index) {
    var aChildren = a.children
    var orderedSet = reorder(aChildren, b.children)
    var bChildren = orderedSet.children

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen

    for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i]
        var rightNode = bChildren[i]
        index += 1

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply,
                    new VPatch(VPatch.INSERT, null, rightNode))
            }
        } else {
            walk(leftNode, rightNode, patch, index)
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
    }

    if (orderedSet.moves) {
        // Reorder nodes last
        apply = appendPatch(apply, new VPatch(
            VPatch.ORDER,
            a,
            orderedSet.moves
        ))
    }

    return apply
}

function clearState(vNode, patch, index) {
    // TODO: Make this a single walk, not two
    unhook(vNode, patch, index)
    destroyWidgets(vNode, patch, index)
}

// Patch records for all destroyed widgets must be added because we need
// a DOM node reference for the destroy function
function destroyWidgets(vNode, patch, index) {
    if (isWidget(vNode)) {
        if (typeof vNode.destroy === "function") {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(VPatch.REMOVE, vNode, null)
            )
        }
    } else if (isVNode(vNode) && (vNode.hasWidgets || vNode.hasThunks)) {
        var children = vNode.children
        var len = children.length
        for (var i = 0; i < len; i++) {
            var child = children[i]
            index += 1

            destroyWidgets(child, patch, index)

            if (isVNode(child) && child.count) {
                index += child.count
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

// Create a sub-patch for thunks
function thunks(a, b, patch, index) {
    var nodes = handleThunk(a, b)
    var thunkPatch = diff(nodes.a, nodes.b)
    if (hasPatches(thunkPatch)) {
        patch[index] = new VPatch(VPatch.THUNK, null, thunkPatch)
    }
}

function hasPatches(patch) {
    for (var index in patch) {
        if (index !== "a") {
            return true
        }
    }

    return false
}

// Execute hooks when two nodes are identical
function unhook(vNode, patch, index) {
    if (isVNode(vNode)) {
        if (vNode.hooks) {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(
                    VPatch.PROPS,
                    vNode,
                    undefinedKeys(vNode.hooks)
                )
            )
        }

        if (vNode.descendantHooks || vNode.hasThunks) {
            var children = vNode.children
            var len = children.length
            for (var i = 0; i < len; i++) {
                var child = children[i]
                index += 1

                unhook(child, patch, index)

                if (isVNode(child) && child.count) {
                    index += child.count
                }
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

function undefinedKeys(obj) {
    var result = {}

    for (var key in obj) {
        result[key] = undefined
    }

    return result
}

// List diff, naive left to right reordering
function reorder(aChildren, bChildren) {
    // O(M) time, O(M) memory
    var bChildIndex = keyIndex(bChildren)
    var bKeys = bChildIndex.keys
    var bFree = bChildIndex.free

    if (bFree.length === bChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(N) time, O(N) memory
    var aChildIndex = keyIndex(aChildren)
    var aKeys = aChildIndex.keys
    var aFree = aChildIndex.free

    if (aFree.length === aChildren.length) {
        return {
            children: bChildren,
            moves: null
        }
    }

    // O(MAX(N, M)) memory
    var newChildren = []

    var freeIndex = 0
    var freeCount = bFree.length
    var deletedItems = 0

    // Iterate through a and match a node in b
    // O(N) time,
    for (var i = 0 ; i < aChildren.length; i++) {
        var aItem = aChildren[i]
        var itemIndex

        if (aItem.key) {
            if (bKeys.hasOwnProperty(aItem.key)) {
                // Match up the old keys
                itemIndex = bKeys[aItem.key]
                newChildren.push(bChildren[itemIndex])

            } else {
                // Remove old keyed items
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        } else {
            // Match the item in a with the next free item in b
            if (freeIndex < freeCount) {
                itemIndex = bFree[freeIndex++]
                newChildren.push(bChildren[itemIndex])
            } else {
                // There are no free items in b to match with
                // the free items in a, so the extra free nodes
                // are deleted.
                itemIndex = i - deletedItems++
                newChildren.push(null)
            }
        }
    }

    var lastFreeIndex = freeIndex >= bFree.length ?
        bChildren.length :
        bFree[freeIndex]

    // Iterate through b and append any new keys
    // O(M) time
    for (var j = 0; j < bChildren.length; j++) {
        var newItem = bChildren[j]

        if (newItem.key) {
            if (!aKeys.hasOwnProperty(newItem.key)) {
                // Add any new keyed items
                // We are adding new items to the end and then sorting them
                // in place. In future we should insert new items in place.
                newChildren.push(newItem)
            }
        } else if (j >= lastFreeIndex) {
            // Add any leftover non-keyed items
            newChildren.push(newItem)
        }
    }

    var simulate = newChildren.slice()
    var simulateIndex = 0
    var removes = []
    var inserts = []
    var simulateItem

    for (var k = 0; k < bChildren.length;) {
        var wantedItem = bChildren[k]
        simulateItem = simulate[simulateIndex]

        // remove items
        while (simulateItem === null && simulate.length) {
            removes.push(remove(simulate, simulateIndex, null))
            simulateItem = simulate[simulateIndex]
        }

        if (!simulateItem || simulateItem.key !== wantedItem.key) {
            // if we need a key in this position...
            if (wantedItem.key) {
                if (simulateItem && simulateItem.key) {
                    // if an insert doesn't put this key in place, it needs to move
                    if (bKeys[simulateItem.key] !== k + 1) {
                        removes.push(remove(simulate, simulateIndex, simulateItem.key))
                        simulateItem = simulate[simulateIndex]
                        // if the remove didn't put the wanted item in place, we need to insert it
                        if (!simulateItem || simulateItem.key !== wantedItem.key) {
                            inserts.push({key: wantedItem.key, to: k})
                        }
                        // items are matching, so skip ahead
                        else {
                            simulateIndex++
                        }
                    }
                    else {
                        inserts.push({key: wantedItem.key, to: k})
                    }
                }
                else {
                    inserts.push({key: wantedItem.key, to: k})
                }
                k++
            }
            // a key in simulate has no matching wanted key, remove it
            else if (simulateItem && simulateItem.key) {
                removes.push(remove(simulate, simulateIndex, simulateItem.key))
            }
        }
        else {
            simulateIndex++
            k++
        }
    }

    // remove all the remaining nodes from simulate
    while(simulateIndex < simulate.length) {
        simulateItem = simulate[simulateIndex]
        removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key))
    }

    // If the only moves we have are deletes then we can just
    // let the delete patch remove these items.
    if (removes.length === deletedItems && !inserts.length) {
        return {
            children: newChildren,
            moves: null
        }
    }

    return {
        children: newChildren,
        moves: {
            removes: removes,
            inserts: inserts
        }
    }
}

function remove(arr, index, key) {
    arr.splice(index, 1)

    return {
        from: index,
        key: key
    }
}

function keyIndex(children) {
    var keys = {}
    var free = []
    var length = children.length

    for (var i = 0; i < length; i++) {
        var child = children[i]

        if (child.key) {
            keys[child.key] = i
        } else {
            free.push(i)
        }
    }

    return {
        keys: keys,     // A hash of key name to index
        free: free      // An array of unkeyed item indices
    }
}

function appendPatch(apply, patch) {
    if (apply) {
        if (isArray(apply)) {
            apply.push(patch)
        } else {
            apply = [apply, patch]
        }

        return apply
    } else {
        return patch
    }
}

},{"../vnode/handle-thunk":41,"../vnode/is-thunk":42,"../vnode/is-vnode":44,"../vnode/is-vtext":45,"../vnode/is-widget":46,"../vnode/vpatch":49,"./diff-props":51,"x-is-array":26}],53:[function(require,module,exports){
const DOMReady = require('document-ready-promise')();
const defaults = require('defaults-es6');
const mix = require('mixwith').mix;
const EventEmitterMixin = require('./event-emitter-mixin');
const VDOMPatch = require('virtual-dom/patch');
const VDOMDiff = require('virtual-dom/diff');
const h = require('virtual-dom/h');
const virtualize = require('vdom-virtualize');

const defaultOpts = {
    childStylesFirst: true,
    verbosity: 0,
    quietInterval: 100
};

const patchInterval = 33.334;

function createStyleEl(id, className=null) {
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
            value: {app: this, components: {}, verbosity: opts.verbosity }
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

    async makeComponent() {
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
            this._widget = virtualize(this.rootNode, 'id');
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
            .then(() => {
                this.el.classList.add('first-markup-render-complete', 'first-styles-render-complete', 'first-render-complete');
            })
    }

    init() {
        this.on('createcomponent', evt => {
            this._createdComponents.push(evt.component);
        })

        return DOMReady
            .then(async () => {
                window.dispatchEvent(new CustomEvent('weddellinitbefore', { detail: {  app: this } }));

                this.initPatchers();

                if (this._snapshotData) {
                    this.el.classList.add('using-snapshot');
                }
                this.el.classList.add('initting');
                this.el.classList.remove('init-complete', 'first-markup-render-complete', 'first-styles-render-complete', 'first-render-complete');

                this._component = await this.makeComponent();
                    
                this.trigger('createcomponent', {component: this.component});
                this.trigger('createrootcomponent', {component: this.component});
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
                    var isRendering = this.component.reduceComponents((acc, component) =>  acc || !!component.renderPromise, false)
                    if (!isRendering) {
                        this.trigger('quiet');
                    }
                    this.el.classList.add('first-patch-complete');
                    this.component.trigger('patch');
                };
                this.on('patch', onPatch);                

                Object.seal(this);

                return this._initPromise = this.initRootComponent()
            })
            .then(result => {
                window.dispatchEvent(new CustomEvent('weddellinit', { detail: { app: this } }));
                this.el.classList.remove('initting');
                this.el.classList.add('init-complete');
                return result;
            })
    }
}

module.exports = App;

},{"./event-emitter-mixin":55,"defaults-es6":8,"document-ready-promise":10,"mixwith":12,"vdom-virtualize":15,"virtual-dom/diff":18,"virtual-dom/h":19,"virtual-dom/patch":27}],54:[function(require,module,exports){
const EventEmitterMixin = require('./event-emitter-mixin');
const defaults = require('defaults-es6');
const generateHash = require('../utils/make-hash');
const mix = require('mixwith').mix;
const h = require('virtual-dom/h');
const VdomWidget = require('./vdom-widget');
const deepEqual = require('deep-equal');
const cloneVNode = require('../utils/clone-vnode');
const flatten = require('../utils/flatten');
const compact = require('../utils/compact');
const uniq = require('../utils/uniq');
const difference = require('../utils/difference');

const defaultOpts = {
    store: {},
    inputs: null,
    isRoot: false
};
const defaultInitOpts = {};
var _generatedComponentClasses = {};
const testElement = document.createElement('div');

const renderInterval = 33.333;

var Component = class extends mix(Component).with(EventEmitterMixin) {
    static get renderMethods() {
        return ['renderVNode', 'renderStyles'];
    }

    static get isWeddellComponent() {
        return true;
    }
    
    constructor(opts) {
        opts = defaults(opts, defaultOpts);
        super(opts);
        var weddellGlobals = window[this.constructor.Weddell.consts.VAR_NAME];
        var Store = this.constructor.Weddell.classes.Store;
        if (weddellGlobals.verbosity > 0 && opts.inputs) {
            console.warn('you are using outdated syntax! opts.inputs is deprecated in favor of static getter.')
        }
        Object.defineProperties(this, {
            id: { get: () => this._id },
            isRoot: { value: opts.isRoot },
            _content: {value: [], writable: true},
            content: { get: () => {
                return this._content;
            }, set: val => {
                var oldContent = this._content;
                this._content = val;
                if (!deepEqual(oldContent, val)) {
                    this.markDirty();
                }
            }},
            hasMounted: {get: () => this._hasMounted},
            isMounted: { get: () => this._isMounted },
            renderPromise: {get: () => this._renderPromise},
            childComponents: {get: () => this._childComponents},
            contentComponents: {get: () => this._contentComponents},
            hasRendered: {get: () => this._hasRendered},
            el: {get: () => this._el},
            isInit: { get: () => this._isInit },
            defaultInitOpts: { value: defaults(opts.defaultInitOpts, defaultInitOpts) },
            root: {value: opts.isRoot ? this : opts.root },
            inputs : { value: compact(this.constructor.inputs || opts.inputs || []) },
            //@TODO inputs don't need to be stored on isntance at all
            renderers: { value: {} },
            _el: { value: null, writable: true },
            _lastRenderTimeStamps: { value: this.constructor.renderMethods
                .reduce((acc, key) => Object.assign(acc, {[key]: null }), {}) },
            _lastAccessedStateKeys: { value: this.constructor.renderMethods
                .reduce((acc, key) => Object.assign(acc, {[key]: []}), {}) },
            _componentSnapshots: { value: opts.componentSnapshots || null },
            _dirtyRenderers: { value: true, writable: true },
            _contentComponents: {value: [], writable: true },
            _inlineEventHandlers: { writable: true, value: {} },
            _isMounted: {writable:true, value: null},
            _lastRenderedComponents: {writable: true, value: null},
            _childComponents: {writable: true, value: {}},
            _componentsRequestingPatch: {writable: true, value: []},
            _renderPromise: {writable: true, value: null},
            _hasMounted: {writable:true, value: false},
            _hasRendered: {writable:true, value: false},
            _widgetIsDirty: {writable:true, value:false},
            _vTree: {writable: true, value: null },
            _prevVTree: {writable: true, value: null},
            _prevWidget: {writable: true, value: null},
            _dirtyWidgets: {writable: true, value: {}},
            _renderCache: { value: this.constructor.renderMethods
                .reduce((acc, key) => Object.assign(acc, {[key]: []}), {}) },
            _isInit: { writable: true, value: false},            
            _id : { value: opts.id || generateHash() },
            _componentListenerCallbacks: {value:{}, writable:true}
        });

        var inputMappings = this.constructor._inputMappings ? Object.entries(this.constructor._inputMappings)
            .filter(entry => this.inputs.find(input => input === entry[0] || input.key === entry[0]))
            .reduce((final, entry) => {
                final[entry[1]] = entry[0];
                return final;
            }, {}) : {};

        Object.defineProperties(this, {
            _widget: {writable: true, value: new VdomWidget({ component: this, childWidgets: {} })},
            props: {
                value: new Store(this.inputs.map(input => typeof input === 'string' ? input : input.key ? input.key : null), {
                    shouldMonitorChanges: true,
                    extends: (opts.parentComponent ? [opts.parentComponent.props, opts.parentComponent.state, opts.parentComponent.store] : null),
                    inputMappings,
                    validators: this.inputs.filter(input => typeof input === 'object').reduce((final, inputObj) => Object.assign(final, {[inputObj.key]: {validator: inputObj.validator, required: inputObj.required}}), {}),
                    shouldEvalFunctions: false
                })
            },
            store: {
                value: new Store(defaults({
                    $bind: this.bindEvent.bind(this),
                    $bindValue: this.bindEventValue.bind(this)
                }, this.store || {}, opts.store || {}), {
                    shouldMonitorChanges: false,
                    shouldEvalFunctions: false
                })
            }
        });

        if (weddellGlobals.verbosity > 0 && opts.state) {
            console.warn("opts.state is deprecated in favor of static 'state' getter. Update your code!");
        }

        var state = Object.assign({}, opts.state || {}, this.constructor.state);
        
        Object.defineProperty(this, 'state', {
            value: new Store(defaults({
                $attributes: null,
                $id: () => this.id
            }, state), {
                initialState: opts.initialState,
                overrides: [this.props],
                proxies: [this.store]
            })
        })

        if (weddellGlobals.verbosity > 0 && opts.components) {
            console.warn("opts.components is deprecated in favor of static 'components' getter. Please update your code.");
        }
        var components = this.constructor.components || opts.components || {};
        
        Object.defineProperties(this, {
            _componentInstances: { value:
                Object.keys(components)
                    .map(key => key.toLowerCase())
                    .reduce((final, key) => {
                        final[key] = {};
                        return final;
                    }, {})
            },
            _locals: {value: new Store({}, { proxies: [this.state, this.store], shouldMonitorChanges: false, shouldEvalFunctions: false})}
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
        if (weddellGlobals.verbosity > 0 && opts.stylesTemplate) {
            console.warn("You are using deprecated syntax. 'stylesTemplate' will be removed in the next major version. Use static 'styles' getter for static styles, and instance 'styles' for runtime templates.");
        }
        this.vNodeTemplate = this.makeVNodeTemplate(this.constructor.markup, opts.markupTemplate);
        this.stylesTemplate = this.makeStylesTemplate(this.constructor.dynamicStyles || opts.stylesTemplate, this.constructor.styles);

        weddellGlobals.components[this._id] = this;
    }

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

    markDirty(dirtyRenderers={}) {
        if (this.renderPromise || !this.isMounted) {
            this._dirtyRenderers = Object.assign(this._dirtyRenderers || {}, dirtyRenderers)
            return this.renderPromise;
        } else {
            return this.requestRender(dirtyRenderers);
        }
    }

    render(dirtyRenderers=null) {
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
        return !this._renderPromise ? (this._renderPromise = promise): promise;
    }

    onInit() {}
    onFirstRender() {}
    onRender() {}
    onDOMCreate() {}
    onDOMMove() {}
    onDOMChange() {}
    onDOMCreateOrChange() {}
    onDOMDestroy() {}
    onMount() {}
    onUnmount() {}
    onFirstMount() {}
    onRenderMarkup() {}
    onRenderStyles() {}

    requestPatch(results) {
        this.trigger('requestpatch', {results: results ? Object.create(results) : {}, id: this.id, classId: this.constructor.id });
    }

    makeVNodeTemplate() {
        /*
        * Take instance and static template inputs, return a function that will generate the correct output.
        */

        return Array.from(arguments).reduce((acc, curr) => {
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

    makeStylesTemplate(dynamicStyles, staticStyles='') {
        if (typeof dynamicStyles === 'function') {
               
        } else if (dynamicStyles) {
            throw new Error(`Only functions are supported for dynamic styles for now.`);
        }

        if (typeof staticStyles !== 'string') {
            throw new Error(`Only strings are supported for static component styles.`);
        }

        return this.wrapTemplate((locals) => {
            var styles = dynamicStyles ? dynamicStyles.call(this, locals) : null;
            return Object.defineProperties({}, {
                dynamicStyles: {
                    get: () => styles
                },
                staticStyles: {
                    get: () => staticStyles
                }
            })
        }, 'renderStyles');
    }

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

    renderStyles() {
        return Promise.resolve(this.stylesTemplate())
            .then(results => {
                return Promise.resolve(this.onRenderStyles())
                    .then(() => results);
            })
    }

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
                    var evt = {components: renderedComponents};
                    this._childComponents = renderedComponents;
                    this.markWidgetDirty()
                    this.trigger('rendermarkup', evt);
                    this.onRenderMarkup(Object.assign({}, evt));
                }
            })
            .then(() => this._vTree)
    }

    refreshWidgets() {
        if (this._widgetIsDirty) {
            this.makeNewWidget();
        }
    }

    get state() {
        return {};
    }

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

    static get state() {
        return {};
    }

    static get tagDirectives() {
        return {
            content: function(vNode, children, props, renderedComponents) {
                return this.content;
            }
        }
    }

    replaceComponentPlaceholders(vNode, renderedComponents=[]) {
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
                    .then(content => {
                        component.content = content;
                        
                        if ((contentComponents.length !== component._contentComponents.length) || contentComponents.some((component, ii) => component._contentComponents[ii] !== component)) {
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
                                parent.trigger('componentplaceholderreplaced', {component});
                                return component.makeNewWidget();
                            })
                    })
            });
    }

    walkComponents(callback, filterFunc=()=>true) {
        if (filterFunc(this)) {
            callback(this)
        }
        for (var componentName in this._componentInstances) {
            Object.values(this._componentInstances[componentName])
                .forEach(instance => instance.walkComponents(callback, filterFunc))
        }
    }

    reduceComponents(callback, initialVal, filterFunc=()=>true, depth=0) {
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

    checkChangedKey(key) {
        return Object.entries(this._lastAccessedStateKeys)
            .reduce((acc, entry) => key in entry[1] ? Object.assign(acc || {}, {[entry[0]]:1}) : acc, null);
    }

    reduceParents(callback, initialVal) {
        var parent = this.getParent();
        var shouldRecurse = true;
        initialVal = callback.call(this, initialVal, this, () => shouldRecurse = false);
        return parent && shouldRecurse ? parent.reduceParents(callback, initialVal) : initialVal;
    }

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

    queryDOM(query) {
        return this.awaitDom()
            .then(el => el.querySelector(query));
    }

    queryDOMAll(query) {
        return this.awaitDom()
            .then(el => el.querySelectorAll(query));
    }

    awaitEvent(eventName) {
        var resolveProm;
        //@TODO add evt obj filter
        var promise = new Promise(function(resolve){
            resolveProm = resolve;
        });
        this.once(eventName, function(evt){
            resolveProm(evt);
        });
        return promise;
    }

    awaitPatch() {
        return this.awaitRender().then(() => (this.root || this).awaitEvent('patch'));
    }

    awaitMount() {
        return this.isMounted ? Promise.resolve() : this.awaitEvent('mount');
    }

    awaitDom() {
        return this.el ? Promise.resolve(this.el) : this.awaitEvent('domcreate').then(evt => evt.el);
    }

    awaitRender(val) {
        return (this.renderPromise ? this.renderPromise : Promise.resolve())
            .then(() => val);
    }

    static get generatedComponentClasses() {
        return _generatedComponentClasses;
    }

    static set generatedComponentClasses(val) {
        return _generatedComponentClasses = val;
    }

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

                parentComponent.trigger('createcomponent', {component: this, parentComponent, componentName});

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
            
            return Promise.resolve(this.onInit(opts))
                .then(() => {
                    this.trigger('init');
                    return this;
                });
        }
        return Promise.resolve(this);
    }

    bindEvent(funcText, opts={}) {
        var consts = this.constructor.Weddell.consts;
        return `${opts.preventDefault ? `event.preventDefault();` : ''}${opts.stopPropagation ? `event.stopPropagation();` : ''}Promise.resolve((window['${consts.VAR_NAME}'] && window['${consts.VAR_NAME}'].app) || new Promise(function(resolve){ window.addEventListener('weddellinitbefore', function(evt) { resolve(evt.detail.app) }) })).then(function(app) { app.awaitComponentMount('${this.id}').then(function(component){ (function() {${funcText}}.bind(component))()})})`;
    }

    bindEventValue(propName, opts) {
        return this.bindEvent("this.state['" + propName + "'] = event.target.value", opts);
    }

    getMountedChildComponents() {
        return this.reduceComponents((acc, component) => 
            acc.concat(component), [], component => 
                component !== this && component._isMounted);
    }

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
                    } else if (entry[0].slice(0,2) === 'on' && !(entry[0] in testElement)) {
                        //TODO support more spec-compliant data- attrs
                        acc[1][entry[0]] = entry[1];
                    } else {
                        acc[2][entry[0]] = entry[1];
                    }
                    return acc;
                }, [{},{},{}]);//first item props, second item event handlers, third item attributes
            
            Object.assign(this.props, parsedProps[0]);
            this.bindInlineEventHandlers(parsedProps[1], parentScope);
            this.state.$attributes = parsedProps[2];
        }
    }

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
            this._inlineEventHandlers[eventName] = {handlerString};
            try {
                var callback = new Function('component', 'event', handlerString).bind(scope, this)
            } catch (err) {
                throw "Failed parsing event handler for component: " + err.stack;
            }
            this._inlineEventHandlers[eventName].off = this.on(eventName.slice(2), callback);
        }
    }

    addComponentEvents(componentName, childComponent, index) {
        var componentKeyIndex;
        if (this.constructor.componentEventListeners && (componentKeyIndex = Object.keys(this.constructor.componentEventListeners).map(key => key.toLowerCase()).indexOf(componentName)) > -1) {
            if (!(componentName in this._componentListenerCallbacks)) {
                this._componentListenerCallbacks[componentName] = {}
            }
            this._componentListenerCallbacks[componentName][index] = Object.entries(this.constructor.componentEventListeners[Object.keys(this.constructor.componentEventListeners)[componentKeyIndex]])
                .map(entry => {
                    return childComponent.on(entry[0], function() {
                        if (childComponent.isMounted) {
                            entry[1].apply(this, Array.from(arguments).concat(childComponent));
                        }
                    }.bind(this))
                })
        }
    }

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

    markWidgetDirty() {
        this._widgetIsDirty = true;
        
        this.trigger('widgetdirty');
    }

    extractSnapshotOpts(snapshot) {
        if (!snapshot || !snapshot.id) {
            throw new Error(`Malformed snapshot: id is missing`)
        }

        return ['state', 'componentSnapshots', 'el']
            .reduce((acc, curr) => 
                snapshot[curr] ? Object.assign(acc, { [curr === 'state' ? 'initialState' : curr]: snapshot[curr] }) : acc, { id: snapshot.id });
        
    }

    async makeComponentInstance(componentName, index) {
        componentName = componentName.toLowerCase();

        if (!componentName in this.components) {
            throw new Error(`${componentName} is not a recognized component name for component type ${this.constructor.name}`);
        }

        if (this.components[componentName].weddellClassInput) {
            this.components[componentName] = this.createChildComponentClass(componentName, this.components[componentName].weddellClassInput);
        }
        var ComponentClass = await this.components[componentName];

        var opts = {
            store: defaults({
                $componentID: ComponentClass._id,
                $instanceKey: index
            })
        };

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

    getComponentInstance(componentName, index) {
        componentName = componentName.toLowerCase()
        var instances = this._componentInstances[componentName];
        return instances[index];
    }

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

    cleanupComponentInstances() {
        //TODO right now, if a component becomes unused, it will continue to sit in memory and possibly generate events. We should probably clean them up.
    }
}

module.exports = Component;

},{"../utils/clone-vnode":65,"../utils/compact":66,"../utils/difference":67,"../utils/flatten":68,"../utils/make-hash":69,"../utils/uniq":70,"./event-emitter-mixin":55,"./vdom-widget":57,"deep-equal":3,"defaults-es6":8,"mixwith":12,"virtual-dom/h":19}],55:[function(require,module,exports){
var Mixin = require('mixwith').Mixin;

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
            eventObj = Object.assign({}, eventObj, {eventName});
            if (Array.isArray(eventName)) {
                return eventName.map(evtName => this.trigger(evtName, eventObj, thisArg));
            } else {
                var cbs = eventName in this._callbacks ? this._callbacks[eventName] : [];
                return cbs.map(cb => cb.call(thisArg || this, eventObj));
            }
        }
    }
});

module.exports = EventEmitterMixin;

},{"mixwith":12}],56:[function(require,module,exports){
var EventEmitterMixin = require('./event-emitter-mixin');
var deepEqual = require('deep-equal');
var defaults = require('defaults-es6');
var difference = require('../utils/difference');
var mix = require('mixwith').mix;
var uniq = require('array-uniq');

var defaultOpts = {
    shouldMonitorChanges: true,
    shouldEvalFunctions: true,
    inputMappings: {},
    validators: {}
};

var Store = class extends mix(Store).with(EventEmitterMixin) {
    constructor(data, opts) {
        opts = defaults(opts, defaultOpts);
        super();

        Object.defineProperties(this, {
            _initialCalled: {value:{}, writable:true},
            shouldMonitorChanges: {value: opts.shouldMonitorChanges},
            shouldEvalFunctions: {value: opts.shouldEvalFunctions},
            _data: {configurable: false,value: {}},
            _initialState: { value: opts.initialState || {} },
            _cache: {value: {}, writable: true},
            _funcProps: {configurable: false,value: {}},
            _funcPropHandlerRemovers: {configurable: false,value: {}},
            _proxyObjs: {configurable: false,value: {}},
            _dependencyKeys: {configurable: false, value: []},
            _proxyProps: {configurable: false,value: {}},
            _changedKeys: {configurable: false, value: []},
            _firstGetComplete: {writable: true, value: false},
            _validators: {value: opts.validators},
            overrides: { value: Array.isArray(opts.overrides) ? opts.overrides : opts.overrides ? [opts.overrides] : [] },
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
                    this.trigger('get', evt);
                }
            }.bind(this));
        });

        Object.keys(this.inputMappings).forEach(key => {
            this.set(key, null, true);
        });

        this.proxies.concat(this.overrides).forEach(obj => {
            Object.keys(obj).forEach(key => {
                this.set(key, null, true);
            });

            obj.on('change', evt => {
                this.trigger('change', Object.assign({}, evt));
            });

            obj.on('get', evt => {
                this.trigger('get', Object.assign({}, evt));
            });
        });

        this.on('change', evt => {
            delete this._cache[evt.changedKey];
        });

        Object.seal(this);
    }

    set(key, val, isReadOnly=false) {
        if (!(key in this)) {
            if (!isReadOnly) {
                var setter = function(newValue) {
                    if (this.shouldMonitorChanges) {
                        var oldValue = this._data[key];
                        if (oldValue && typeof oldValue === "object") {
                            oldValue = Object.assign({}, oldValue);
                        }
                    }

                    if (this.shouldEvalFunctions && typeof newValue === 'function') {
                        this._funcProps[key] = newValue;
                    } else {
                        if (key in this._validators) {
                            var input = this._validators[key];
                            var val = newValue == null ? this.getValue(key) : newValue;
                            if (input.required && val == null) {
                                throw `Required component input missing: ${key}`;
                            }
                            if (input.validator && !input.validator(val)) {
                                throw `Input failed validation: ${key}. Received value: ${val}`;
                            }
                        }
                        this._data[key] = newValue;

                        if (this.shouldMonitorChanges) {

                            if (!deepEqual(newValue, oldValue)) {
                                this._changedKeys.push(key);
                                this.trigger('change', { target: this, changedKey: key, newValue, oldValue });
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
                    return value;
                }.bind(this),
                set: setter
            });

            if (!isReadOnly) {
                var initialValue = this._initialState[key];
                if (initialValue != null) {
                    if (this.shouldEvalFunctions && typeof val === 'function') {
                        this[key] = val;
                    } else {
                        this[key] = initialValue;
                    }
                } else {
                    this[key] = val;
                }
            } else {
                this._data[key] = val;
            }
        }
    }

    collectChangedData(includeComputed=true, computedValueFormat='verbose') {
        return uniq(this._changedKeys).reduce((acc, curr) => {
            if (!this.shouldEvalFunctions || includeComputed || !this._funcProps[curr]) {
                if (this.shouldEvalFunctions && this._funcProps[curr]) {
                    switch (computedValueFormat) {
                        case 'verbose':
                            return Object.assign(acc, { 
                                [curr]: {
                                    isComputedValue: true,
                                    lastAccessedKeys: this._dependencyKeys[curr],
                                    value: this._data[curr] 
                                }
                            });
                        case 'simple':
                        default:
                            break;
                    }
                }
                return Object.assign(acc, { [curr]: this._data[curr] })
            }
            return acc;
        }, {})
    }

    getValue(key) {
        var i = 0;
        var val;

        if (this._cache[key]) {
            return this._cache[key];
        }
        if (this.shouldEvalFunctions && !this._firstGetComplete) {
            this._firstGetComplete = true;
            for (var propName in this._funcProps) {
                this[propName];
            }
        }
        if (key in this._funcProps && !this._initialCalled[key]) {
            this._initialCalled[key] = true;

            if (this._initialState[key]) {
                if (this._initialState[key].isComputedValue) {
                    val = this[key] = this._initialState[key].value;
                    this._dependencyKeys[key] = this._initialState[key].lastAccessedKeys;
                } else {
                    val = this[key] = this._initialState[key];
                }
            } else {
                val = this[key] = this.evaluateFunctionProperty(key);
            }
            this.on('change', evt => {
                if (this._dependencyKeys[key].includes(evt.changedKey)) {
                    this[key] = this.evaluateFunctionProperty(key);
                }
            });
        }
        
        while (this.overrides[i] && (typeof val === 'undefined' || val === null)) {
            val = this.overrides[i][key];
            i++;
        }

        i = 0;
        if (typeof val === 'undefined' || val === null) {
            val = this._data[key];
        }
        
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

    assign(data, initialState={}) {
        if (data) {
            if (Array.isArray(data)) {
                data.forEach(key => this.set(key, null));
            } else {
                Object.entries(data).forEach((entry) => {
                    this.set(entry[0], entry[1], false, initialState[entry[0]])
                });
            }
        }
    }

    await(key) {
        if (Array.isArray(key)) {
            return Promise.all(key.map(subKey => this.await(subKey)));
        }
        return Promise.resolve(this.getValue(key) || new Promise(resolve => {
            var off = this.watch(key, vals => {
                off();
                resolve(vals);
            }, true, true);
        }))
    }

    evaluateFunctionProperty(key) {
        var dependencyKeys = [];
        var off = this.on('get', function(evt){
            dependencyKeys.push(evt.key);
        });
        var result = this._funcProps[key].call(this);
        off();
        this._dependencyKeys[key] = uniq(dependencyKeys);
        return result;
    }

    watch(key, func, shouldWaitForDefined, invokeImmediately) {
        if (typeof shouldWaitForDefined == 'undefined') shouldWaitForDefined = true;
        if (!Array.isArray(key)) {
            key = [key];
        }
        var checkKeys = function(){
            var vals = key.map(currKey=>this[currKey]);
            if (!shouldWaitForDefined || vals.every(val=>typeof val !== 'undefined')) {
                func.apply(this, vals);
            }
        };

        var off = this.on('change', function(evt){
            if (key.includes(evt.changedKey)) {
                checkKeys.call(this);
            }
        });
        if (invokeImmediately) {
            checkKeys.call(this);
        }
        return off;
    }
}

module.exports = Store;

},{"../utils/difference":67,"./event-emitter-mixin":55,"array-uniq":1,"deep-equal":3,"defaults-es6":8,"mixwith":12}],57:[function(require,module,exports){
const VDOMPatch = require('virtual-dom/patch');
const VDOMDiff = require('virtual-dom/diff');
const createElement = require('virtual-dom/create-element');
const cloneVNode = require('../utils/clone-vnode');

module.exports = class WeddellVDOMWidget {

    cloneVNode(vNode, pruneNullNodes=true, childWidgets=[]) {
        if (Array.isArray(vNode)) {
            var arr = vNode.map(child => this.cloneVNode(child, pruneNullNodes, childWidgets));

            if (pruneNullNodes) {
                arr = arr.reduce((newArr, child, ii) => {
                    if (child && child instanceof WeddellVDOMWidget) {
                        if ((!pruneNullNodes || child.vTree)) {
                            newArr.push(child);
                        }
                    } else if (!pruneNullNodes || child != null) {
                        newArr.push(child);
                    }
                    return newArr;
                }, []);
            }
            return arr;
        } else if (!vNode) {
            return vNode;
        } else if (vNode instanceof WeddellVDOMWidget) {
            var widget = (vNode.component._widgetIsDirty ? vNode.component.makeNewWidget() : vNode.component._widget);
            childWidgets.push(widget);
            return widget
        } else if (!vNode.tagName) {
            return vNode;
        } else {
            return cloneVNode(vNode, this.cloneVNode(vNode.children, pruneNullNodes, childWidgets));
        }
    }

    get type() {
        return 'Widget';
    }

    constructor({component=null, vTree=component._vTree}) {
        this.component = component;
        this.childWidgets = [];
        this._callbacks = [];
        this.vTree = this.cloneVNode(vTree, true, this.childWidgets);
    }

    bindChildren(parent) {
        this._callbacks = this.childWidgets.map(childWidget => childWidget.component.on('widgetdirty', () => {
            parent.markWidgetDirty()
        }))
    }
    unbindChildren() {
        this._callbacks.forEach(callback => callback());
    }
    init() {
        if (!this.vTree) {
            throw "Component has no VTree to init with";
        }
        var el = createElement(this.vTree);
        el.setAttribute('data-wdl-id', this.component.id);
        //@TODO we could detect when we are using a snapshot element and use that element rather than creating a new one. Early attempts at doing this proved unreliable.

        this.fireDomEvents(this.component.el, this.component._el = el);

        return el;
    }

    fireDomEvents(prevEl, el) {
        if (!prevEl) {
            this.component.trigger('domcreate', {el});
            this.component.onDOMCreate.call(this.component, {el});
            this.component.trigger('domcreateorchange', {newEl: el, prevEl});
            this.component.onDOMCreateOrChange.call(this.component, {newEl: el, prevEl});
        } else if (prevEl !== el) {
            this.component.trigger('domchange', {el});
            this.component.onDOMChange.call(this.component, { newEl: el, prevEl });
            this.component.trigger('domcreateorchange', {newEl: el, prevEl});
            this.component.onDOMCreateOrChange.call(this.component, { newEl: el, prevEl });

            var positionComparison = prevEl.compareDocumentPosition(el);
            if (positionComparison !== 0) {
                this.component.trigger('dommove');
                //@TODO atm this pretty much always fires. maybe that is circumstantial, but we may need to be more selective about which bits constitute a "move"
                this.component.onDOMMove.call(this.component, { newEl: el, prevEl });
            }
        }
    }

    update(previousWidget, prevDOMNode) {
        if (previousWidget instanceof WeddellVDOMWidget) {
            var patches = VDOMDiff(previousWidget.vTree, this.vTree);
            var el = VDOMPatch(prevDOMNode, patches);

            this.fireDomEvents(this.component.el, this.component._el = el);

            el.setAttribute('data-wdl-id', this.component.id);

            return el;
        }
        return this.init();        
    }

    destroy(el) {
        if (el === this.component.el) {
            this.component._el = null;
            this.component.onDOMDestroy.call(this.component, {el});
        }
    }
}
},{"../utils/clone-vnode":65,"virtual-dom/create-element":17,"virtual-dom/diff":18,"virtual-dom/patch":27}],58:[function(require,module,exports){
var mix = require('mixwith').mix;
var App = require('./app');
var Component = require('./component');
var Store = require('./store');

class _Weddell {
    static plugin(pluginObj) {
        class NewWeddell extends _Weddell {};
        if (!pluginObj.id) {
            throw 'Got a plugin with no ID assigned. Aborting';
        }
        if (!NewWeddell.loadedPlugins.includes(pluginObj.id)) {
            if (pluginObj.requires && !NewWeddell.loadedPlugins.includes(pluginObj.requires)) {
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
_Weddell.classes = {App, Component, Store};
Object.values(_Weddell.classes).forEach(function(commonClass){
    commonClass.Weddell = _Weddell;
});
module.exports = _Weddell;

},{"./app":53,"./component":54,"./store":56,"mixwith":12}],59:[function(require,module,exports){
var Mixin = require('mixwith').Mixin;
var mix = require('mixwith').mix;
var Router = require('./router');
var StateMachineMixin = require('./state-machine-mixin');
var MachineStateMixin = require('./machine-state-mixin');
var defaults = require('defaults-es6/deep-merge');

var RouterState = mix(class {
    constructor(opts) {
        this.Component = opts.Component;
        this.componentName = opts.componentName;
    }
}).with(MachineStateMixin);

module.exports = function(_Weddell){
    return _Weddell.plugin({
        id: 'router',
        classes:  {
            App: Mixin(function(App){
                return class extends App {

                    onBeforeRoute() {}

                    constructor(opts) {
                        super(opts);

                        this.router = new Router({
                            routes: opts.routes,
                            onRoute: function(matches, componentNames) {
                                var jobs = [];
                                this.el.classList.add('routing');
                                
                                this.el.setAttribute('data-current-route', matches.route.name);
                                if (matches.isRouteUpdate) {
                                    this.el.classList.add('route-update');
                                    if (matches.keepUpdateScrollPos) {
                                        this.el.classList.add('keep-scroll-pos');
                                    }
                                }
                                this.trigger('routematched', {matches});
                                return Promise.resolve(this.onBeforeRoute.call(this, { matches, componentNames }))
                                    .then(() => {
                                        this.el.classList.add('prerouting-finished');
                                        
                                        return componentNames
                                            .map(componentName => componentName.toLowerCase())
                                            .reduce((promise, componentName) => {
                                                return promise
                                                    .then(currentComponent => {
                                                        return currentComponent.getInitComponentInstance(componentName, 'router')
                                                            .then(component => {
                                                                if (!component) return Promise.reject('Failed to resolve ' + componentName + ' while routing.');// throw "Could not navigate to component " + key;
                                                                jobs.push({
                                                                    component,
                                                                    currentComponent,
                                                                    componentName
                                                                });
                                                                return component;
                                                            });
                                                    })
                                            }, Promise.resolve(this.component))
                                            .then(lastComponent => {
                                                jobs.push({
                                                    currentComponent: lastComponent,
                                                    component: null,
                                                    componentName: null
                                                });
                                                return jobs.reduce((promise, obj) => {
                                                        return promise
                                                            .then(() => obj.currentComponent.changeState.call(obj.currentComponent, obj.componentName, {matches}))
                                                    }, Promise.resolve())
                                                    .then(results =>
                                                        this.awaitPatch()
                                                            .then(() => results));
                                            }, console.warn)
                                            .then(results => {
                                                this.el.classList.remove('routing');
                                                this.el.classList.remove('prerouting-finished');
                                                this.el.classList.remove('route-update');
                                                this.el.classList.remove('keep-scroll-pos');
                                                this.trigger('route', {matches, results});
                                                return results;
                                            })
                                    })
                            }.bind(this),
                            onHashChange: function(hash) {
                                return hash;
                            }.bind(this)
                        });

                        this.on('createcomponent', evt => {
                            this.on('routematched', routeEvt => {
                                evt.component.state.$currentRoute = routeEvt.matches;
                            });
                            evt.component.router = this.router;
                            evt.component.state.$currentRoute = this.router.currentRoute;
                        });
                    }

                    initRootComponent(initObj={}) {
                        return super.initRootComponent()
                            .then(() => this.router.init(initObj.initialRoute))
                    }
                }
            }),
            Component: Mixin(function(Component){
                var RouterComponent = class extends mix(Component).with(StateMachineMixin) {

                    onEnter() {}
                    onExit() {}
                    onUpdate() {}

                    static get state() {
                        return defaults({
                            $currentRoute: null
                        }, super.state);
                    }

                    static get tagDirectives() {
                        return defaults({
                            routerview: function(vNode, content, props, renderedComponents){
                                return this.currentState ? this.makeChildComponentWidget(this.currentState.componentName, 'router', content, props, renderedComponents) : null;
                            } 
                        }, super.tagDirectives)
                    }

                    constructor(opts) {
                        opts.stateClass = RouterState;
                        var self;
                        super(defaults(opts, {
                            store: {
                                $routerLink: function(){
                                    return self.compileRouterLink.apply(self, arguments);
                                }
                            }
                        }));

                        Object.defineProperties(this, {
                            _initialRouterStateName: { value: opts.initialRouterStateName, writable: false} 
                        })

                        self = this;

                        this.on('init', () => {
                            Object.entries(this.components)
                                .forEach(entry => {
                                    var componentName = entry[0]
                                    var routerState = new RouterState([['onEnterState', 'onEnter'], ['onExitState', 'onExit'], ['onUpdateState', 'onUpdate']].reduce((finalObj, methods) => {
                                        var machineStateMethod = methods[0];
                                        finalObj[machineStateMethod] = (evt) => {
                                            return this.getInitComponentInstance(componentName, 'router')
                                                .then(componentInstance => {
                                                    return Promise.resolve(componentInstance[methods[1]].call(componentInstance, Object.assign({}, evt)))
                                                        .then(() => componentInstance);
                                                })
                                                .then(componentInstance => {
                                                    switch (machineStateMethod) {
                                                        case 'onEnterState':
                                                        case 'onExitState':
                                                            return Promise.resolve(this.markDirty()).then(() => componentInstance)
                                                        default:
                                                            break;
                                                    }
                                                    return componentInstance;
                                                })
                                        }
                                        return finalObj;
                                    }, {
                                        Component: entry[1],
                                        componentName
                                    }));
                                    this.addState(componentName, routerState);
                                });
                        })
                    }

                    compileRouterLink(obj) {
                        var matches = this.router.compileRouterLink(obj);
                        if (matches && typeof matches === 'object') {
                            return matches.fullPath;
                        } else if (typeof matches === 'string') {
                            return matches;
                        }
                    }

                    route(pathname) {
                        this.router.route(pathname);
                    }
                }

                return RouterComponent;
            }),
            Router
        }
    });
}

},{"./machine-state-mixin":60,"./router":61,"./state-machine-mixin":62,"defaults-es6/deep-merge":6,"mixwith":12}],60:[function(require,module,exports){
var EventEmitterMixin = require('../../core/event-emitter-mixin');
const { Mixin, DeDupe, mix } = require('mixwith');

var MachineState = Mixin(function(superClass) {
    return class extends mix(superClass).with(DeDupe(EventEmitterMixin)) {
        constructor(opts) {
            super(opts);
            this.onEnterState = opts.onEnterState;
            this.onExitState = opts.onExitState;
            this.onUpdateState = opts.onUpdateState;
        }

        stateAction(methodName, eventName, evt) {
            return Promise.resolve(this[methodName] && this[methodName](Object.assign({}, evt)))
                .then(() => this.trigger(eventName, Object.assign({}, evt)));
        }

        exitState(evt) {
            return this.stateAction('onExitState', 'exit', evt);
        }

        enterState(evt) {
            return this.stateAction('onEnterState', 'enter', evt);
        }

        updateState(evt) {
            return this.stateAction('onUpdateState', 'update', evt);
        }
    }
});
module.exports = MachineState;

},{"../../core/event-emitter-mixin":55,"mixwith":12}],61:[function(require,module,exports){
var defaults = require('defaults-es6');
var pathToRegexp = require('path-to-regexp');
var findParent = require('find-parent');
var defaultOpts = {};
const { mix } = require('mixwith');
var EventEmitterMixin = require('../../core/event-emitter-mixin');

function matchPattern(pattern, parentMatched, pathName, fullPath, end) {
    var params = [];

    if (pattern.charAt(0) !== '/') {
        if (parentMatched) {
            var regex = pathToRegexp('/' + pattern, params, {end});
            var routePathname = pathName;
            var routeFullPath = fullPath;
            var match = regex.exec(routePathname);
        }
    } else {
        regex = pathToRegexp(pattern, params, {end});
        routePathname = fullPath;
        routeFullPath = routePathname;
        match = regex.exec(routePathname);
    }

    return { params, match, fullPath: routeFullPath, pathName: routePathname, regex };
}

class BaseRouter {}

class Router extends mix(BaseRouter).with(EventEmitterMixin) {

    constructor(opts) {
        opts = defaults(opts, defaultOpts);
        super(opts);
        this.currentRoute = null;
        this.routes = [];
        this.promise = null;
        this.onRoute = opts.onRoute;
        this._isInit = false;
        if (opts.routes) {
            this.addRoutes(opts.routes);
        }
    }

    route(pathName, shouldReplaceState=false, triggeringEvent=null) {
        if (typeof shouldReplaceState !== 'boolean') {
            triggeringEvent = shouldReplaceState;
            shouldReplaceState = false
        }
        if (typeof pathName === 'string') {
            var matches = this.matchRoute(pathName, this.routes);
        } else if (Array.isArray(pathName)) {
            matches = pathName;
        } else if (pathName) {
             //assuming an object was passed to route by named route.
            var matches = this.compileRouterLink(pathName);
            if (matches)  {
                return this.route(matches.fullPath + (pathName.hash ? '#' + pathName.hash : ''), shouldReplaceState, triggeringEvent);
            }
        }
        if (matches) {
            var hash = matches.hash;
            Object.assign(matches, { triggeringEvent});
            var isInitialRoute = !this.currentRoute;
            
            if (this.currentRoute && matches.fullPath === this.currentRoute.fullPath) {
                var promise = Promise.resolve(Object.assign(matches, {isCurrentRoute: true}))
                    .then(matches => {
                        if (this.currentRoute.hash !== matches.hash) {
                            if (shouldReplaceState) {
                                return this.replaceState(matches.fullPath, hash);
                            } else {
                                return this.pushState(matches.fullPath, hash);
                            }
                        } 
                    });
            } else {
                promise = Promise.all(matches.map((currMatch, key) => {
                        if (key === matches.length - 1 && currMatch.route.redirect) {
                            if (typeof currMatch.route.redirect === 'function') {
                                var redirectPath = currMatch.route.redirect.call(this, matches);
                            } else {
                                //assuming string - path
                                redirectPath = currMatch.route.redirect;
                            }
                            if (redirectPath === matches.fullPath) throw "Redirect loop detected: '" + redirectPath + "'";

                            return Promise.reject(redirectPath);
                        }
        
                        return Promise.resolve(typeof currMatch.route.handler == 'function' ? currMatch.route.handler.call(this, matches) : currMatch.route.handler);
                    }))
                    .then(results => {
                        return Promise.resolve(this.onRoute ? this.onRoute.call(this, matches, results.filter(val => val)) : null)
                            .then(() => matches)
                            .then(matches => {
                                if (isInitialRoute || shouldReplaceState) {
                                    this.replaceState(matches.fullPath, hash);
                                } else if (!matches.isCurrentRoute) {
                                    return this.pushState(matches.fullPath, hash, matches.isRouteUpdate && matches.keepUpdateScrollPos ? null : {x:0,y:0})
                                        .then(() => matches);
                                }
                                return matches;
                            });
                    }, redirectPath => {
                        return this.route(redirectPath, true, triggeringEvent)
                    });
                this.currentRoute = matches;
            }
            return this.promise = promise.then(result => {
                this.promise = null
                return result;
            });                
        }
        return this.promise = null;
    }

    awaitRoute() {
        return this.promise ? this.promise : Promise.resolve();
    }

    static getNamedRoute(name, routes, currPath) {
        if (!name) return null;
        if (!currPath) currPath = [];
        var matchedRoute = null;
        routes.every(route => {
            matchedRoute = route.name === name ? route : matchedRoute;
            if (!matchedRoute && route.children) {
                matchedRoute = this.getNamedRoute(name, route.children, currPath.concat(route));
            }
            return !matchedRoute;
        });
        if (matchedRoute) {
            matchedRoute = Object.assign({route: matchedRoute}, matchedRoute);
            matchedRoute = Object.assign(currPath.concat(matchedRoute.route), matchedRoute);
        }
        return matchedRoute || null;
    }

    matchRoute(pathName, routes, routePath, fullPath, parentMatched) {
        if (!routePath) routePath = [];
        var result = null;
        var hashIndex = pathName.indexOf('#');
        var hash = hashIndex > -1 ? pathName.slice(hashIndex + 1) : '';
        pathName = hashIndex > -1 ? pathName.slice(0, hashIndex) : pathName;
    
        if (typeof pathName !== 'string') {
            return null;
        }
        
        if (typeof fullPath === 'undefined') {
            fullPath = pathName;
        }

        if (fullPath.charAt(0) !== '/' && this.currentRoute) {
            fullPath = this.currentRoute.fullPath + fullPath;
        }

        routes.every((currRoute) => {
            var params = [];

            var currMatch = matchPattern(currRoute.pattern, parentMatched, pathName, fullPath, false);

            var newPath = routePath.concat({route: currRoute, match: currMatch.match, params: currMatch.params});

            if (currRoute.children) {
                result = this.matchRoute(currMatch.pathName.replace(currMatch.regex, ''), currRoute.children, newPath, currMatch.fullPath, !!currMatch.match);
            }

            if (!result) {
                currMatch = matchPattern(currRoute.pattern, parentMatched, pathName, fullPath, true);
                var matchObj = {route: currRoute, match: currMatch.match, params: currMatch.params };
                var isValid = true;
                if (currRoute.validator) {
                    isValid = currRoute.validator.call(currRoute, matchObj);
                }
                result = currMatch.match && isValid ? routePath.concat(matchObj) : null;
            }

            if (result) {
                result.paramVals = result.reduce((paramsObj, routeObj) => {
                    routeObj.params.forEach((param, key) => {
                        if (routeObj.match) {
                            paramsObj[param.name] = routeObj.match[key + 1];
                        }
                    });
                    return paramsObj;
                }, {});

                result.route = result[result.length - 1].route;
                result.fullPath = fullPath;
                result.hash = hash;
            }

            return !result;
        });
        
        if (result) {
            result.isRouteUpdate = !!(this.currentRoute && result.route.name === this.currentRoute.route.name);
            result.keepUpdateScrollPos = result.isRouteUpdate && !!(typeof result.route.keepUpdateScrollPos === 'function' ? 
                        (result.route.keepUpdateScrollPos.call(this, {newRoute: result, prevRoute: this.currentRoute})) : 
                        result.route.keepUpdateScrollPos);
        }        

        return result;
    }

    addRoutes(routes) {
        this.routes = this.routes.concat(routes);
    }

    compileRouterLink(obj) {
         /*
        * Takes an object specifying a router name and params, returns an object with compiled path and matched route
        */
        if (typeof obj === 'string') return obj;
        var paramDefaults = {};
        var routeName;
       
        if (this.currentRoute) {
            routeName = this.currentRoute.route.name;

            paramDefaults = this.currentRoute.reduce((params, currRoute) => {
                currRoute.params.forEach((param, key) => {
                    var val = currRoute.match[key + 1];
                    if (typeof val !== 'undefined') {
                        params[param.name] = val;
                    }
                })
                return params;
            }, paramDefaults);
        }
        
        routeName = obj.name ? obj.name : routeName;
        obj.params = Object.assign(paramDefaults, obj.params);
       
        var route = Router.getNamedRoute(routeName, this.routes);
        
        if (route) {
            try {
                var pattern = route.reduce((finalPath, pathRoute) => {
                    var segment = pathRoute.pattern;
                    return pathRoute.pattern.charAt(0) === '/' ? segment : finalPath + segment;
                }, '');

                var fullPath = pathToRegexp.compile(pattern)(obj.params);
            } catch (err) {
                throw "Encountered error trying to build router link: " + err.toString();
            }
            var matches = [{
                fullPath,
                route,
                match: null
            }];
            matches.route = route;
            matches.fullPath = fullPath[0] !== '/' ? '/' + fullPath : fullPath;
            return matches;
        } else {
            console.warn('could not find route with name', routeName);
        }
        return null;
    }

    init(initPath) {
        if (!this._isInit && this.routes) {
            if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
            this._isInit = true;

            addEventListener('popstate', this.onPopState.bind(this));
            addEventListener('hashchange', this.onHashChange.bind(this));

            document.body.addEventListener('click', (evt) => {
                var clickedATag = findParent.byMatcher(evt.target, el => el.tagName === 'A');
                if (clickedATag) {
                    var href = clickedATag.getAttribute('href');
                    if (href) {
                        var result = this.route(href, evt);
                        if (result) {
                            evt.preventDefault();
                            this.replaceState(location.pathname, location.hash);
                        }
                    }
                }
            });
            return this.route(initPath || (location.pathname + location.hash));
        }
        return Promise.resolve();
    }

    pushState(pathName, hash, scrollPos) {
        if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
        if (pathName.charAt(pathName.length - 1) !== '/') pathName = pathName + '/';

        if (typeof hash !== 'string') {
            hash = '';
        }

        return new Promise((resolve) => {
            var setListener = false;
            var off;
            var pushState = evt => {
                if (setListener) {
                    off();
                    history.replaceState({fullPath: pathName, hash, scrollPos, isWeddellState: true}, document.title, location.origin + pathName + location.search + (hash  || ''));
                    this.setScrollPos(scrollPos, hash);
                } else {
                    history.pushState({fullPath: pathName, hash, scrollPos, isWeddellState: true}, document.title, location.origin + pathName + location.search + (hash  || ''));
                    this.setScrollPos(scrollPos, hash);
                }
                
                resolve();
            }
            if (location.hash === hash) {
                pushState()
            } else {
                setListener = true;
                off = this.on('hashchange', pushState);
                location.hash = hash;
            }
        })
    }

    replaceState(pathName, hash, scrollPos) {
        if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
        if (pathName.charAt(pathName.length - 1) !== '/') pathName = pathName + '/';
        
        var currentScrollPos = {x: window.pageXOffset, y: window.pageYOffset};

        if (!history.state || !history.state.isWeddellState || history.state.fullPath !== pathName || history.state.hash !== hash) {
            history.replaceState({fullPath: pathName, hash, scrollPos: currentScrollPos, isWeddellState: true}, document.title, location.origin + pathName + location.search + (hash  || ''));
        }
        
        this.setScrollPos(scrollPos, hash);
    }

    onHashChange(evt) {
        if (!history.state) {
            this.replaceState(location.pathname, location.hash, {x: window.pageXOffset, y: window.pageYOffset});
        }
        this.trigger('hashchange')
    }

    setScrollPos(scrollPos, hash) {
        if (hash) {
            var el;
            try {
                el = document.querySelector(hash);
            } catch (err) { }
            
            if (el) {
                window.scrollTo(el.offsetLeft, el.offsetTop);
            }
        } else if (scrollPos) {
            window.scrollTo(scrollPos.x, scrollPos.y);
        }
    }

    onPopState(evt) {
        //@TODO paging forward does not restore scroll position due to lack of available hook to capture it. we may at some point want to capture it in a scroll event.
        var state = history.state;
        
        if (evt && evt.state && evt.state.isWeddellState === true) {
            var result = this.route(evt.state.fullPath + (evt.state.hash || ''), true, evt);
            if (result && evt.state.scrollPos) {
                if (result.then) {
                    result
                        .then(matches => {
                            window.scrollTo(evt.state.scrollPos.x, evt.state.scrollPos.y)
                        })
                } else {
                    window.scrollTo(evt.state.scrollPos.x, evt.state.scrollPos.y);
                }
            }
        }
    }
}

module.exports = Router;

},{"../../core/event-emitter-mixin":55,"defaults-es6":8,"find-parent":11,"mixwith":12,"path-to-regexp":13}],62:[function(require,module,exports){
var EventEmitterMixin = require('../../core/event-emitter-mixin');
var MachineState = require('./machine-state-mixin');
const { hasMixin, Mixin, DeDupe, mix } = require('mixwith');

var StateMachine = Mixin(function(superClass) {
    return class extends mix(superClass).with(DeDupe(EventEmitterMixin)) {
        constructor(opts) {
            super(opts);
            Object.defineProperties(this, {
                stateClass: {value: opts.stateClass},
                currentState: {writable: true, value: null},
                previousState: {writable: true, value: null},
                states: {value: {}}
            });
        }
        onEnterState() {}
        onExitState() {}
        onUpdateState() {}

        static checkIfIsState(state) {
            var result = hasMixin(state, MachineState);
            if (!result) {
                console.warn("Supplied state class does not extend MachineState. Expect unreliable results.");
            }
            return result;
        }

        getState(state) {
            if (!state) {
                return null;
            }
            if (typeof state == 'string') {
                return this.states[state] || null;
            } else if (this.constructor.checkIfIsState(state)) {
                return state;
            }
            return null;
        }

        addState(key, state, onEnter, onExit) {
            if (this.constructor.checkIfIsState(state)) {
                this.states[key] = state;
            }
        }

        changeState(state, evt) {
            state = this.getState(state);

            var promise = Promise.resolve();
            
            if (state && this.currentState === state) {
                promise = Promise.all([
                        this.currentState.updateState(Object.assign({updatedState: this.currentState}, evt)),
                        this.onUpdateState(Object.assign({updatedState: this.currentState}, evt))
                    ])
                    .then(() => {
                        this.trigger('updatestate', Object.assign({updatedState: this.currentState}, evt));
                    })
            } else {
                if (this.currentState) {
                    this.previousState = this.currentState;
                    this.currentState = null;
                    promise = Promise.all([
                            this.previousState.exitState(Object.assign({exitedState: this.previousState, enteredState: state}, evt)),
                            this.onExitState(Object.assign({exitedState: this.previousState, enteredState: state}, evt))
                        ])
                        .then(() => {
                            this.trigger('exitstate', Object.assign({exitedState: this.previousState, enteredState: state}, evt));
                        });
                }
                if (state) {
                    promise = promise
                        .then(() => Promise.all([
                            state.enterState(Object.assign({exitedState: this.previousState, enteredState: this.currentState = state}, evt)), 
                            this.onEnterState(Object.assign({exitedState: this.previousState, enteredState: this.currentState}, evt))
                        ]))
                        .then(() => {
                            this.trigger('enterstate', Object.assign({exitedState: this.previousState, enteredState: this.currentState}, evt));
                        });
                }
            }
            return promise
                .then(() => this.currentState);
        }
    }
})
module.exports = StateMachine;

},{"../../core/event-emitter-mixin":55,"./machine-state-mixin":60,"mixwith":12}],63:[function(require,module,exports){
module.exports = require('../plugins/router')(require('./weddell'));

},{"../plugins/router":59,"./weddell":64}],64:[function(require,module,exports){
module.exports = require('../core/weddell');

},{"../core/weddell":58}],65:[function(require,module,exports){
const h = require('virtual-dom/h');
const svg = require('virtual-dom/virtual-hyperscript/svg');

module.exports = function(vNode, newChildren=null, preserveIfUnchanged=false) {
    return preserveIfUnchanged && !newChildren && !vNode.namespace ? vNode : 
        (vNode.namespace ? svg : h)(vNode.tagName, Object.assign({}, vNode.properties, {
            key: vNode.key
        }), newChildren || vNode.children);
};
},{"virtual-dom/h":19,"virtual-dom/virtual-hyperscript/svg":40}],66:[function(require,module,exports){
module.exports = function(arr) {
    return arr.filter(item => item != null);
};
},{}],67:[function(require,module,exports){
module.exports = function(arr1, arr2) {
    return arr1.filter(function(i) {return arr2.indexOf(i) < 0;});
};

},{}],68:[function(require,module,exports){
module.exports = function(arr) {
    return [].concat(...arr);
}
},{}],69:[function(require,module,exports){
module.exports = function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

},{}],70:[function(require,module,exports){
module.exports = function(arr) {
    return arr.reduce((acc, item) => acc.includes(item) ? acc : acc.concat(item), []);
}
},{}]},{},[63])(63)
});