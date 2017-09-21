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

},{}],5:[function(require,module,exports){
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

},{"./lib/is_arguments.js":6,"./lib/keys.js":7}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{"for-in":10}],12:[function(require,module,exports){
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
},{}],15:[function(require,module,exports){
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

},{"./mutable":16,"array-slice":3}],16:[function(require,module,exports){
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

},{"array-each":2,"array-slice":3,"for-own":11,"isobject":12}],17:[function(require,module,exports){
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
/**
 * @file prescribe
 * @description Tiny, forgiving HTML parser
 * @version v1.1.3
 * @see {@link https://github.com/krux/prescribe/}
 * @license MIT
 * @author Derek Brans
 * @copyright 2017 Krux Digital, Inc
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Prescribe"] = factory();
	else
		root["Prescribe"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _HtmlParser = __webpack_require__(1);

	var _HtmlParser2 = _interopRequireDefault(_HtmlParser);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	module.exports = _HtmlParser2['default'];

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _supports = __webpack_require__(2);

	var supports = _interopRequireWildcard(_supports);

	var _streamReaders = __webpack_require__(3);

	var streamReaders = _interopRequireWildcard(_streamReaders);

	var _fixedReadTokenFactory = __webpack_require__(6);

	var _fixedReadTokenFactory2 = _interopRequireDefault(_fixedReadTokenFactory);

	var _utils = __webpack_require__(5);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * Detection regular expressions.
	 *
	 * Order of detection matters: detection of one can only
	 * succeed if detection of previous didn't

	 * @type {Object}
	 */
	var detect = {
	  comment: /^<!--/,
	  endTag: /^<\//,
	  atomicTag: /^<\s*(script|style|noscript|iframe|textarea)[\s\/>]/i,
	  startTag: /^</,
	  chars: /^[^<]/
	};

	/**
	 * HtmlParser provides the capability to parse HTML and return tokens
	 * representing the tags and content.
	 */

	var HtmlParser = function () {
	  /**
	   * Constructor.
	   *
	   * @param {string} stream The initial parse stream contents.
	   * @param {Object} options The options
	   * @param {boolean} options.autoFix Set to true to automatically fix errors
	   */
	  function HtmlParser() {
	    var _this = this;

	    var stream = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    _classCallCheck(this, HtmlParser);

	    this.stream = stream;

	    var fix = false;
	    var fixedTokenOptions = {};

	    for (var key in supports) {
	      if (supports.hasOwnProperty(key)) {
	        if (options.autoFix) {
	          fixedTokenOptions[key + 'Fix'] = true; // !supports[key];
	        }
	        fix = fix || fixedTokenOptions[key + 'Fix'];
	      }
	    }

	    if (fix) {
	      this._readToken = (0, _fixedReadTokenFactory2['default'])(this, fixedTokenOptions, function () {
	        return _this._readTokenImpl();
	      });
	      this._peekToken = (0, _fixedReadTokenFactory2['default'])(this, fixedTokenOptions, function () {
	        return _this._peekTokenImpl();
	      });
	    } else {
	      this._readToken = this._readTokenImpl;
	      this._peekToken = this._peekTokenImpl;
	    }
	  }

	  /**
	   * Appends the given string to the parse stream.
	   *
	   * @param {string} str The string to append
	   */


	  HtmlParser.prototype.append = function append(str) {
	    this.stream += str;
	  };

	  /**
	   * Prepends the given string to the parse stream.
	   *
	   * @param {string} str The string to prepend
	   */


	  HtmlParser.prototype.prepend = function prepend(str) {
	    this.stream = str + this.stream;
	  };

	  /**
	   * The implementation of the token reading.
	   *
	   * @private
	   * @returns {?Token}
	   */


	  HtmlParser.prototype._readTokenImpl = function _readTokenImpl() {
	    var token = this._peekTokenImpl();
	    if (token) {
	      this.stream = this.stream.slice(token.length);
	      return token;
	    }
	  };

	  /**
	   * The implementation of token peeking.
	   *
	   * @returns {?Token}
	   */


	  HtmlParser.prototype._peekTokenImpl = function _peekTokenImpl() {
	    for (var type in detect) {
	      if (detect.hasOwnProperty(type)) {
	        if (detect[type].test(this.stream)) {
	          var token = streamReaders[type](this.stream);

	          if (token) {
	            if (token.type === 'startTag' && /script|style/i.test(token.tagName)) {
	              return null;
	            } else {
	              token.text = this.stream.substr(0, token.length);
	              return token;
	            }
	          }
	        }
	      }
	    }
	  };

	  /**
	   * The public token peeking interface.  Delegates to the basic token peeking
	   * or a version that performs fixups depending on the `autoFix` setting in
	   * options.
	   *
	   * @returns {object}
	   */


	  HtmlParser.prototype.peekToken = function peekToken() {
	    return this._peekToken();
	  };

	  /**
	   * The public token reading interface.  Delegates to the basic token reading
	   * or a version that performs fixups depending on the `autoFix` setting in
	   * options.
	   *
	   * @returns {object}
	   */


	  HtmlParser.prototype.readToken = function readToken() {
	    return this._readToken();
	  };

	  /**
	   * Read tokens and hand to the given handlers.
	   *
	   * @param {Object} handlers The handlers to use for the different tokens.
	   */


	  HtmlParser.prototype.readTokens = function readTokens(handlers) {
	    var tok = void 0;
	    while (tok = this.readToken()) {
	      // continue until we get an explicit "false" return
	      if (handlers[tok.type] && handlers[tok.type](tok) === false) {
	        return;
	      }
	    }
	  };

	  /**
	   * Clears the parse stream.
	   *
	   * @returns {string} The contents of the parse stream before clearing.
	   */


	  HtmlParser.prototype.clear = function clear() {
	    var rest = this.stream;
	    this.stream = '';
	    return rest;
	  };

	  /**
	   * Returns the rest of the parse stream.
	   *
	   * @returns {string} The contents of the parse stream.
	   */


	  HtmlParser.prototype.rest = function rest() {
	    return this.stream;
	  };

	  return HtmlParser;
	}();

	exports['default'] = HtmlParser;


	HtmlParser.tokenToString = function (tok) {
	  return tok.toString();
	};

	HtmlParser.escapeAttributes = function (attrs) {
	  var escapedAttrs = {};

	  for (var name in attrs) {
	    if (attrs.hasOwnProperty(name)) {
	      escapedAttrs[name] = (0, _utils.escapeQuotes)(attrs[name], null);
	    }
	  }

	  return escapedAttrs;
	};

	HtmlParser.supports = supports;

	for (var key in supports) {
	  if (supports.hasOwnProperty(key)) {
	    HtmlParser.browserHasFlaw = HtmlParser.browserHasFlaw || !supports[key] && key;
	  }
	}

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	var tagSoup = false;
	var selfClose = false;

	var work = window.document.createElement('div');

	try {
	  var html = '<P><I></P></I>';
	  work.innerHTML = html;
	  exports.tagSoup = tagSoup = work.innerHTML !== html;
	} catch (e) {
	  exports.tagSoup = tagSoup = false;
	}

	try {
	  work.innerHTML = '<P><i><P></P></i></P>';
	  exports.selfClose = selfClose = work.childNodes.length === 2;
	} catch (e) {
	  exports.selfClose = selfClose = false;
	}

	work = null;

	exports.tagSoup = tagSoup;
	exports.selfClose = selfClose;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.comment = comment;
	exports.chars = chars;
	exports.startTag = startTag;
	exports.atomicTag = atomicTag;
	exports.endTag = endTag;

	var _tokens = __webpack_require__(4);

	/**
	 * Regular Expressions for parsing tags and attributes
	 *
	 * @type {Object}
	 */
	var REGEXES = {
	  startTag: /^<([\-A-Za-z0-9_!:]+)((?:\s+[\w\-]+(?:\s*=?\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
	  endTag: /^<\/([\-A-Za-z0-9_:]+)[^>]*>/,
	  attr: /(?:([\-A-Za-z0-9_]+)\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))|(?:([\-A-Za-z0-9_]+)(\s|$)+)/g,
	  fillAttr: /^(checked|compact|declare|defer|disabled|ismap|multiple|nohref|noresize|noshade|nowrap|readonly|selected)$/i
	};

	/**
	 * Reads a comment token
	 *
	 * @param {string} stream The input stream
	 * @returns {CommentToken}
	 */
	function comment(stream) {
	  var index = stream.indexOf('-->');
	  if (index >= 0) {
	    return new _tokens.CommentToken(stream.substr(4, index - 1), index + 3);
	  }
	}

	/**
	 * Reads non-tag characters.
	 *
	 * @param {string} stream The input stream
	 * @returns {CharsToken}
	 */
	function chars(stream) {
	  var index = stream.indexOf('<');
	  return new _tokens.CharsToken(index >= 0 ? index : stream.length);
	}

	/**
	 * Reads start tag token.
	 *
	 * @param {string} stream The input stream
	 * @returns {StartTagToken}
	 */
	function startTag(stream) {
	  var endTagIndex = stream.indexOf('>');
	  if (endTagIndex !== -1) {
	    var match = stream.match(REGEXES.startTag);
	    if (match) {
	      var attrs = {};
	      var booleanAttrs = {};
	      var rest = match[2];

	      match[2].replace(REGEXES.attr, function (match, name) {
	        if (!(arguments[2] || arguments[3] || arguments[4] || arguments[5])) {
	          attrs[name] = '';
	        } else if (arguments[5]) {
	          attrs[arguments[5]] = '';
	          booleanAttrs[arguments[5]] = true;
	        } else {
	          attrs[name] = arguments[2] || arguments[3] || arguments[4] || REGEXES.fillAttr.test(name) && name || '';
	        }

	        rest = rest.replace(match, '');
	      });

	      return new _tokens.StartTagToken(match[1], match[0].length, attrs, booleanAttrs, !!match[3], rest.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ''));
	    }
	  }
	}

	/**
	 * Reads atomic tag token.
	 *
	 * @param {string} stream The input stream
	 * @returns {AtomicTagToken}
	 */
	function atomicTag(stream) {
	  var start = startTag(stream);
	  if (start) {
	    var rest = stream.slice(start.length);
	    // for optimization, we check first just for the end tag
	    if (rest.match(new RegExp('<\/\\s*' + start.tagName + '\\s*>', 'i'))) {
	      // capturing the content is inefficient, so we do it inside the if
	      var match = rest.match(new RegExp('([\\s\\S]*?)<\/\\s*' + start.tagName + '\\s*>', 'i'));
	      if (match) {
	        return new _tokens.AtomicTagToken(start.tagName, match[0].length + start.length, start.attrs, start.booleanAttrs, match[1]);
	      }
	    }
	  }
	}

	/**
	 * Reads an end tag token.
	 *
	 * @param {string} stream The input stream
	 * @returns {EndTagToken}
	 */
	function endTag(stream) {
	  var match = stream.match(REGEXES.endTag);
	  if (match) {
	    return new _tokens.EndTagToken(match[1], match[0].length);
	  }
	}

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;
	exports.EndTagToken = exports.AtomicTagToken = exports.StartTagToken = exports.TagToken = exports.CharsToken = exports.CommentToken = exports.Token = undefined;

	var _utils = __webpack_require__(5);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * Token is a base class for all token types parsed.  Note we don't actually
	 * use intheritance due to IE8's non-existent ES5 support.
	 */
	var Token =
	/**
	 * Constructor.
	 *
	 * @param {string} type The type of the Token.
	 * @param {Number} length The length of the Token text.
	 */
	exports.Token = function Token(type, length) {
	  _classCallCheck(this, Token);

	  this.type = type;
	  this.length = length;
	  this.text = '';
	};

	/**
	 * CommentToken represents comment tags.
	 */


	var CommentToken = exports.CommentToken = function () {
	  /**
	   * Constructor.
	   *
	   * @param {string} content The content of the comment
	   * @param {Number} length The length of the Token text.
	   */
	  function CommentToken(content, length) {
	    _classCallCheck(this, CommentToken);

	    this.type = 'comment';
	    this.length = length || (content ? content.length : 0);
	    this.text = '';
	    this.content = content;
	  }

	  CommentToken.prototype.toString = function toString() {
	    return '<!--' + this.content;
	  };

	  return CommentToken;
	}();

	/**
	 * CharsToken represents non-tag characters.
	 */


	var CharsToken = exports.CharsToken = function () {
	  /**
	   * Constructor.
	   *
	   * @param {Number} length The length of the Token text.
	   */
	  function CharsToken(length) {
	    _classCallCheck(this, CharsToken);

	    this.type = 'chars';
	    this.length = length;
	    this.text = '';
	  }

	  CharsToken.prototype.toString = function toString() {
	    return this.text;
	  };

	  return CharsToken;
	}();

	/**
	 * TagToken is a base class for all tag-based Tokens.
	 */


	var TagToken = exports.TagToken = function () {
	  /**
	   * Constructor.
	   *
	   * @param {string} type The type of the token.
	   * @param {string} tagName The tag name.
	   * @param {Number} length The length of the Token text.
	   * @param {Object} attrs The dictionary of attributes and values
	   * @param {Object} booleanAttrs If an entry has 'true' then the attribute
	   *                              is a boolean attribute
	   */
	  function TagToken(type, tagName, length, attrs, booleanAttrs) {
	    _classCallCheck(this, TagToken);

	    this.type = type;
	    this.length = length;
	    this.text = '';
	    this.tagName = tagName;
	    this.attrs = attrs;
	    this.booleanAttrs = booleanAttrs;
	    this.unary = false;
	    this.html5Unary = false;
	  }

	  /**
	   * Formats the given token tag.
	   *
	   * @param {TagToken} tok The TagToken to format.
	   * @param {?string} [content=null] The content of the token.
	   * @returns {string} The formatted tag.
	   */


	  TagToken.formatTag = function formatTag(tok) {
	    var content = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	    var str = '<' + tok.tagName;
	    for (var key in tok.attrs) {
	      if (tok.attrs.hasOwnProperty(key)) {
	        str += ' ' + key;

	        var val = tok.attrs[key];
	        if (typeof tok.booleanAttrs === 'undefined' || typeof tok.booleanAttrs[key] === 'undefined') {
	          str += '="' + (0, _utils.escapeQuotes)(val) + '"';
	        }
	      }
	    }

	    if (tok.rest) {
	      str += ' ' + tok.rest;
	    }

	    if (tok.unary && !tok.html5Unary) {
	      str += '/>';
	    } else {
	      str += '>';
	    }

	    if (content !== undefined && content !== null) {
	      str += content + '</' + tok.tagName + '>';
	    }

	    return str;
	  };

	  return TagToken;
	}();

	/**
	 * StartTagToken represents a start token.
	 */


	var StartTagToken = exports.StartTagToken = function () {
	  /**
	   * Constructor.
	   *
	   * @param {string} tagName The tag name.
	   * @param {Number} length The length of the Token text
	   * @param {Object} attrs The dictionary of attributes and values
	   * @param {Object} booleanAttrs If an entry has 'true' then the attribute
	   *                              is a boolean attribute
	   * @param {boolean} unary True if the tag is a unary tag
	   * @param {string} rest The rest of the content.
	   */
	  function StartTagToken(tagName, length, attrs, booleanAttrs, unary, rest) {
	    _classCallCheck(this, StartTagToken);

	    this.type = 'startTag';
	    this.length = length;
	    this.text = '';
	    this.tagName = tagName;
	    this.attrs = attrs;
	    this.booleanAttrs = booleanAttrs;
	    this.html5Unary = false;
	    this.unary = unary;
	    this.rest = rest;
	  }

	  StartTagToken.prototype.toString = function toString() {
	    return TagToken.formatTag(this);
	  };

	  return StartTagToken;
	}();

	/**
	 * AtomicTagToken represents an atomic tag.
	 */


	var AtomicTagToken = exports.AtomicTagToken = function () {
	  /**
	   * Constructor.
	   *
	   * @param {string} tagName The name of the tag.
	   * @param {Number} length The length of the tag text.
	   * @param {Object} attrs The attributes.
	   * @param {Object} booleanAttrs If an entry has 'true' then the attribute
	   *                              is a boolean attribute
	   * @param {string} content The content of the tag.
	   */
	  function AtomicTagToken(tagName, length, attrs, booleanAttrs, content) {
	    _classCallCheck(this, AtomicTagToken);

	    this.type = 'atomicTag';
	    this.length = length;
	    this.text = '';
	    this.tagName = tagName;
	    this.attrs = attrs;
	    this.booleanAttrs = booleanAttrs;
	    this.unary = false;
	    this.html5Unary = false;
	    this.content = content;
	  }

	  AtomicTagToken.prototype.toString = function toString() {
	    return TagToken.formatTag(this, this.content);
	  };

	  return AtomicTagToken;
	}();

	/**
	 * EndTagToken represents an end tag.
	 */


	var EndTagToken = exports.EndTagToken = function () {
	  /**
	   * Constructor.
	   *
	   * @param {string} tagName The name of the tag.
	   * @param {Number} length The length of the tag text.
	   */
	  function EndTagToken(tagName, length) {
	    _classCallCheck(this, EndTagToken);

	    this.type = 'endTag';
	    this.length = length;
	    this.text = '';
	    this.tagName = tagName;
	  }

	  EndTagToken.prototype.toString = function toString() {
	    return '</' + this.tagName + '>';
	  };

	  return EndTagToken;
	}();

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports.escapeQuotes = escapeQuotes;

	/**
	 * Escape quotes in the given value.
	 *
	 * @param {string} value The value to escape.
	 * @param {string} [defaultValue=''] The default value to return if value is falsy.
	 * @returns {string}
	 */
	function escapeQuotes(value) {
	  var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

	  // There's no lookback in JS, so /(^|[^\\])"/ only matches the first of two `"`s.
	  // Instead, just match anything before a double-quote and escape if it's not already escaped.
	  return !value ? defaultValue : value.replace(/([^"]*)"/g, function (_, prefix) {
	    return (/\\/.test(prefix) ? prefix + '"' : prefix + '\\"'
	    );
	  });
	}

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	exports.__esModule = true;
	exports['default'] = fixedReadTokenFactory;
	/**
	 * Empty Elements - HTML 4.01
	 *
	 * @type {RegExp}
	 */
	var EMPTY = /^(AREA|BASE|BASEFONT|BR|COL|FRAME|HR|IMG|INPUT|ISINDEX|LINK|META|PARAM|EMBED)$/i;

	/**
	 * Elements that you can intentionally leave open (and which close themselves)
	 *
	 * @type {RegExp}
	 */
	var CLOSESELF = /^(COLGROUP|DD|DT|LI|OPTIONS|P|TD|TFOOT|TH|THEAD|TR)$/i;

	/**
	 * Corrects a token.
	 *
	 * @param {Token} tok The token to correct
	 * @returns {Token} The corrected token
	 */
	function correct(tok) {
	  if (tok && tok.type === 'startTag') {
	    tok.unary = EMPTY.test(tok.tagName) || tok.unary;
	    tok.html5Unary = !/\/>$/.test(tok.text);
	  }
	  return tok;
	}

	/**
	 * Peeks at the next token in the parser.
	 *
	 * @param {HtmlParser} parser The parser
	 * @param {Function} readTokenImpl The underlying readToken implementation
	 * @returns {Token} The next token
	 */
	function peekToken(parser, readTokenImpl) {
	  var tmp = parser.stream;
	  var tok = correct(readTokenImpl());
	  parser.stream = tmp;
	  return tok;
	}

	/**
	 * Closes the last token.
	 *
	 * @param {HtmlParser} parser The parser
	 * @param {Array<Token>} stack The stack
	 */
	function closeLast(parser, stack) {
	  var tok = stack.pop();

	  // prepend close tag to stream.
	  parser.prepend('</' + tok.tagName + '>');
	}

	/**
	 * Create a new token stack.
	 *
	 * @returns {Array<Token>}
	 */
	function newStack() {
	  var stack = [];

	  stack.last = function () {
	    return this[this.length - 1];
	  };

	  stack.lastTagNameEq = function (tagName) {
	    var last = this.last();
	    return last && last.tagName && last.tagName.toUpperCase() === tagName.toUpperCase();
	  };

	  stack.containsTagName = function (tagName) {
	    for (var i = 0, tok; tok = this[i]; i++) {
	      if (tok.tagName === tagName) {
	        return true;
	      }
	    }
	    return false;
	  };

	  return stack;
	}

	/**
	 * Return a readToken implementation that fixes input.
	 *
	 * @param {HtmlParser} parser The parser
	 * @param {Object} options Options for fixing
	 * @param {boolean} options.tagSoupFix True to fix tag soup scenarios
	 * @param {boolean} options.selfCloseFix True to fix self-closing tags
	 * @param {Function} readTokenImpl The underlying readToken implementation
	 * @returns {Function}
	 */
	function fixedReadTokenFactory(parser, options, readTokenImpl) {
	  var stack = newStack();

	  var handlers = {
	    startTag: function startTag(tok) {
	      var tagName = tok.tagName;

	      if (tagName.toUpperCase() === 'TR' && stack.lastTagNameEq('TABLE')) {
	        parser.prepend('<TBODY>');
	        prepareNextToken();
	      } else if (options.selfCloseFix && CLOSESELF.test(tagName) && stack.containsTagName(tagName)) {
	        if (stack.lastTagNameEq(tagName)) {
	          closeLast(parser, stack);
	        } else {
	          parser.prepend('</' + tok.tagName + '>');
	          prepareNextToken();
	        }
	      } else if (!tok.unary) {
	        stack.push(tok);
	      }
	    },
	    endTag: function endTag(tok) {
	      var last = stack.last();
	      if (last) {
	        if (options.tagSoupFix && !stack.lastTagNameEq(tok.tagName)) {
	          // cleanup tag soup
	          closeLast(parser, stack);
	        } else {
	          stack.pop();
	        }
	      } else if (options.tagSoupFix) {
	        // cleanup tag soup part 2: skip this token
	        readTokenImpl();
	        prepareNextToken();
	      }
	    }
	  };

	  function prepareNextToken() {
	    var tok = peekToken(parser, readTokenImpl);
	    if (tok && handlers[tok.type]) {
	      handlers[tok.type](tok);
	    }
	  }

	  return function fixedReadToken() {
	    prepareNextToken();
	    return correct(readTokenImpl());
	  };
	}

/***/ }
/******/ ])
});
;
},{}],20:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var mix = require('mixwith-es5').mix;
var EventEmitterMixin = require('./event-emitter-mixin');
var hasMixin = require('mixwith-es5').hasMixin;

