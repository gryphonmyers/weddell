(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
(function (global){
/*! Native Promise Only
    v0.8.1 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(name,context,definition){
	// special form of UMD for polyfilling across evironments
	context[name] = context[name] || definition();
	if (typeof module != "undefined" && module.exports) { module.exports = context[name]; }
	else if (typeof define == "function" && define.amd) { define(function $AMD$(){ return context[name]; }); }
})("Promise",typeof global != "undefined" ? global : this,function DEF(){
	/*jshint validthis:true */
	"use strict";

	var builtInProp, cycle, scheduling_queue,
		ToString = Object.prototype.toString,
		timer = (typeof setImmediate != "undefined") ?
			function timer(fn) { return setImmediate(fn); } :
			setTimeout
	;

	// dammit, IE8.
	try {
		Object.defineProperty({},"x",{});
		builtInProp = function builtInProp(obj,name,val,config) {
			return Object.defineProperty(obj,name,{
				value: val,
				writable: true,
				configurable: config !== false
			});
		};
	}
	catch (err) {
		builtInProp = function builtInProp(obj,name,val) {
			obj[name] = val;
			return obj;
		};
	}

	// Note: using a queue instead of array for efficiency
	scheduling_queue = (function Queue() {
		var first, last, item;

		function Item(fn,self) {
			this.fn = fn;
			this.self = self;
			this.next = void 0;
		}

		return {
			add: function add(fn,self) {
				item = new Item(fn,self);
				if (last) {
					last.next = item;
				}
				else {
					first = item;
				}
				last = item;
				item = void 0;
			},
			drain: function drain() {
				var f = first;
				first = last = cycle = void 0;

				while (f) {
					f.fn.call(f.self);
					f = f.next;
				}
			}
		};
	})();

	function schedule(fn,self) {
		scheduling_queue.add(fn,self);
		if (!cycle) {
			cycle = timer(scheduling_queue.drain);
		}
	}

	// promise duck typing
	function isThenable(o) {
		var _then, o_type = typeof o;

		if (o != null &&
			(
				o_type == "object" || o_type == "function"
			)
		) {
			_then = o.then;
		}
		return typeof _then == "function" ? _then : false;
	}

	function notify() {
		for (var i=0; i<this.chain.length; i++) {
			notifyIsolated(
				this,
				(this.state === 1) ? this.chain[i].success : this.chain[i].failure,
				this.chain[i]
			);
		}
		this.chain.length = 0;
	}

	// NOTE: This is a separate function to isolate
	// the `try..catch` so that other code can be
	// optimized better
	function notifyIsolated(self,cb,chain) {
		var ret, _then;
		try {
			if (cb === false) {
				chain.reject(self.msg);
			}
			else {
				if (cb === true) {
					ret = self.msg;
				}
				else {
					ret = cb.call(void 0,self.msg);
				}

				if (ret === chain.promise) {
					chain.reject(TypeError("Promise-chain cycle"));
				}
				else if (_then = isThenable(ret)) {
					_then.call(ret,chain.resolve,chain.reject);
				}
				else {
					chain.resolve(ret);
				}
			}
		}
		catch (err) {
			chain.reject(err);
		}
	}

	function resolve(msg) {
		var _then, self = this;

		// already triggered?
		if (self.triggered) { return; }

		self.triggered = true;

		// unwrap
		if (self.def) {
			self = self.def;
		}

		try {
			if (_then = isThenable(msg)) {
				schedule(function(){
					var def_wrapper = new MakeDefWrapper(self);
					try {
						_then.call(msg,
							function $resolve$(){ resolve.apply(def_wrapper,arguments); },
							function $reject$(){ reject.apply(def_wrapper,arguments); }
						);
					}
					catch (err) {
						reject.call(def_wrapper,err);
					}
				})
			}
			else {
				self.msg = msg;
				self.state = 1;
				if (self.chain.length > 0) {
					schedule(notify,self);
				}
			}
		}
		catch (err) {
			reject.call(new MakeDefWrapper(self),err);
		}
	}

	function reject(msg) {
		var self = this;

		// already triggered?
		if (self.triggered) { return; }

		self.triggered = true;

		// unwrap
		if (self.def) {
			self = self.def;
		}

		self.msg = msg;
		self.state = 2;
		if (self.chain.length > 0) {
			schedule(notify,self);
		}
	}

	function iteratePromises(Constructor,arr,resolver,rejecter) {
		for (var idx=0; idx<arr.length; idx++) {
			(function IIFE(idx){
				Constructor.resolve(arr[idx])
				.then(
					function $resolver$(msg){
						resolver(idx,msg);
					},
					rejecter
				);
			})(idx);
		}
	}

	function MakeDefWrapper(self) {
		this.def = self;
		this.triggered = false;
	}

	function MakeDef(self) {
		this.promise = self;
		this.state = 0;
		this.triggered = false;
		this.chain = [];
		this.msg = void 0;
	}

	function Promise(executor) {
		if (typeof executor != "function") {
			throw TypeError("Not a function");
		}

		if (this.__NPO__ !== 0) {
			throw TypeError("Not a promise");
		}

		// instance shadowing the inherited "brand"
		// to signal an already "initialized" promise
		this.__NPO__ = 1;

		var def = new MakeDef(this);

		this["then"] = function then(success,failure) {
			var o = {
				success: typeof success == "function" ? success : true,
				failure: typeof failure == "function" ? failure : false
			};
			// Note: `then(..)` itself can be borrowed to be used against
			// a different promise constructor for making the chained promise,
			// by substituting a different `this` binding.
			o.promise = new this.constructor(function extractChain(resolve,reject) {
				if (typeof resolve != "function" || typeof reject != "function") {
					throw TypeError("Not a function");
				}

				o.resolve = resolve;
				o.reject = reject;
			});
			def.chain.push(o);

			if (def.state !== 0) {
				schedule(notify,def);
			}

			return o.promise;
		};
		this["catch"] = function $catch$(failure) {
			return this.then(void 0,failure);
		};

		try {
			executor.call(
				void 0,
				function publicResolve(msg){
					resolve.call(def,msg);
				},
				function publicReject(msg) {
					reject.call(def,msg);
				}
			);
		}
		catch (err) {
			reject.call(def,err);
		}
	}

	var PromisePrototype = builtInProp({},"constructor",Promise,
		/*configurable=*/false
	);

	// Note: Android 4 cannot use `Object.defineProperty(..)` here
	Promise.prototype = PromisePrototype;

	// built-in "brand" to signal an "uninitialized" promise
	builtInProp(PromisePrototype,"__NPO__",0,
		/*configurable=*/false
	);

	builtInProp(Promise,"resolve",function Promise$resolve(msg) {
		var Constructor = this;

		// spec mandated checks
		// note: best "isPromise" check that's practical for now
		if (msg && typeof msg == "object" && msg.__NPO__ === 1) {
			return msg;
		}

		return new Constructor(function executor(resolve,reject){
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			resolve(msg);
		});
	});

	builtInProp(Promise,"reject",function Promise$reject(msg) {
		return new this(function executor(resolve,reject){
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			reject(msg);
		});
	});

	builtInProp(Promise,"all",function Promise$all(arr) {
		var Constructor = this;

		// spec mandated checks
		if (ToString.call(arr) != "[object Array]") {
			return Constructor.reject(TypeError("Not an array"));
		}
		if (arr.length === 0) {
			return Constructor.resolve([]);
		}

		return new Constructor(function executor(resolve,reject){
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			var len = arr.length, msgs = Array(len), count = 0;

			iteratePromises(Constructor,arr,function resolver(idx,msg) {
				msgs[idx] = msg;
				if (++count === len) {
					resolve(msgs);
				}
			},reject);
		});
	});

	builtInProp(Promise,"race",function Promise$race(arr) {
		var Constructor = this;

		// spec mandated checks
		if (ToString.call(arr) != "[object Array]") {
			return Constructor.reject(TypeError("Not an array"));
		}

		return new Constructor(function executor(resolve,reject){
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			iteratePromises(Constructor,arr,function resolver(idx,msg){
				resolve(msg);
			},reject);
		});
	});

	return Promise;
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
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

},{"array-each":2,"array-slice":3,"for-own":16,"isobject":11}],16:[function(require,module,exports){
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

},{"for-in":10}],17:[function(require,module,exports){
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

},{"./sig":21,"debounce":5,"document-ready-promise":9,"mixwith-es5":12,"object.defaults/immutable":14}],18:[function(require,module,exports){
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
class Component extends mix(Component).with(EventEmitterMixin) {
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

},{"../utils/make-hash":29,"./event-emitter-mixin":19,"./sig":21,"array-compact":1,"array-uniq":4,"mixwith-es5":12,"object.defaults/immutable":14}],19:[function(require,module,exports){
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

},{"../utils/includes":28,"mixwith-es5":12,"object.defaults/immutable":14}],20:[function(require,module,exports){
var EventEmitterMixin = require('./event-emitter-mixin');
var mix = require('mixwith-es5').mix;

class Pipeline extends mix(Pipeline).with(EventEmitterMixin) {
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
            if (!transforms) {
                throw "Could not find a tranform path from " + this.inputFormat.validated + ' to ' + this.targetRenderFormat.validated;
            }
            this.template = Transform.compose(input, transforms);
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

module.exports = Pipeline;

},{"./event-emitter-mixin":19,"mixwith-es5":12}],21:[function(require,module,exports){
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

},{}],22:[function(require,module,exports){
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

class Store extends mix(Store).with(EventEmitterMixin) {
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

},{"../utils/difference":27,"../utils/includes":28,"../utils/make-hash":29,"./event-emitter-mixin":19,"deep-equal":6,"mixwith-es5":12,"object.defaults/immutable":14}],23:[function(require,module,exports){
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

},{}],24:[function(require,module,exports){
var mix = require('mixwith-es5').mix;
var App = require('./app');
var Component = require('./component');
var Store = require('./store');
var Pipeline = require('./pipeline');
var Transform = require('./transform');
var Sig = require('./sig');
var includes = require('../utils/includes');

class Weddell {
    static plugin(pluginObj) {
        Weddell = class extends Weddell {};
        if (!pluginObj.id) {
            throw 'Got a plugin with no ID assigned. Aborting';
        }
        if (!includes(Weddell.loadedPlugins, pluginObj.id)) {
            if (pluginObj.requires && !includes(Weddell.loadedPlugins, pluginObj.requires)) {
                [].concat(pluginObj.requires).forEach((plugReq) => {
                    throw 'Plugin ' + pluginObj.id + ' requires the plugin ' + plugReq + ', which is not loaded. Load ' + plugReq + ' first.';
                });
            }
            if (pluginObj.classes) {
                Object.entries(pluginObj.classes).forEach((entry) => {
                    var className = entry[0];
                    var classOrMixin = entry[1];
                    if (className in Weddell.classes) {
                        // Core class, we assume a mixin was passed and we should mix it
                        Weddell.classes[className] = mix(Weddell.classes[className]).with(classOrMixin);
                    } else {
                        // Helper class
                        Weddell.classes[className] = classOrMixin;
                    }
                });
                Object.values(Weddell.classes).forEach(function(commonClass){
                    commonClass.Weddell = Weddell;
                });
            }

            if (pluginObj.deps) {
                Object.entries(pluginObj.deps).forEach((entry) => {
                    if (entry[0] in Weddell.deps) {
                        throw 'Dependency conflict while loading plugin: ' + entry[0] + ' is taken.';
                    }
                    Weddell.deps[entry[0]] = entry[1];
                });
            }

            Weddell.loadedPlugins.push(pluginObj.id);
        } else {
            console.warn('Plugin ' + pluginObj.id + ' already loaded. Ignoring.');
        }
        return Weddell;
    }
}
Weddell.loadedPlugins = [];
Weddell.consts = {
    VAR_NAME: '_wdl'
};
Weddell.deps = {};
Weddell.classes = {App, Component, Store, Pipeline, Transform, Sig};
Object.values(Weddell.classes).forEach(function(commonClass){
    commonClass.Weddell = Weddell;
});
module.exports = Weddell;

},{"../utils/includes":28,"./app":17,"./component":18,"./pipeline":20,"./sig":21,"./store":22,"./transform":23,"mixwith-es5":12}],25:[function(require,module,exports){
require('native-promise-only');
module.exports = require('./weddell');

},{"./weddell":26,"native-promise-only":13}],26:[function(require,module,exports){
module.exports = require('../core/weddell');

},{"../core/weddell":24}],27:[function(require,module,exports){
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

},{"./includes":28}],28:[function(require,module,exports){
module.exports = function(arr, val){
    return arr.some(currKey=>currKey === val);
}

},{}],29:[function(require,module,exports){
module.exports = function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
};

},{}]},{},[25]);