var ActionDispatcher = function (_mix$with) {
    _inherits(ActionDispatcher, _mix$with);

    function ActionDispatcher(opts) {
        _classCallCheck(this, ActionDispatcher);

        var _this = _possibleConstructorReturn(this, (ActionDispatcher.__proto__ || Object.getPrototypeOf(ActionDispatcher)).call(this, opts));

        _this._dispatchees = [];
        return _this;
    }

    _createClass(ActionDispatcher, [{
        key: 'addDispatchee',
        value: function addDispatchee(dispatchee) {
            if (!hasMixin(dispatchee, EventEmitterMixin)) {
                console.warn("Attempted to add a non-event emitter object as a dispatchee to the action dispatcher.");
            }
            if (this._dispatchees.indexOf(dispatchee) === -1) {
                this._dispatchees.push(dispatchee);
                return this.trigger('adddispatchee', { dispatchee: dispatchee });
            }
            return false;
        }
    }, {
        key: 'dispatch',
        value: function dispatch(actionName, actionData) {
            var result = this._dispatchees.map(function (dispatchee) {
                return dispatchee.trigger(actionName, Object.assign({}, actionData));
            });
            this.trigger('dispatch', { actionName: actionName, actionData: actionData });
            return result;
        }
    }]);

    return ActionDispatcher;
}(mix(ActionDispatcher).with(EventEmitterMixin));

module.exports = ActionDispatcher;

},{"./event-emitter-mixin":23,"mixwith-es5":13}],21:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var App = function (_mix$with) {
    _inherits(App, _mix$with);

    function App(opts) {
        _classCallCheck(this, App);

        opts = defaults(opts, defaultOpts);

        var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, opts));

        _this.el = opts.el;
        _this.styleEl = opts.styleEl;
        _this.componentInitOpts = Array.isArray(opts.Component) ? opts.Component[1] : {};
        _this.Component = _this.makeComponentClass(Array.isArray(opts.Component) ? opts.Component[0] : opts.Component);
        _this.component = null;
        _this.renderInterval = opts.renderInterval;
        _this.stylesRenderFormat = opts.stylesRenderFormat;
        _this.markupRenderFormat = opts.markupRenderFormat;
        _this.markupTransforms = opts.markupTransforms;
        _this.stylesTransforms = opts.stylesTransforms;
        _this.renderers = {};
        var Sig = _this.constructor.Weddell.classes.Sig;

        var consts = _this.constructor.Weddell.consts;

        if (!_this.Component) {
            throw "There is no base component set for this app. Can't mount.";
        }
        if (consts.VAR_NAME in window) {
            throw "Namespace collision for", consts.VAR_NAME, "on window object. Aborting.";
        }

        Object.defineProperty(window, consts.VAR_NAME, {
            value: { app: _this, components: {} }
        });

        Object.defineProperty(_this, '_actionDispatcher', {
            value: new ActionDispatcher()
        });

        _this.on('createcomponent', function (evt) {
            _this._actionDispatcher.addDispatchee(evt.component);
            evt.component.on('createaction', function (evt) {
                _this._actionDispatcher.dispatch(evt.actionName, evt.actionData);
            });
        });
        return _this;
    }

    _createClass(App, [{
        key: 'renderCSS',
        value: function renderCSS(CSSString) {
            this.styleEl.textContent = CSSString;
        }
    }, {
        key: 'renderMarkup',
        value: function renderMarkup(evt) {
            if (!(evt.renderFormat in this.renderers)) {
                throw "No appropriate markup renderer found for format: " + evt.renderFormat;
            }
            this.renderers[evt.renderFormat].call(this, evt.output);
            this._actionDispatcher.dispatch('renderdommarkup', Object.assign({}, evt));
        }
    }, {
        key: 'renderStyles',
        value: function renderStyles(evt) {
            var flattenStyles = function flattenStyles(obj) {
                return (obj.output ? obj.output : '') + (obj.components ? obj.components.map(flattenStyles).join('') : '');
            };
            this.renderCSS(flattenStyles(evt));
            this._actionDispatcher.dispatch('renderdomstyles', Object.assign({}, evt));
        }
    }, {
        key: 'makeComponentClass',
        value: function makeComponentClass(ComponentClass) {
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
    }, {
        key: 'makeComponent',
        value: function makeComponent(componentInput) {
            return new this.Component({
                isRoot: true,
                targetStylesRenderFormat: this.stylesRenderFormat,
                targetMarkupRenderFormat: this.markupRenderFormat,
                markupTransforms: this.markupTransforms,
                stylesTransforms: this.stylesTransforms
            });
        }
    }, {
        key: 'init',
        value: function init() {
            var _this2 = this;

            Object.seal(this);
            return DOMReady.then(function () {
                if (typeof _this2.el == 'string') {
                    _this2.el = document.querySelector(_this2.el);
                }

                if (typeof _this2.styleEl == 'string') {
                    _this2.styleEl = document.querySelector(_this2.styleEl);
                } else if (!_this2.styleEl) {
                    _this2.styleEl = document.createElement('style');
                    _this2.styleEl.setAttribute('type', 'text/css');
                    document.head.appendChild(_this2.styleEl);
                }

                _this2.component = _this2.makeComponent(_this2.Component);

                _this2.trigger('createcomponent', { component: _this2.component });
                _this2.trigger('createrootcomponent', { component: _this2.component });
                _this2.component.on('createcomponent', function (evt) {
                    return _this2.trigger('createcomponent', Object.assign({}, evt));
                });

                _this2.component.on('markeddirty', function (evt) {
                    requestAnimationFrame(function () {
                        _this2.component.render(evt.pipelineName);
                    });
                });

                return _this2.component.init(_this2.componentInitOpts).then(function () {
                    _this2.component.on('rendermarkup', debounce(_this2.renderMarkup.bind(_this2), _this2.renderInterval));
                    _this2.component.on('renderstyles', debounce(_this2.renderStyles.bind(_this2), _this2.renderInterval));
                    _this2.component.render();
                });
            });
        }
    }]);

    return App;
}(mix(App).with(EventEmitterMixin));

module.exports = App;

},{"./action-dispatcher":20,"./component":22,"./event-emitter-mixin":23,"./sig":25,"debounce":4,"document-ready-promise":8,"mixwith-es5":13,"object.defaults/immutable":15}],22:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var Component = function (_mix$with) {
    _inherits(Component, _mix$with);

    function Component(opts) {
        _classCallCheck(this, Component);

        opts = defaults(opts, defaultOpts);

        var _this = _possibleConstructorReturn(this, (Component.__proto__ || Object.getPrototypeOf(Component)).call(this, opts));

        Sig = _this.constructor.Weddell.classes.Sig;
        var Pipeline = _this.constructor.Weddell.classes.Pipeline;
        var Store = _this.constructor.Weddell.classes.Store;

        Object.defineProperties(_this, {
            isRoot: { value: opts.isRoot },
            _isInit: { writable: true, value: false },
            defaultInitOpts: { value: defaults(opts.defaultInitOpts, defaultInitOpts) },
            _id: { value: generateHash() },
            inputs: { value: opts.inputs },
            renderers: { value: {} },
            _tagDirectives: { value: {} }
        });

        var inputMappings = _this.constructor._inputMappings;

        Object.defineProperties(_this, {
            props: {
                value: new Store(_this.inputs, {
                    shouldMonitorChanges: true,
                    extends: opts.parentComponent ? [opts.parentComponent.props, opts.parentComponent.state, opts.parentComponent.store] : null,
                    inputMappings: inputMappings
                })
            },
            store: {
                value: new Store(Object.assign({
                    $bind: _this.bindEvent.bind(_this),
                    $act: _this.createAction.bind(_this)
                }, opts.store), {
                    shouldMonitorChanges: false,
                    shouldEvalFunctions: false
                })
            },
            state: {
                value: new Store(defaults({
                    $id: function $id() {
                        return _this._id;
                    }
                }, opts.state))
            }
        });

        Object.defineProperties(_this, {
            _componentInstances: { value: Object.keys(opts.components).reduce(function (final, key) {
                    final[key] = {};
                    return final;
                }, {})
            },
            _locals: { value: new Store({}, { proxies: [_this.props, _this.state, _this.store], shouldMonitorChanges: false, shouldEvalFunctions: false }) }
        });

        Object.defineProperty(_this, '_pipelines', {
            value: {
                markup: new Pipeline({
                    name: 'markup',
                    store: _this._locals,
                    onRender: _this.onRenderMarkup.bind(_this),
                    isDynamic: !!opts.markupTemplate,
                    inputFormat: new Sig(opts.markupFormat),
                    transforms: opts.markupTransforms,
                    targetRenderFormat: opts.targetMarkupRenderFormat,
                    input: opts.markupTemplate || opts.markup || null
                }),
                styles: new Pipeline({
                    name: 'styles',
                    store: _this._locals,
                    onRender: _this.onRenderStyles.bind(_this),
                    isDynamic: !!opts.stylesTemplate,
                    inputFormat: new Sig(opts.stylesFormat),
                    transforms: opts.stylesTransforms,
                    targetRenderFormat: opts.targetStylesRenderFormat,
                    input: opts.stylesTemplate || opts.styles || null
                })
            }
        });

        Object.defineProperty(_this, 'components', {
            value: Object.entries(opts.components).reduce(function (final, entry) {
                final[entry[0]] = _this.createChildComponentClass(entry[0], entry[1]);
                return final;
            }, {})
        });

        Object.entries(_this._pipelines).forEach(function (entry) {
            return entry[1].on('markeddirty', function (evt) {
                _this.trigger('markeddirty', Object.assign({
                    pipeline: entry[1],
                    pipelineName: entry[0]
                }, evt));
            });
        });

        ['props', 'state'].forEach(function (propName) {
            _this[propName].on('change', function (evt) {
                _this.markDirty(evt.changedKey);
            });
        });

        window[_this.constructor.Weddell.consts.VAR_NAME].components[_this._id] = _this;
        return _this;
    }

    _createClass(Component, [{
        key: 'createAction',
        value: function createAction(actionName, actionData) {
            this.trigger('createaction', { actionName: actionName, actionData: actionData });
        }
    }, {
        key: 'onInit',
        value: function onInit() {
            //Default event handler, noop
        }
    }, {
        key: 'onRenderMarkup',
        value: function onRenderMarkup() {
            //Default event handler, noop
        }
    }, {
        key: 'onRenderStyles',
        value: function onRenderStyles() {
            //Default event handler, noop
        }
    }, {
        key: 'addTagDirective',
        value: function addTagDirective(name, directive) {
            this._tagDirectives[name.toUpperCase()] = directive;
        }
    }, {
        key: 'makeComponentClass',
        value: function makeComponentClass(ComponentClass) {
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
    }, {
        key: 'createChildComponentClass',
        value: function createChildComponentClass(componentName, ChildComponent) {
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

            var obj = {};
            obj[componentName] = function (_ChildComponent) {
                _inherits(_class, _ChildComponent);

                function _class(opts) {
                    _classCallCheck(this, _class);

                    var _this2 = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, defaults({
                        parentComponent: parentComponent,
                        targetMarkupRenderFormat: targetMarkupRenderFormat,
                        targetStylesRenderFormat: targetStylesRenderFormat,
                        markupTransforms: markupTransforms,
                        stylesTransforms: stylesTransforms
                    }, opts)));

                    parentComponent.trigger('createcomponent', { component: _this2, parentComponent: parentComponent, componentName: componentName });

                    _this2.on('createcomponent', function (evt) {
                        parentComponent.trigger('createcomponent', Object.assign({}, evt));
                    });

                    _this2.on('markeddirty', function (evt) {
                        parentComponent.markDirty();
                    });
                    return _this2;
                }

                return _class;
            }(ChildComponent);
            this.trigger('createcomponentclass', { ComponentClass: obj[componentName] });
            obj[componentName]._initOpts = initOpts;
            obj[componentName]._inputMappings = inputMappings;
            obj[componentName]._id = generateHash();

            return obj[componentName];
        }
    }, {
        key: 'init',
        value: function init(opts) {
            var _this3 = this;

            opts = defaults(opts, this.defaultInitOpts);
            if (!this._isInit) {
                this._isInit = true;
                return Promise.resolve(this.onInit(opts)).then(function () {
                    return _this3;
                });
            }
            return Promise.resolve(this);
        }
    }, {
        key: 'bindEvent',
        value: function bindEvent(funcText, opts) {
            var consts = this.constructor.Weddell.consts;
            return "(function(event){" + (opts && opts.preventDefault ? 'event.preventDefault();' : '') + (opts && opts.stopPropagation ? 'event.stopPropagation();' : '') + funcText + ";}.bind(window['" + consts.VAR_NAME + "'].components['" + this._id + "'], event)())";
        }
    }, {
        key: 'markDirty',
        value: function markDirty(changedKey) {
            return Object.values(this._pipelines).forEach(function (pipeline, pipelineType) {
                pipeline.markDirty(changedKey);
            });
        }
    }, {
        key: 'renderStyles',
        value: function renderStyles() {
            var _this4 = this;

            this.trigger('beforerenderstyles');

            return this._pipelines.styles.render().then(function (output) {
                return Promise.all(Object.entries(_this4.components).map(function (entry) {
                    var keys = Object.keys(_this4._componentInstances[entry[0]]);
                    if (keys.length) {
                        //TODO here we should probably just iterate over all component instances and render styles for each one, but we need some sort of mechanism for not repeating "static" styles
                        //TODO For now we just take the first instance and render that, assuming that all static styles are static styles, so no one instance's stles should be different from another
                        return _this4._componentInstances[entry[0]][keys[0]].renderStyles(); //entry[1].renderStyles();
                    }
                    return { component: _this4, output: '', wasRenderered: false };
                })).then(function (components) {
                    var evtObj = {
                        output: output,
                        component: _this4,
                        components: components,
                        wasRendered: true,
                        renderFormat: _this4._pipelines.styles.targetRenderFormat
                    };

                    _this4.trigger('renderstyles', Object.assign({}, evtObj));

                    return evtObj;
                });
            });
        }
    }, {
        key: 'render',
        value: function render(pipelineType) {
            var _this5 = this;

            this.trigger('beforerender');

            if (!pipelineType) {
                return Promise.all(Object.keys(this._pipelines).map(function (pipelineType) {
                    return _this5.render.call(_this5, pipelineType);
                }));
            }
            var pipeline = this._pipelines[pipelineType];
            var args = Array.from(arguments).slice(1);

            switch (pipelineType) {
                case 'markup':
                    var output = this.renderMarkup.apply(this, args);
                    break;
                case 'styles':
                    output = this.renderStyles.apply(this, args);
                    break;
                default:
            }

            return Promise.resolve(output).then(function (evt) {
                _this5.trigger('render', Object.assign({}, evt));
                return evt;
            });
        }
    }, {
        key: 'renderMarkup',
        value: function renderMarkup(content, props, targetFormat) {
            var _this6 = this;

            this.trigger('beforerendermarkup');

            var pipeline = this._pipelines.markup;

            if (!targetFormat) {
                targetFormat = pipeline.targetRenderFormat;
            }

            if (props) {
                Object.assign(this.props, Object.entries(props).filter(function (entry) {
                    var result = includes(_this6.inputs, entry[0]);
                    if (!result) throw "Unsupported prop: '" + entry[0] + "' (hint: is this key in your inputs?)";
                    return result;
                }).reduce(function (finalObj, entry) {
                    finalObj[entry[0]] = entry[1];
                    return finalObj;
                }, {}));
            }

            var components = {};
            var off = this.on('rendercomponent', function (componentResult) {
                if (!(componentResult.componentName in components)) {
                    components[componentResult.componentName] = [];
                }
                components[componentResult.componentName].push(componentResult);
            });
            return pipeline.render(targetFormat).then(function (output) {
                var renderFormat = targetFormat.val;
                if (!(renderFormat in _this6.renderers)) {
                    throw "No appropriate component markup renderer found for format: " + renderFormat;
                }
                return _this6.renderers[renderFormat].call(_this6, output, content).then(function (output) {
                    off();
                    var evObj = {
                        output: output,
                        component: _this6,
                        id: _this6._id,
                        components: components,
                        renderFormat: renderFormat
                    };

                    _this6.trigger('rendermarkup', Object.assign({}, evObj));
                    return evObj;
                });
            });
        }
    }, {
        key: 'makeComponentInstance',
        value: function makeComponentInstance(componentName, index, opts) {
            var instance = new this.components[componentName]({
                store: defaults({
                    $componentID: this.components[componentName]._id,
                    $instanceKey: index
                })
            });
            return instance;
        }
    }, {
        key: 'getComponentInstance',
        value: function getComponentInstance(componentName, index) {
            var instances = this._componentInstances[componentName];
            if (instances && !(index in instances)) {
                this.markDirty(); //TODO right now we just assume that if the desired component instance doesn't exist that we should mark the whole component dirty. There is a possible optimization in here somewhere.
                return (instances[index] = this.makeComponentInstance(componentName, index)).init(this.constructor._initOpts);
            }
            return Promise.resolve(instances ? instances[index] : null);
        }
    }, {
        key: 'cleanupComponentInstances',
        value: function cleanupComponentInstances() {
            //TODO right now, if a component becomes unused, it will continue to sit in memory and possibly generate events. We should probably clean them up.
        }
    }]);

    return Component;
}(mix(Component).with(EventEmitterMixin));

module.exports = Component;

},{"../utils/includes":37,"../utils/make-hash":38,"./event-emitter-mixin":23,"./sig":25,"mixwith-es5":13,"object.defaults/immutable":15}],23:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Mixin = require('mixwith-es5').Mixin;
var hasMixin = require('mixwith-es5').hasMixin;
var defaults = require('object.defaults/immutable');
var includes = require('../utils/includes');

var EventEmitterMixin = Mixin(function (superClass) {
    return function (_superClass) {
        _inherits(_class, _superClass);

        function _class(opts) {
            _classCallCheck(this, _class);

            var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, opts));

            Object.defineProperties(_this, {
                _callbacks: { value: {} }
            });
            return _this;
        }

        _createClass(_class, [{
            key: 'on',
            value: function on(eventName, callback) {
                var _this2 = this;

                if (Array.isArray(eventName)) {
                    eventName.forEach(function (evName) {
                        return _this2.on(evName, callback);
                    });
                } else {
                    if (!(eventName in this._callbacks)) {
                        this._callbacks[eventName] = [];
                    }
                    this._callbacks[eventName] = this._callbacks[eventName].concat(callback);
                }
                return function () {
                    return _this2.off(eventName, callback);
                };
            }
        }, {
            key: 'once',
            value: function once(eventName, callback) {
                var self = this;
                var off = this.on(eventName, function () {
                    callback.apply(this, arguments);
                    off();
                });
                return off;
            }
        }, {
            key: 'off',
            value: function (_off) {
                function off(_x, _x2) {
                    return _off.apply(this, arguments);
                }

                off.toString = function () {
                    return _off.toString();
                };

                return off;
            }(function (eventName, callback) {
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
            })
        }, {
            key: 'trigger',
            value: function trigger(eventName, eventObj, thisArg) {
                var _this3 = this;

                if (Array.isArray(eventName)) {
                    return eventName.map(function (evtName) {
                        return _this3.trigger(evtName, eventObj, thisArg);
                    });
                } else {
                    if (eventName in this._callbacks) {
                        return this._callbacks[eventName].map(function (cb) {
                            return cb.call(thisArg || _this3, eventObj);
                        });
                    }
                }
            }
        }]);

        return _class;
    }(superClass);
});

module.exports = EventEmitterMixin;

},{"../utils/includes":37,"mixwith-es5":13,"object.defaults/immutable":15}],24:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitterMixin = require('./event-emitter-mixin');
var mix = require('mixwith-es5').mix;

var Pipeline = function (_mix$with) {
    _inherits(Pipeline, _mix$with);

    function Pipeline(opts) {
        _classCallCheck(this, Pipeline);

        var _this = _possibleConstructorReturn(this, (Pipeline.__proto__ || Object.getPrototypeOf(Pipeline)).call(this, opts));

        var Sig = _this.constructor.Weddell.classes.Sig;
        Object.defineProperties(_this, {
            isDirty: { value: false, writable: true },
            name: { value: opts.name },
            template: { value: null, writable: true },
            input: { value: opts.input, writable: true },
            static: { value: null, writable: true },
            onRender: { value: opts.onRender },
            _store: { value: opts.store },
            _cache: { value: null, writable: true },
            _watchedProperties: { value: {}, writable: true },
            _promise: { value: Promise.resolve(), writable: true },
            _requestHandle: { value: null, writable: true },
            _currentResolve: { value: null, writable: true },
            inputFormat: { value: new Sig(opts.inputFormat) },
            _isDynamic: { value: opts.isDynamic, writable: true },
            transforms: { value: opts.transforms, writable: true },
            targetRenderFormat: { value: new Sig(opts.targetRenderFormat) },
            _instances: { value: {}, writable: true },
            _isInit: { value: false, writable: true }
        });
        return _this;
    }

    _createClass(Pipeline, [{
        key: 'init',
        value: function init() {
            if (!this._isInit) {
                if (this.input) {
                    this.template = this.processInput(this.targetRenderFormat);
                }
                this._isInit = true;
            }
        }
    }, {
        key: 'processInput',
        value: function processInput(targetRenderFormat) {
            var _this2 = this;

            var input = this.input;
            var Transform = this.constructor.Weddell.classes.Transform;
            var Sig = this.constructor.Weddell.classes.Sig;
            var transforms;
            var inputFormat = this.inputFormat;
            var template;
            //TODO clean up this mess of a function
            if (this._isDynamic && inputFormat.parsed.type !== 'function') {
                var transforms = Transform.getMatchingTransforms(this.transforms, inputFormat, '(locals:Object, ...Any)=>Any');
                if (!transforms) {
                    throw "Could not find appropriate transform to turn " + this.inputFormat + " into a template function.";
                }
                var templateTransform;
                transforms = transforms.reduce(function (finalVal, transform) {
                    if (!finalVal) {
                        var returnType = new Sig(transform.to.parsed.returns);
                        var result = Transform.getTransformPath(_this2.transforms, returnType, targetRenderFormat);
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
                transforms = this.transforms.reduce(function (finalVal, transform) {
                    return finalVal || Transform.getTransformPath(_this2.transforms, returnType, targetRenderFormat);
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

                if (!transforms) {
                    throw "Could not find appropriate transform for " + this.inputFormat.validated + " to " + targetRenderFormat.validated;
                }

                template = function template() {
                    return Transform.applyTransforms(input, transforms);
                };
            }

            return template;
        }
    }, {
        key: 'markDirty',
        value: function markDirty(changedKey) {
            if (!this.isDirty && (!changedKey || changedKey in this._watchedProperties)) {
                this.isDirty = true;
                this.trigger('markeddirty', { changedKey: changedKey });
                return true;
            }
            return false;
        }
    }, {
        key: 'callTemplate',
        value: function callTemplate(locals, template) {
            return template.call(this, locals);
        }
    }, {
        key: 'render',
        value: function render(targetFormat) {
            var _this3 = this;

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
                var off = this._store.on('get', function (evt) {
                    accessed[evt.key] = 1;
                });
                var output = template ? this.callTemplate(this._store, template) : this.static;
                //TODO this could potentially miss some changed keys if they are accessed inside a promise callback within the template. We can't turn the event listener off later though, because then we might catch some keys accessed by other processes. a solution might be to come up with a way to only listen for keys accessed by THIS context
                off();
                this._watchedProperties = accessed;

                return Promise.resolve(output ? Promise.resolve(this.onRender ? this.onRender.call(this, output) : output).then(function () {
                    _this3.isDirty = false;
                    _this3._cache = output;
                    _this3.trigger('render', { output: output });
                    return output;
                }) : null);
            }
            return Promise.resolve(this._cache);
        }
    }]);

    return Pipeline;
}(mix(Pipeline).with(EventEmitterMixin));

module.exports = Pipeline;

},{"./event-emitter-mixin":23,"mixwith-es5":13}],25:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sig = function () {
    function Sig(str) {
        var _this = this;

        _classCallCheck(this, Sig);

        if ((typeof str === 'undefined' ? 'undefined' : _typeof(str)) === 'object' && str.constructor === this.constructor) {
            Object.defineProperties(this, Object.getOwnPropertyDescriptors(str));
        } else {
            this.val = (typeof str === 'undefined' ? 'undefined' : _typeof(str)) === 'object' ? this.constructor.format(str) : str;
            Object.defineProperties(this, {
                _parsed: { value: null, writable: true },
                _validated: { value: null, writable: true },
                parsed: {
                    get: function get() {
                        return _this._parsed ? _this._parsed : _this._parsed = _this.constructor.parse(_this.val);
                    }
                },
                validated: {
                    get: function get() {
                        return _this._validated ? _this._validated : _this._validated = _this.constructor.format(_this.parsed);
                    }
                }
            });
        }
    }

    _createClass(Sig, [{
        key: 'checkIfMatch',
        value: function checkIfMatch(sig, strict) {
            if (typeof sig === 'string') {
                sig = new this.constructor(sig);
            }
            return sig.validated === this.validated || this.constructor.compare(this.parsed, sig.parsed, strict);
        }
    }, {
        key: 'wrap',
        value: function wrap(funcName, args) {
            return new this.constructor((funcName ? funcName + ':' : '') + '(' + (args ? args.join(',') : '') + ')=>' + this.val);
        }
    }], [{
        key: 'parseArgs',
        value: function parseArgs(str) {
            var _this2 = this;

            return str ? str.split(',').map(function (arg) {
                var rest = arg.split('...');
                if (rest.length > 1) {
                    arg = rest[1];
                    return _this2.parseVal(arg, true);
                }
                return _this2.parseVal(arg);
            }) : [];
        }
    }, {
        key: 'parse',
        value: function parse(str) {
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
                    };
                } else if (arr[4]) {
                    //not func
                    return this.parseVal(arr[4]);
                }
            }
            console.warn("No matches for signature:", str, "Please ensure it is valid");
        }
    }, {
        key: 'parseVal',
        value: function parseVal(str, variadic) {
            var parsed = str.split(':').map(function (str) {
                return str.trim();
            });
            return { name: parsed[1] ? parsed[0] : undefined, type: parsed[1] || parsed[0], variadic: variadic };
        }
    }, {
        key: 'formatVal',
        value: function formatVal(obj) {
            return obj.name ? obj.name + ':' + obj.type : obj.type;
        }
    }, {
        key: 'formatArgs',
        value: function formatArgs(args) {
            var _this3 = this;

            return args.map(function (arg) {
                return (arg.variadic && '...' || '') + _this3.formatVal(arg);
            }).join(',');
        }
    }, {
        key: 'formatFunc',
        value: function formatFunc(obj) {
            return (obj.name ? obj.name + ':' : '') + '(' + this.formatArgs(obj.args) + ')=>' + this.format(obj.returns);
        }
    }, {
        key: 'format',
        value: function format(obj) {
            if (obj.type === 'function') {
                return this.formatFunc(obj);
            } else {
                return this.formatVal(obj);
            }
        }
    }, {
        key: 'compare',
        value: function compare(obj1, obj2, strict) {
            return obj1 && obj2 && this.compareTypes(obj1.type, obj2.type, strict) && (!obj1.name || !obj2.name || obj1.name === obj2.name) && obj1.variadic === obj1.variadic && (obj1.type !== 'function' && obj2.type !== 'function' || this.compare(obj1.returns, obj2.returns));
        }
    }, {
        key: 'compareTypes',
        value: function compareTypes(type1, type2, strict) {
            return type1 === 'Any' || type2 === 'Any' || type1 === type2 || (strict ? false : this.checkTypeAliases(type1, type2));
        }
    }, {
        key: 'checkTypeAliases',
        value: function checkTypeAliases(type1, type2) {
            //TODO recursive check to get inherited aliases
            return this.customTypes.filter(function (typeObj) {
                return typeObj.alias === type1;
            }).some(function (typeObj) {
                return typeObj.type === type2;
            }) || this.customTypes.filter(function (typeObj) {
                return typeObj.alias === type2;
            }).some(function (typeObj) {
                return typeObj.type === type1;
            });
        }
    }, {
        key: 'addTypeAlias',
        value: function addTypeAlias(alias, type) {
            if (alias === 'Any') throw "Cannot alias a type to 'Any'";
            this.customTypes.push({ type: type, alias: alias });
        }
    }]);

    return Sig;
}();

Sig.pattern = /(?:(?:(?:([^\(]*):)*\(([^\(]+)\)=>(.*))|(.+))/;
Sig.customTypes = [];

module.exports = Sig;

},{}],26:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var Store = function (_mix$with) {
    _inherits(Store, _mix$with);

    function Store(data, opts) {
        _classCallCheck(this, Store);

        opts = defaults(opts, defaultOpts);

        var _this = _possibleConstructorReturn(this, (Store.__proto__ || Object.getPrototypeOf(Store)).call(this));

        Object.defineProperties(_this, {
            shouldMonitorChanges: { value: opts.shouldMonitorChanges },
            shouldEvalFunctions: { value: opts.shouldEvalFunctions },
            _data: { configurable: false, value: {} },
            _dependencyKeys: { configurable: false, value: {} },
            _dependentKeys: { configurable: false, value: {} },
            _proxyObjs: { configurable: false, value: {} },
            _proxyProps: { configurable: false, value: {} },
            proxies: { value: Array.isArray(opts.proxies) ? opts.proxies : opts.proxies ? [opts.proxies] : [] },
            extends: { value: Array.isArray(opts.extends) ? opts.extends : opts.extends ? [opts.extends] : [] },
            inputMappings: { value: opts.inputMappings }
        });

        difference(Object.values(_this.inputMappings), Object.keys(data)).forEach(function (key) {
            _this.set(key, null);
        });

        if (data) {
            _this.assign(data);
        }

        _this.extends.forEach(function (obj) {
            obj.on('change', function (evt) {
                if (evt.changedKey in this.inputMappings) {
                    evt = Object.assign({}, evt);
                    evt.changedKey = this.inputMappings[evt.changedKey];
                    this.trigger('change', evt);
                }
            }.bind(_this));

            obj.on('get', function (evt) {
                if (evt.key in this.inputMappings) {
                    evt = Object.assign({}, evt);
                    evt.key = this.inputMappings[evt.key];
                    this.trigger('change', evt);
                }
            }.bind(_this));
        });

        Object.keys(_this.inputMappings).forEach(function (key) {
            _this.set(key, null, true);
        });

        _this.proxies.forEach(function (proxy) {
            Object.keys(proxy).forEach(function (key) {
                _this.set(key, null, true);
            });

            proxy.on('change', function (evt) {
                if (!(evt.changedKey in _this._data) && !(evt.changedKey in _this.inputMappings)) {
                    _this.trigger('change', Object.assign({}, evt));
                }
            });
            proxy.on('get', function (evt) {
                if (!(evt.key in _this._data) && !(evt.key in _this.inputMappings)) {
                    _this.trigger('get', Object.assign({}, evt));
                }
            });
        });
        return _this;
    }

    _createClass(Store, [{
        key: 'set',
        value: function set(key, val, isReadOnly) {
            if (!(key in this)) {
                if (!isReadOnly) {
                    var setter = function (newValue) {
                        var _this2 = this;

                        if (this.shouldMonitorChanges) {
                            var oldValue = this._data[key];
                            if (oldValue && (typeof oldValue === 'undefined' ? 'undefined' : _typeof(oldValue)) == "object") {
                                var oldValue = assign({}, oldValue);
                            }
                        }
                        this._data[key] = newValue;
                        if (this.shouldMonitorChanges) {
                            if (!deepEqual(newValue, oldValue)) {
                                this.trigger('change', { changedKey: key, newValue: newValue, oldValue: oldValue });
                                if (key in this._dependentKeys) {
                                    this._dependentKeys[entry[0]].forEach(function (dependentKey) {
                                        _this2.trigger('change', { changedKey: dependentKey, changedDependencyKey: entry[0], newDependencyValue: newValue, oldDependencyValue: oldValue });
                                    });
                                }
                            }
                        }
                    }.bind(this);
                }

                Object.defineProperty(this, key, {
                    configurable: false,
                    enumerable: true,
                    get: function () {
                        var value = this.getValue(key);
                        this.trigger('get', { key: key, value: value });
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
    }, {
        key: 'getValue',
        value: function getValue(key) {
            var val = this._data[key];
            var i = 0;
            var mappingEntry = Object.entries(this.inputMappings).find(function (entry) {
                return key === entry[1];
            });

            while (mappingEntry && this.extends[i] && (typeof val === 'undefined' || val === null)) {
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
    }, {
        key: 'assign',
        value: function assign(data) {
            var _this3 = this;

            if (data) {
                if (Array.isArray(data)) {
                    data.forEach(function (key) {
                        return _this3.set(key, null);
                    });
                } else {
                    Object.entries(data).forEach(function (entry) {
                        _this3.set(entry[0], entry[1]);
                    });
                }
            }
        }
    }, {
        key: 'evaluateFunctionProperty',
        value: function evaluateFunctionProperty(key) {
            var dependencyKeys = [];
            var off = this.on('get', function (evt) {
                dependencyKeys.push(evt.key);
            });
            this.trigger('evaluate.before', { key: key });
            var result = this._data[key].call(this);
            this.trigger('evaluate', { key: key });
            off();

            this.setDependencyKeys(key, dependencyKeys);

            return result;
        }
    }, {
        key: 'setDependencyKeys',
        value: function setDependencyKeys(key, dependencyKeys) {
            if (key in this._dependencyKeys) {
                var unusedKeys = difference(this._dependencyKeys[key], dependencyKeys);
                var newKeys = difference(dependencyKeys, this._dependencyKeys[key]);
            } else {
                unusedKeys = [];
                newKeys = dependencyKeys;
            }

            newKeys.forEach(function (newKey) {
                if (!(newKey in this._dependentKeys)) {
                    this._dependentKeys[newKey] = [key];
                } else if (!includes(this._dependentKeys[newKey], key)) {
                    this._dependentKeys[newKey] = this._dependentKeys[newKey].concat(key);
                }
            }.bind(this));

            unusedKeys.forEach(function (unusedKey) {
                if (unusedKey in this._dependentKeys) {
                    var i = this._dependentKeys[unusedKey].indexOf(key);
                    if (i > -1) {
                        this._dependentKeys[unusedKey].splice(i, 1);
                    }
                }
            }.bind(this));

            return this._dependencyKeys[key] = dependencyKeys;
        }
    }, {
        key: 'watch',
        value: function watch(key, func, shouldWaitForDefined) {
            if (typeof shouldWaitForDefined == 'undefined') shouldWaitForDefined = true;
            if (!Array.isArray(key)) {
                key = [key];
            }
            this.on('change', function (evt) {
                var _this4 = this;

                if (includes(key, evt.changedKey)) {
                    var vals = key.map(function (currKey) {
                        return _this4[currKey];
                    });
                    if (!shouldWaitForDefined || vals.every(function (val) {
                        return typeof val !== 'undefined';
                    })) {
                        func.apply(this, vals);
                    }
                }
            });
        }
    }]);

    return Store;
}(mix(Store).with(EventEmitterMixin));

module.exports = Store;

},{"../utils/difference":36,"../utils/includes":37,"../utils/make-hash":38,"./event-emitter-mixin":23,"deep-equal":5,"mixwith-es5":13,"object.defaults/immutable":15}],27:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Transform = function () {
    function Transform(opts) {
        _classCallCheck(this, Transform);

        var Sig = this.constructor.Weddell.classes.Sig;
        this.func = opts.func;
        this.from = new Sig(opts.from);
        this.to = new Sig(opts.to);
    }

    _createClass(Transform, [{
        key: "applyTransform",
        value: function applyTransform(input) {
            return this.func(input);
        }
    }], [{
        key: "applyTransforms",
        value: function applyTransforms(input, transforms) {
            var _this = this;

            return transforms.reduce(function (finalVal, transform) {
                return Array.isArray(transform) ? _this.applyTransforms(finalVal, transform) : transform.applyTransform(finalVal);
            }, input);
        }
    }, {
        key: "getMatchingTransforms",
        value: function getMatchingTransforms(transforms, from, to) {
            return transforms.filter(function (transform) {
                return (!to || transform.to.checkIfMatch(to)) && (!from || transform.from.checkIfMatch(from));
            });
        }
    }, {
        key: "compose",
        value: function compose(func, transforms) {
            return transforms.reduce(function (composed, transform) {
                return function () {
                    return transform.applyTransform(composed.apply(this, arguments));
                };
            }, func);
        }
    }, {
        key: "getTransformPath",
        value: function getTransformPath(transforms, from, to, _soFar) {
            var _this2 = this;

            //TODO add heuristics to make this process faster
            if (!_soFar) _soFar = [];
            if (from.checkIfMatch(to)) {
                return _soFar;
            }
            return transforms.filter(function (transform) {
                return transform.from.checkIfMatch(from, true);
            }).reduce(function (finalVal, transform) {
                return finalVal || _this2.getTransformPath(transforms, transform.to, to, _soFar.concat(transform));
            }, null);
        }
    }]);

    return Transform;
}();

Transform.heuristics = {};

module.exports = Transform;

},{}],28:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mix = require('mixwith-es5').mix;
var App = require('./app');
var Component = require('./component');
var Store = require('./store');
var Pipeline = require('./pipeline');
var Transform = require('./transform');
var Sig = require('./sig');
var includes = require('../utils/includes');

var _Weddell = function () {
    function _Weddell() {
        _classCallCheck(this, _Weddell);
    }

    _createClass(_Weddell, null, [{
        key: 'plugin',
        value: function plugin(pluginObj) {
            var NewWeddell = function (_Weddell2) {
                _inherits(NewWeddell, _Weddell2);

                function NewWeddell() {
                    _classCallCheck(this, NewWeddell);

                    return _possibleConstructorReturn(this, (NewWeddell.__proto__ || Object.getPrototypeOf(NewWeddell)).apply(this, arguments));
                }

                return NewWeddell;
            }(_Weddell);

            ;
            if (!pluginObj.id) {
                throw 'Got a plugin with no ID assigned. Aborting';
            }
            if (!includes(NewWeddell.loadedPlugins, pluginObj.id)) {
                if (pluginObj.requires && !includes(NewWeddell.loadedPlugins, pluginObj.requires)) {
                    [].concat(pluginObj.requires).forEach(function (plugReq) {
                        throw 'Plugin ' + pluginObj.id + ' requires the plugin ' + plugReq + ', which is not loaded. Load ' + plugReq + ' first.';
                    });
                }
                if (pluginObj.classes) {
                    Object.entries(pluginObj.classes).forEach(function (entry) {
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
                    Object.values(NewWeddell.classes).forEach(function (commonClass) {
                        commonClass.NewWeddell = NewWeddell;
                    });
                }

                if (pluginObj.deps) {
                    Object.entries(pluginObj.deps).forEach(function (entry) {
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
    }]);

    return _Weddell;
}();

_Weddell.loadedPlugins = [];
_Weddell.consts = {
    VAR_NAME: '_wdl',
    INDEX_ATTR_NAME: 'data-component-index'
};
_Weddell.deps = {};
_Weddell.classes = { App: App, Component: Component, Store: Store, Pipeline: Pipeline, Transform: Transform, Sig: Sig };
Object.values(_Weddell.classes).forEach(function (commonClass) {
    commonClass.Weddell = _Weddell;
});
module.exports = _Weddell;

},{"../utils/includes":37,"./app":21,"./component":22,"./pipeline":24,"./sig":25,"./store":26,"./transform":27,"mixwith-es5":13}],29:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Parser = require('prescribe');
var Mixin = require('mixwith-es5').Mixin;
var defaults = require('object.defaults/immutable');
var includes = require('../../utils/includes');

var defaultComponentOpts = {
    markupFormat: 'HTMLString'
};
var defaultAppOpts = {
    markupRenderFormat: 'HTMLString'
};

module.exports = function (Weddell, pluginOpts) {
    return Weddell.plugin({
        id: 'html',
        classes: {
            Sig: Mixin(function (_Sig) {
                _Sig = function (_Sig2) {
                    _inherits(Sig, _Sig2);

                    function Sig() {
                        _classCallCheck(this, Sig);

                        return _possibleConstructorReturn(this, (Sig.__proto__ || Object.getPrototypeOf(Sig)).apply(this, arguments));
                    }

                    return Sig;
                }(_Sig);
                _Sig.addTypeAlias('HTMLString', 'String');
                return _Sig;
            }),
            App: Mixin(function (App) {
                return function (_App) {
                    _inherits(_class, _App);

                    function _class(opts) {
                        _classCallCheck(this, _class);

                        opts = defaults(opts, defaultAppOpts);

                        var _this2 = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, opts));

                        _this2.renderers.HTMLString = _this2.renderHTML.bind(_this2);
                        return _this2;
                    }

                    _createClass(_class, [{
                        key: 'renderHTML',
                        value: function renderHTML(html) {
                            if (this.el) {
                                this.el.innerHTML = html;
                            }
                        }
                    }]);

                    return _class;
                }(App);
            }),
            Component: Mixin(function (Component) {
                var Component = function (_Component) {
                    _inherits(Component, _Component);

                    function Component(opts) {
                        _classCallCheck(this, Component);

                        opts = defaults(opts, defaultComponentOpts);

                        var _this3 = _possibleConstructorReturn(this, (Component.__proto__ || Object.getPrototypeOf(Component)).call(this, opts));

                        _this3.renderers.HTMLString = _this3.interpolateHTMLComponents.bind(_this3);
                        return _this3;
                    }

                    _createClass(Component, [{
                        key: 'interpolateHTMLComponents',
                        value: function interpolateHTMLComponents(HTMLStr, content, renderedComponents) {
                            var _this4 = this;

                            var parser = new Parser(HTMLStr.trim());
                            var componentNames = Object.keys(this.components);
                            var component;
                            var tagDepth = 0;
                            var result = [];
                            var contentTagDepth;

                            if (!renderedComponents) {
                                renderedComponents = {};
                            }

                            parser.readTokens({
                                chars: function chars(tok) {
                                    (component ? component.contents : result).push(tok.text);
                                },
                                startTag: function startTag(tok) {
                                    tagDepth++;
                                    var outputArr = component ? component.contents : result;
                                    if (!component && includes(componentNames, tok.tagName)) {
                                        if (!(tok.tagName in renderedComponents)) {
                                            renderedComponents[tok.tagName] = [];
                                        }
                                        var index = tok.attrs[_this4.constructor.Weddell.consts.INDEX_ATTR_NAME] || renderedComponents[tok.tagName].length;

                                        component = {
                                            Component: _this4.components[tok.tagName],
                                            depth: tagDepth,
                                            name: tok.tagName,
                                            props: Object.assign({}, tok.attrs, tok.booleanAttrs),
                                            contents: [],
                                            index: index
                                        };
                                        renderedComponents[tok.tagName].push(component);
                                    } else if (tok.tagName === 'content') {
                                        contentTagDepth = tagDepth;
                                    } else {
                                        outputArr.push(tok.text);
                                    }
                                },
                                endTag: function endTag(tok) {
                                    var outputArr = component ? component.contents : result;
                                    if (component && tok.tagName === component.name && component.depth === tagDepth) {
                                        var currComp = component;
                                        result.push(_this4.interpolateHTMLComponents(component.contents.join(''), null, renderedComponents).then(function (componentContent) {
                                            return _this4.getComponentInstance(tok.tagName, currComp.index).then(function (componentInstance) {
                                                var renderFormat = componentInstance._pipelines.markup.targetRenderFormat;
                                                return componentInstance.render('markup', componentContent, currComp.props, renderFormat);
                                            });
                                        }).then(function (componentOutput) {
                                            _this4.trigger('rendercomponent', { componentOutput: componentOutput, componentName: tok.tagName, props: currComp.props });
                                            return componentOutput.output;
                                        }));
                                        component = null;
                                    } else if (tok.tagName === 'content' && tagDepth === contentTagDepth) {
                                        outputArr.push(_this4.interpolateHTMLComponents(content || ''));
                                        contentTagDepth = null;
                                    } else {
                                        outputArr.push(tok.text);
                                    }
                                    tagDepth--;
                                }
                            });

                            return Promise.all(result).then(function (results) {
                                return results.join('');
                            });
                        }
                    }]);

                    return Component;
                }(Component);
                return Component;
            })
        }
    });
};

},{"../../utils/includes":37,"mixwith-es5":13,"object.defaults/immutable":15,"prescribe":19}],30:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Mixin = require('mixwith-es5').Mixin;
var mix = require('mixwith-es5').mix;
var Router = require('./router');
var StateMachineMixin = require('./state-machine-mixin');
var MachineStateMixin = require('./machine-state-mixin');

var RouterState = mix(function () {
    function _class(opts) {
        _classCallCheck(this, _class);

        this.Component = opts.Component;
        this.componentName = opts.componentName;
    }

    return _class;
}()).with(MachineStateMixin);

module.exports = function (_Weddell) {
    return _Weddell.plugin({
        id: 'router',
        classes: {
            App: Mixin(function (App) {
                return function (_App) {
                    _inherits(_class2, _App);

                    function _class2(opts) {
                        _classCallCheck(this, _class2);

                        var _this = _possibleConstructorReturn(this, (_class2.__proto__ || Object.getPrototypeOf(_class2)).call(this, opts));

                        _this.router = new Router({
                            routes: opts.routes,
                            onRoute: function (matches, componentNames) {
                                var jobs = [];

                                return componentNames.reduce(function (promise, componentName) {
                                    return promise.then(function (currentComponent) {
                                        return currentComponent.getComponentInstance(componentName, 'router').then(function (component) {
                                            if (!component) return Promise.reject('Failed to resolve ' + componentName + ' while routing.'); // throw "Could not navigate to component " + key;
                                            jobs.push({
                                                component: component,
                                                currentComponent: currentComponent,
                                                componentName: componentName
                                            });
                                            return component;
                                        });
                                    });
                                }, Promise.resolve(this.component)).then(function (lastComponent) {
                                    jobs.push({
                                        currentComponent: lastComponent,
                                        component: null,
                                        componentName: null
                                    });
                                    return Promise.all(jobs.map(function (obj) {
                                        return obj.currentComponent.changeState(obj.componentName);
                                    }));
                                }, console.warn);
                            }.bind(_this)
                        });

                        _this.on('createcomponent', function (evt) {
                            evt.component.router = _this.router;
                        });
                        return _this;
                    }

                    _createClass(_class2, [{
                        key: 'init',
                        value: function init() {
                            var _this2 = this;

                            return _get(_class2.prototype.__proto__ || Object.getPrototypeOf(_class2.prototype), 'init', this).call(this).then(function () {
                                return _this2.router.init();
                            });
                        }
                    }]);

                    return _class2;
                }(App);
            }),
            Component: Mixin(function (Component) {
                var RouterComponent = function (_mix$with) {
                    _inherits(RouterComponent, _mix$with);

                    function RouterComponent(opts) {
                        _classCallCheck(this, RouterComponent);

                        opts.stateClass = RouterState;

                        var _this3 = _possibleConstructorReturn(this, (RouterComponent.__proto__ || Object.getPrototypeOf(RouterComponent)).call(this, opts));

                        _this3.addTagDirective('RouterView', _this3.compileRouterView.bind(_this3));

                        var routerLocals = {
                            $routerLink: _this3.compileRouterLink.bind(_this3)
                        };
                        _this3.store.assign(routerLocals);
                        _this3._locals.assign(routerLocals);

                        Object.entries(_this3.components).forEach(function (entry) {
                            var routerState = new RouterState({
                                Component: entry[1],
                                componentName: entry[0]
                            });
                            _this3.addState(entry[0], routerState);
                            routerState.on(['exit', 'enter'], function (evt) {
                                _this3.markDirty();
                            });
                        });
                        return _this3;
                    }

                    _createClass(RouterComponent, [{
                        key: 'compileRouterView',
                        value: function compileRouterView(content, props) {
                            if (this.currentState) {
                                return this.getComponentInstance(this.currentState.componentName, 'router').then(function (component) {
                                    return component.render('markup', content, props);
                                }).then(function (routerOutput) {
                                    return Array.isArray(routerOutput.output) ? routerOutput.output[0] : routerOutput.output;
                                });
                            }
                            return Promise.resolve(null);
                        }
                    }, {
                        key: 'compileRouterLink',
                        value: function compileRouterLink(obj) {
                            var matches = this.router.compileRouterLink(obj);
                            if (matches) {
                                return matches.fullPath;
                            }
                        }
                    }, {
                        key: 'route',
                        value: function route(pathname) {
                            this.router.route(pathname);
                        }
                    }]);

                    return RouterComponent;
                }(mix(Component).with(StateMachineMixin));

                return RouterComponent;
            }),
            Router: Router
        }
    });
};

},{"./machine-state-mixin":31,"./router":32,"./state-machine-mixin":33,"mixwith-es5":13}],31:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var mix = require('mixwith-es5').mix;
var EventEmitterMixin = require('../../core/event-emitter-mixin');
var DeDupe = require('mixwith-es5').DeDupe;
var Mixin = require('mixwith-es5').Mixin;

var MachineState = Mixin(function (superClass) {
    return function (_mix$with) {
        _inherits(_class, _mix$with);

        function _class(opts) {
            _classCallCheck(this, _class);

            var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, opts));

            _this.onEnterState = opts.onEnterState;
            _this.onExitState = opts.onExitState;
            _this.onUpdateState = opts.onUpdateState;
            return _this;
        }

        _createClass(_class, [{
            key: 'stateAction',
            value: function stateAction(methodName, eventName) {
                var _this2 = this;

                return Promise.resolve(this[methodName] && this[methodName]()).then(function () {
                    return _this2.trigger(eventName);
                });
            }
        }, {
            key: 'exitState',
            value: function exitState() {

                return this.stateAction('onExitState', 'exit');
            }
        }, {
            key: 'enterState',
            value: function enterState() {
                return this.stateAction('onEnterState', 'enter');
            }
        }, {
            key: 'updateState',
            value: function updateState() {
                return this.stateAction('onUpdateState', 'update');
            }
        }]);

        return _class;
    }(mix(superClass).with(DeDupe(EventEmitterMixin)));
});
module.exports = MachineState;

},{"../../core/event-emitter-mixin":23,"mixwith-es5":13}],32:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaults = require('object.defaults/immutable');
var pathToRegexp = require('path-to-regexp');
var findParent = require('find-parent');
var compact = require('array-compact');

var defaultOpts = {};

var Router = function () {
    function Router(opts) {
        _classCallCheck(this, Router);

        opts = defaults(opts, defaultOpts);
        this.currentRoute = null;
        this.routes = [];
        this.onRoute = opts.onRoute;
        this._isInit = false;
        if (opts.routes) {
            this.addRoutes(opts.routes);
        }
    }
    //TODO allow for absolute routes prefixed with /

    _createClass(Router, [{
        key: 'route',
        value: function route(pathName) {
            var _this = this;

            var promise = Promise.resolve(null);

            if (typeof pathName === 'string') {
                var matches = Router.matchRoute(pathName, this.routes);
            } else if (Array.isArray(pathName)) {
                matches = pathName;
            } else if (pathName) {
                //assuming an object was passed to route by named route.
                var matches = this.compileRouterLink(pathname);
            }

            if (matches) {
                promise = Promise.all(matches.map(function (currMatch, key) {
                    if (key === matches.length - 1 && currMatch.route.redirect) {
                        if (typeof currMatch.route.redirect === 'function') {
                            _this.route(currMatch.route.redirect.call(_this, matches));
                        } else {
                            //assuming string - path
                            _this.route(currMatch.route.redirect);
                        }
                        return Promise.reject();
                    }

                    if (typeof currMatch.route.handler == 'function') {
                        return Promise.resolve(currMatch.route.handler.call(_this, matches));
                    } else {
                        return currMatch.route.handler;
                    }
                })).then(function (results) {
                    return compact(results);
                }).then(this.onRoute.bind(this, matches), function () {}).then(function () {
                    if (matches.route.replaceState) {
                        history.replaceState({ fullPath: matches.fullPath }, document.title, matches.fullPath);
                    } else {
                        history.pushState({ fullPath: matches.fullPath }, document.title, matches.fullPath);
                    }
                    _this.currentRoute = matches.fullPath;
                });
            }

            return promise;
        }
    }, {
        key: 'addRoutes',
        value: function addRoutes(routes) {
            this.routes = this.routes.concat(routes);
        }
    }, {
        key: 'compileRouterLink',
        value: function compileRouterLink(obj) {

            /*
            * Takes an object specifying a router name and params, returns an object with compiled path and matched route
            */

            var route = Router.getNamedRoute(obj.name, this.routes);
            if (route) {
                var fullPath = route.map(function (route) {
                    return pathToRegexp.compile(route.pattern)(obj.params);
                }).join('/');
                var matches = [{
                    fullPath: fullPath,
                    route: route,
                    match: null
                }];
                matches.route = route;
                matches.fullPath = fullPath;
                return matches;
            } else {
                console.warn('could not find route with name', obj.name);
            }
            return null;
        }
    }, {
        key: 'init',
        value: function init() {
            var _this2 = this;

            if (!this._isInit && this.routes) {
                this._isInit = true;
                addEventListener('popstate', this.onPopState.bind(this));

                document.body.addEventListener('click', function (evt) {
                    var clickedATag = findParent.byMatcher(evt.target, function (el) {
                        return el.tagName === 'A';
                    });
                    if (clickedATag) {
                        var href = Router.matchRoute(clickedATag.getAttribute('href'), _this2.routes);
                        if (href) {
                            evt.preventDefault();
                            _this2.route(href);
                        }
                    }
                });

                return this.route(location.pathname + location.hash);
            }
            return Promise.resolve();
        }
    }, {
        key: 'onPopState',
        value: function onPopState(evt) {
            if (evt && evt.fullPath) {
                this.route(evt.fullPath);
            }
        }
    }], [{
        key: 'getNamedRoute',
        value: function getNamedRoute(name, routes) {
            if (!name) return null;

            return function findRoute(routes, path) {
                var matchedRoute = null;

                routes.forEach(function (route) {
                    matchedRoute = route.name === name ? route : matchedRoute;

                    if (!matchedRoute && route.children) {
                        matchedRoute = findRoute(route.children, path.concat(route));
                    }

                    return !matchedRoute;
                });

                return matchedRoute ? Object.assign(path.concat(matchedRoute), matchedRoute) : null;
            }(routes, []);
        }
    }, {
        key: 'matchRoute',
        value: function matchRoute(pathName, routes) {
            var result = null;
            var fullPath = '';
            routes.forEach(function (currRoute) {
                var params = [];
                var match = pathToRegexp(currRoute.pattern, params, { end: false }).exec(pathName);
                if (match) {
                    result = [];
                    result.push({ route: currRoute, match: match, params: params });
                    fullPath += match[0].charAt(match[0].length - 1) == '/' ? match[0] : match[0] + '/';
                    if (currRoute.children) {
                        var childMatches = Router.matchRoute(match.input.replace(fullPath, ''), currRoute.children);
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
    }]);

    return Router;
}();

module.exports = Router;

},{"array-compact":1,"find-parent":9,"object.defaults/immutable":15,"path-to-regexp":17}],33:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var mix = require('mixwith-es5').mix;
var EventEmitterMixin = require('../../core/event-emitter-mixin');
var DeDupe = require('mixwith-es5').DeDupe;
var MachineState = require('./machine-state-mixin');
var Mixin = require('mixwith-es5').Mixin;
var hasMixin = require('mixwith-es5').hasMixin;

var StateMachine = Mixin(function (superClass) {
    return function (_mix$with) {
        _inherits(_class, _mix$with);

        function _class(opts) {
            _classCallCheck(this, _class);

            var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, opts));

            Object.defineProperties(_this, {
                stateClass: { value: opts.stateClass },
                currentState: { writable: true, value: null },
                previousState: { writable: true, value: null },
                states: { value: {} }
            });
            return _this;
        }

        _createClass(_class, [{
            key: 'getState',
            value: function getState(state) {
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
        }, {
            key: 'addState',
            value: function addState(key, state, onEnter, onExit) {
                if (this.constructor.checkIfIsState(state)) {
                    this.states[key] = state;
                }
            }
        }, {
            key: 'changeState',
            value: function changeState(state) {
                var _this2 = this;

                state = this.getState(state);

                var promise = Promise.resolve();
                if (state && this.currentState === state) {
                    promise = Promise.resolve(this.currentState.updateState()).then(function () {
                        _this2.trigger('updatestate', { updatedState: _this2.currentState });
                        return _this2.onUpdateState ? _this2.onUpdateState() : null;
                    });
                } else {
                    if (this.currentState) {
                        promise = Promise.resolve(this.currentState.exitState()).then(function () {
                            _this2.trigger('exitstate', { exitedState: _this2.currentState, enteredState: state });
                            _this2.previousState = _this2.currentState;
                            _this2.currentState = null;
                            return _this2.onExitState ? _this2.onExitState() : null;
                        });
                    }
                    if (state) {
                        promise = promise.then(function () {
                            return state.enterState();
                        }).then(function () {
                            _this2.currentState = state;
                            _this2.trigger('enterstate', { exitedState: _this2.currentState, enteredState: state });

                            return _this2.onEnterState ? _this2.onEnterState() : null;
                        });
                    }
                }
                return promise.then(function () {
                    return _this2.currentState;
                });
            }
        }], [{
            key: 'checkIfIsState',
            value: function checkIfIsState(state) {
                var result = hasMixin(state, MachineState);
                if (!result) {
                    console.warn("Supplied state class does not extend MachineState. Expect unreliable results.");
                }
                return result;
            }
        }]);

        return _class;
    }(mix(superClass).with(DeDupe(EventEmitterMixin)));
});
module.exports = StateMachine;

},{"../../core/event-emitter-mixin":23,"./machine-state-mixin":31,"mixwith-es5":13}],34:[function(require,module,exports){
'use strict';

require('native-promise-only');
module.exports = require('../plugins/html')(require('../plugins/router')(require('./weddell')));

},{"../plugins/html":29,"../plugins/router":30,"./weddell":35,"native-promise-only":14}],35:[function(require,module,exports){
'use strict';

module.exports = require('../core/weddell');

},{"../core/weddell":28}],36:[function(require,module,exports){
"use strict";

// var includes = require('./includes');
module.exports = function (arr1, arr2) {
    return arr1.filter(function (i) {
        return arr2.indexOf(i) < 0;
    });
};

},{}],37:[function(require,module,exports){
"use strict";

module.exports = function (arr, val) {
    return arr.some(function (currKey) {
        return currKey === val;
    });
};

},{}],38:[function(require,module,exports){
"use strict";

module.exports = function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }return text;
};

},{}]},{},[34])(34)
});