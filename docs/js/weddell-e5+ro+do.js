(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Weddell = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Expose array-compact
 */

module.exports = compact;

/**
 * Return an array copy without falsy values
 */

function compact(arr) {
  return arr.filter(validate);
}

function validate(item) {
  return !!item;
}

},{}],2:[function(require,module,exports){
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

	new Set(arr).forEach(function (el) {
		ret.push(el);
	});

	return ret;
}

// V8 currently has a broken implementation
// https://github.com/joyent/node/issues/8449
function doesForEachActuallyWork() {
	var ret = false;

	new Set([true]).forEach(function (el) {
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
},{}],3:[function(require,module,exports){
"use strict";

},{}],4:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
  } else if (!actual || !expected || (typeof actual === 'undefined' ? 'undefined' : _typeof(actual)) != 'object' && (typeof expected === 'undefined' ? 'undefined' : _typeof(expected)) != 'object') {
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
};

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer(x) {
  if (!x || (typeof x === 'undefined' ? 'undefined' : _typeof(x)) !== 'object' || typeof x.length !== 'number') return false;
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') return false;
  return true;
}

function objEquiv(a, b, opts) {
  var i, key;
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) return false;
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
  } catch (e) {
    //happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length) return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i]) return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) return false;
  }
  return (typeof a === 'undefined' ? 'undefined' : _typeof(a)) === (typeof b === 'undefined' ? 'undefined' : _typeof(b));
}

},{"./lib/is_arguments.js":5,"./lib/keys.js":6}],5:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var supportsArgumentsClass = function () {
  return Object.prototype.toString.call(arguments);
}() == '[object Arguments]';

exports = module.exports = supportsArgumentsClass ? supported : unsupported;

exports.supported = supported;
function supported(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
};

exports.unsupported = unsupported;
function unsupported(object) {
  return object && (typeof object === 'undefined' ? 'undefined' : _typeof(object)) == 'object' && typeof object.length == 'number' && Object.prototype.hasOwnProperty.call(object, 'callee') && !Object.prototype.propertyIsEnumerable.call(object, 'callee') || false;
};

},{}],6:[function(require,module,exports){
'use strict';

exports = module.exports = typeof Object.keys === 'function' ? Object.keys : shim;

exports.shim = shim;
function shim(obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
}

},{}],7:[function(require,module,exports){
'use strict';

var makeDefaultsFunc = require('./src/make-defaults-func');
module.exports = makeDefaultsFunc(true, require('./src/array-merge'));

},{"./src/array-merge":8,"./src/make-defaults-func":9}],8:[function(require,module,exports){
"use strict";

module.exports = function () {
    return Array.from(arguments).slice(1).reduce(function (finalArr, arr) {
        return finalArr.concat(arr.filter(function (item) {
            return finalArr.indexOf(item) < 0;
        }));
    }, arguments[0]);
};

},{}],9:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = function (deep, merge) {
    return function defaults() {
        return Array.from(arguments).slice(1).reduce(function (sourceObj, obj) {
            Object.entries(obj).forEach(function (entry) {
                if (typeof sourceObj[entry[0]] === 'undefined') {
                    sourceObj[entry[0]] = entry[1];
                } else if (deep && [entry[1], sourceObj[entry[0]]].every(function (val) {
                    return val && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && !Array.isArray(val);
                })) {
                    sourceObj[entry[0]] = defaults(sourceObj[entry[0]], entry[1]);
                } else if (merge && [entry[1], sourceObj[entry[0]]].every(function (val) {
                    return val && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && Array.isArray(val);
                })) {
                    sourceObj[entry[0]] = merge(sourceObj[entry[0]], entry[1]);
                }
            });
            return sourceObj;
        }, Object.assign({}, arguments[0]));
    };
};

},{}],10:[function(require,module,exports){
'use strict';

(function (document, promise) {
  if (typeof module !== 'undefined') module.exports = promise;else document.ready = promise;
})(window.document, function (chainVal) {
  'use strict';

  var d = document,
      w = window,
      loaded = /^loaded|^i|^c/.test(d.readyState),
      DOMContentLoaded = 'DOMContentLoaded',
      load = 'load';

  return new Promise(function (resolve) {
    if (loaded) return resolve(chainVal);

    function onReady() {
      resolve(chainVal);
      d.removeEventListener(DOMContentLoaded, onReady);
      w.removeEventListener(load, onReady);
    }

    d.addEventListener(DOMContentLoaded, onReady);
    w.addEventListener(load, onReady);
  });
});

},{}],11:[function(require,module,exports){
"use strict";

// doT.js
// 2011-2014, Laura Doktorova, https://github.com/olado/doT
// Licensed under the MIT license.

(function () {
	"use strict";

	var doT = {
		name: "doT",
		version: "1.1.1",
		templateSettings: {
			evaluate: /\{\{([\s\S]+?(\}?)+)\}\}/g,
			interpolate: /\{\{=([\s\S]+?)\}\}/g,
			encode: /\{\{!([\s\S]+?)\}\}/g,
			use: /\{\{#([\s\S]+?)\}\}/g,
			useParams: /(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g,
			define: /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
			defineParams: /^\s*([\w$]+):([\s\S]+)/,
			conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
			iterate: /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
			varname: "it",
			strip: true,
			append: true,
			selfcontained: false,
			doNotSkipEncoded: false
		},
		template: undefined, //fn, compile template
		compile: undefined, //fn, for express
		log: true
	},
	    _globals;

	doT.encodeHTMLSource = function (doNotSkipEncoded) {
		var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" },
		    matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
		return function (code) {
			return code ? code.toString().replace(matchHTML, function (m) {
				return encodeHTMLRules[m] || m;
			}) : "";
		};
	};

	_globals = function () {
		return this || (0, eval)("this");
	}();

	/* istanbul ignore else */
	if (typeof module !== "undefined" && module.exports) {
		module.exports = doT;
	} else if (typeof define === "function" && define.amd) {
		define(function () {
			return doT;
		});
	} else {
		_globals.doT = doT;
	}

	var startend = {
		append: { start: "'+(", end: ")+'", startencode: "'+encodeHTML(" },
		split: { start: "';out+=(", end: ");out+='", startencode: "';out+=encodeHTML(" }
	},
	    skip = /$^/;

	function resolveDefs(c, block, def) {
		return (typeof block === "string" ? block : block.toString()).replace(c.define || skip, function (m, code, assign, value) {
			if (code.indexOf("def.") === 0) {
				code = code.substring(4);
			}
			if (!(code in def)) {
				if (assign === ":") {
					if (c.defineParams) value.replace(c.defineParams, function (m, param, v) {
						def[code] = { arg: param, text: v };
					});
					if (!(code in def)) def[code] = value;
				} else {
					new Function("def", "def['" + code + "']=" + value)(def);
				}
			}
			return "";
		}).replace(c.use || skip, function (m, code) {
			if (c.useParams) code = code.replace(c.useParams, function (m, s, d, param) {
				if (def[d] && def[d].arg && param) {
					var rw = (d + ":" + param).replace(/'|\\/g, "_");
					def.__exp = def.__exp || {};
					def.__exp[rw] = def[d].text.replace(new RegExp("(^|[^\\w$])" + def[d].arg + "([^\\w$])", "g"), "$1" + param + "$2");
					return s + "def.__exp['" + rw + "']";
				}
			});
			var v = new Function("def", "return " + code)(def);
			return v ? resolveDefs(c, v, def) : v;
		});
	}

	function unescape(code) {
		return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, " ");
	}

	doT.template = function (tmpl, c, def) {
		c = c || doT.templateSettings;
		var cse = c.append ? startend.append : startend.split,
		    needhtmlencode,
		    sid = 0,
		    indv,
		    str = c.use || c.define ? resolveDefs(c, tmpl, def || {}) : tmpl;

		str = ("var out='" + (c.strip ? str.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g, " ").replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g, "") : str).replace(/'|\\/g, "\\$&").replace(c.interpolate || skip, function (m, code) {
			return cse.start + unescape(code) + cse.end;
		}).replace(c.encode || skip, function (m, code) {
			needhtmlencode = true;
			return cse.startencode + unescape(code) + cse.end;
		}).replace(c.conditional || skip, function (m, elsecase, code) {
			return elsecase ? code ? "';}else if(" + unescape(code) + "){out+='" : "';}else{out+='" : code ? "';if(" + unescape(code) + "){out+='" : "';}out+='";
		}).replace(c.iterate || skip, function (m, iterate, vname, iname) {
			if (!iterate) return "';} } out+='";
			sid += 1;indv = iname || "i" + sid;iterate = unescape(iterate);
			return "';var arr" + sid + "=" + iterate + ";if(arr" + sid + "){var " + vname + "," + indv + "=-1,l" + sid + "=arr" + sid + ".length-1;while(" + indv + "<l" + sid + "){" + vname + "=arr" + sid + "[" + indv + "+=1];out+='";
		}).replace(c.evaluate || skip, function (m, code) {
			return "';" + unescape(code) + "out+='";
		}) + "';return out;").replace(/\n/g, "\\n").replace(/\t/g, '\\t').replace(/\r/g, "\\r").replace(/(\s|;|\}|^|\{)out\+='';/g, '$1').replace(/\+''/g, "");
		//.replace(/(\s|;|\}|^|\{)out\+=''\+/g,'$1out+=');

		if (needhtmlencode) {
			if (!c.selfcontained && _globals && !_globals._encodeHTML) _globals._encodeHTML = doT.encodeHTMLSource(c.doNotSkipEncoded);
			str = "var encodeHTML = typeof _encodeHTML !== 'undefined' ? _encodeHTML : (" + doT.encodeHTMLSource.toString() + "(" + (c.doNotSkipEncoded || '') + "));" + str;
		}
		try {
			return new Function(c.varname, str);
		} catch (e) {
			/* istanbul ignore else */
			if (typeof console !== "undefined") console.log("Could not create a template function: " + str);
			throw e;
		}
	};

	doT.compile = function (tmpl, def) {
		return doT.template(tmpl, null, def);
	};
})();

},{}],12:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var FindParent = {
  byMatcher: function byMatcher(element, func, opts) {
    if (opts === undefined) {
      opts = {};
    }

    if (opts === null || Array.isArray(opts) || (typeof opts === 'undefined' ? 'undefined' : _typeof(opts)) !== 'object') {
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

  byClassName: function byClassName(element, className, opts) {
    return this.byMatcher(element, function (el) {
      return el.classList.contains(className);
    }, opts);
  },

  withDataAttribute: function withDataAttribute(element, attName, opts) {
    return this.byMatcher(element, function (el) {
      return el.dataset.hasOwnProperty(attName);
    }, opts);
  }
};

module.exports = FindParent;

},{}],13:[function(require,module,exports){
'use strict';

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

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
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*! Native Promise Only
    v0.8.1 (c) Kyle Simpson
    MIT License: http://getify.mit-license.org
*/

(function UMD(name, context, definition) {
	// special form of UMD for polyfilling across evironments
	context[name] = context[name] || definition();
	if (typeof module != "undefined" && module.exports) {
		module.exports = context[name];
	} else if (typeof define == "function" && define.amd) {
		define(function $AMD$() {
			return context[name];
		});
	}
})("Promise", typeof global != "undefined" ? global : undefined, function DEF() {
	/*jshint validthis:true */
	"use strict";

	var builtInProp,
	    cycle,
	    scheduling_queue,
	    ToString = Object.prototype.toString,
	    timer = typeof setImmediate != "undefined" ? function timer(fn) {
		return setImmediate(fn);
	} : setTimeout;

	// dammit, IE8.
	try {
		Object.defineProperty({}, "x", {});
		builtInProp = function builtInProp(obj, name, val, config) {
			return Object.defineProperty(obj, name, {
				value: val,
				writable: true,
				configurable: config !== false
			});
		};
	} catch (err) {
		builtInProp = function builtInProp(obj, name, val) {
			obj[name] = val;
			return obj;
		};
	}

	// Note: using a queue instead of array for efficiency
	scheduling_queue = function Queue() {
		var first, last, item;

		function Item(fn, self) {
			this.fn = fn;
			this.self = self;
			this.next = void 0;
		}

		return {
			add: function add(fn, self) {
				item = new Item(fn, self);
				if (last) {
					last.next = item;
				} else {
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
	}();

	function schedule(fn, self) {
		scheduling_queue.add(fn, self);
		if (!cycle) {
			cycle = timer(scheduling_queue.drain);
		}
	}

	// promise duck typing
	function isThenable(o) {
		var _then,
		    o_type = typeof o === "undefined" ? "undefined" : _typeof(o);

		if (o != null && (o_type == "object" || o_type == "function")) {
			_then = o.then;
		}
		return typeof _then == "function" ? _then : false;
	}

	function notify() {
		for (var i = 0; i < this.chain.length; i++) {
			notifyIsolated(this, this.state === 1 ? this.chain[i].success : this.chain[i].failure, this.chain[i]);
		}
		this.chain.length = 0;
	}

	// NOTE: This is a separate function to isolate
	// the `try..catch` so that other code can be
	// optimized better
	function notifyIsolated(self, cb, chain) {
		var ret, _then;
		try {
			if (cb === false) {
				chain.reject(self.msg);
			} else {
				if (cb === true) {
					ret = self.msg;
				} else {
					ret = cb.call(void 0, self.msg);
				}

				if (ret === chain.promise) {
					chain.reject(TypeError("Promise-chain cycle"));
				} else if (_then = isThenable(ret)) {
					_then.call(ret, chain.resolve, chain.reject);
				} else {
					chain.resolve(ret);
				}
			}
		} catch (err) {
			chain.reject(err);
		}
	}

	function resolve(msg) {
		var _then,
		    self = this;

		// already triggered?
		if (self.triggered) {
			return;
		}

		self.triggered = true;

		// unwrap
		if (self.def) {
			self = self.def;
		}

		try {
			if (_then = isThenable(msg)) {
				schedule(function () {
					var def_wrapper = new MakeDefWrapper(self);
					try {
						_then.call(msg, function $resolve$() {
							resolve.apply(def_wrapper, arguments);
						}, function $reject$() {
							reject.apply(def_wrapper, arguments);
						});
					} catch (err) {
						reject.call(def_wrapper, err);
					}
				});
			} else {
				self.msg = msg;
				self.state = 1;
				if (self.chain.length > 0) {
					schedule(notify, self);
				}
			}
		} catch (err) {
			reject.call(new MakeDefWrapper(self), err);
		}
	}

	function reject(msg) {
		var self = this;

		// already triggered?
		if (self.triggered) {
			return;
		}

		self.triggered = true;

		// unwrap
		if (self.def) {
			self = self.def;
		}

		self.msg = msg;
		self.state = 2;
		if (self.chain.length > 0) {
			schedule(notify, self);
		}
	}

	function iteratePromises(Constructor, arr, resolver, rejecter) {
		for (var idx = 0; idx < arr.length; idx++) {
			(function IIFE(idx) {
				Constructor.resolve(arr[idx]).then(function $resolver$(msg) {
					resolver(idx, msg);
				}, rejecter);
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

		this["then"] = function then(success, failure) {
			var o = {
				success: typeof success == "function" ? success : true,
				failure: typeof failure == "function" ? failure : false
			};
			// Note: `then(..)` itself can be borrowed to be used against
			// a different promise constructor for making the chained promise,
			// by substituting a different `this` binding.
			o.promise = new this.constructor(function extractChain(resolve, reject) {
				if (typeof resolve != "function" || typeof reject != "function") {
					throw TypeError("Not a function");
				}

				o.resolve = resolve;
				o.reject = reject;
			});
			def.chain.push(o);

			if (def.state !== 0) {
				schedule(notify, def);
			}

			return o.promise;
		};
		this["catch"] = function $catch$(failure) {
			return this.then(void 0, failure);
		};

		try {
			executor.call(void 0, function publicResolve(msg) {
				resolve.call(def, msg);
			}, function publicReject(msg) {
				reject.call(def, msg);
			});
		} catch (err) {
			reject.call(def, err);
		}
	}

	var PromisePrototype = builtInProp({}, "constructor", Promise,
	/*configurable=*/false);

	// Note: Android 4 cannot use `Object.defineProperty(..)` here
	Promise.prototype = PromisePrototype;

	// built-in "brand" to signal an "uninitialized" promise
	builtInProp(PromisePrototype, "__NPO__", 0,
	/*configurable=*/false);

	builtInProp(Promise, "resolve", function Promise$resolve(msg) {
		var Constructor = this;

		// spec mandated checks
		// note: best "isPromise" check that's practical for now
		if (msg && (typeof msg === "undefined" ? "undefined" : _typeof(msg)) == "object" && msg.__NPO__ === 1) {
			return msg;
		}

		return new Constructor(function executor(resolve, reject) {
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			resolve(msg);
		});
	});

	builtInProp(Promise, "reject", function Promise$reject(msg) {
		return new this(function executor(resolve, reject) {
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			reject(msg);
		});
	});

	builtInProp(Promise, "all", function Promise$all(arr) {
		var Constructor = this;

		// spec mandated checks
		if (ToString.call(arr) != "[object Array]") {
			return Constructor.reject(TypeError("Not an array"));
		}
		if (arr.length === 0) {
			return Constructor.resolve([]);
		}

		return new Constructor(function executor(resolve, reject) {
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			var len = arr.length,
			    msgs = Array(len),
			    count = 0;

			iteratePromises(Constructor, arr, function resolver(idx, msg) {
				msgs[idx] = msg;
				if (++count === len) {
					resolve(msgs);
				}
			}, reject);
		});
	});

	builtInProp(Promise, "race", function Promise$race(arr) {
		var Constructor = this;

		// spec mandated checks
		if (ToString.call(arr) != "[object Array]") {
			return Constructor.reject(TypeError("Not an array"));
		}

		return new Constructor(function executor(resolve, reject) {
			if (typeof resolve != "function" || typeof reject != "function") {
				throw TypeError("Not a function");
			}

			iteratePromises(Constructor, arr, function resolver(idx, msg) {
				resolve(msg);
			}, reject);
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

},{"./mutable":16,"array-slice":18}],16:[function(require,module,exports){
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

  each(slice(arguments, 1), function (obj) {
    if (isObject(obj)) {
      forOwn(obj, function (val, key) {
        if (target[key] == null) {
          target[key] = val;
        }
      });
    }
  });

  return target;
};

},{"array-each":17,"array-slice":18,"for-own":20,"isobject":21}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

},{}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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
  forIn(obj, function (val, key) {
    if (hasOwn.call(obj, key)) {
      return fn.call(thisArg, obj[key], key, obj);
    }
  });
};

},{"for-in":19}],21:[function(require,module,exports){
/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = function isObject(val) {
  return val != null && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && Array.isArray(val) === false;
};

},{}],22:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isarray = require('isarray');

/**
 * Expose `pathToRegexp`.
 */
module.exports = pathToRegexp;
module.exports.parse = parse;
module.exports.compile = compile;
module.exports.tokensToFunction = tokensToFunction;
module.exports.tokensToRegExp = tokensToRegExp;

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
'([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'].join('|'), 'g');

/**
 * Parse a string for the raw tokens.
 *
 * @param  {string}  str
 * @param  {Object=} options
 * @return {!Array}
 */
function parse(str, options) {
  var tokens = [];
  var key = 0;
  var index = 0;
  var path = '';
  var defaultDelimiter = options && options.delimiter || '/';
  var res;

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0];
    var escaped = res[1];
    var offset = res.index;
    path += str.slice(index, offset);
    index = offset + m.length;

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1];
      continue;
    }

    var next = str[index];
    var prefix = res[2];
    var name = res[3];
    var capture = res[4];
    var group = res[5];
    var modifier = res[6];
    var asterisk = res[7];

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path);
      path = '';
    }

    var partial = prefix != null && next != null && next !== prefix;
    var repeat = modifier === '+' || modifier === '*';
    var optional = modifier === '?' || modifier === '*';
    var delimiter = res[2] || defaultDelimiter;
    var pattern = capture || group;

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      partial: partial,
      asterisk: !!asterisk,
      pattern: pattern ? escapeGroup(pattern) : asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?'
    });
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index);
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path);
  }

  return tokens;
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {string}             str
 * @param  {Object=}            options
 * @return {!function(Object=, Object=)}
 */
function compile(str, options) {
  return tokensToFunction(parse(str, options));
}

/**
 * Prettier encoding of URI path segments.
 *
 * @param  {string}
 * @return {string}
 */
function encodeURIComponentPretty(str) {
  return encodeURI(str).replace(/[\/?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
}

/**
 * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
 *
 * @param  {string}
 * @return {string}
 */
function encodeAsterisk(str) {
  return encodeURI(str).replace(/[?#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16).toUpperCase();
  });
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction(tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length);

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (_typeof(tokens[i]) === 'object') {
      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$');
    }
  }

  return function (obj, opts) {
    var path = '';
    var data = obj || {};
    var options = opts || {};
    var encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent;

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];

      if (typeof token === 'string') {
        path += token;

        continue;
      }

      var value = data[token.name];
      var segment;

      if (value == null) {
        if (token.optional) {
          // Prepend partial segment prefixes.
          if (token.partial) {
            path += token.prefix;
          }

          continue;
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined');
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`');
        }

        if (value.length === 0) {
          if (token.optional) {
            continue;
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty');
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encode(value[j]);

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`');
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment;
        }

        continue;
      }

      segment = token.asterisk ? encodeAsterisk(value) : encode(value);

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"');
      }

      path += token.prefix + segment;
    }

    return path;
  };
}

/**
 * Escape a regular expression string.
 *
 * @param  {string} str
 * @return {string}
 */
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1');
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */
function escapeGroup(group) {
  return group.replace(/([=!:$\/()])/g, '\\$1');
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {!RegExp} re
 * @param  {Array}   keys
 * @return {!RegExp}
 */
function attachKeys(re, keys) {
  re.keys = keys;
  return re;
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */
function flags(options) {
  return options.sensitive ? '' : 'i';
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {!RegExp} path
 * @param  {!Array}  keys
 * @return {!RegExp}
 */
function regexpToRegexp(path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g);

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
      });
    }
  }

  return attachKeys(path, keys);
}

/**
 * Transform an array into a regexp.
 *
 * @param  {!Array}  path
 * @param  {Array}   keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function arrayToRegexp(path, keys, options) {
  var parts = [];

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source);
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options));

  return attachKeys(regexp, keys);
}

/**
 * Create a path regexp from string input.
 *
 * @param  {string}  path
 * @param  {!Array}  keys
 * @param  {!Object} options
 * @return {!RegExp}
 */
function stringToRegexp(path, keys, options) {
  return tokensToRegExp(parse(path, options), keys, options);
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {!Array}          tokens
 * @param  {(Array|Object)=} keys
 * @param  {Object=}         options
 * @return {!RegExp}
 */
function tokensToRegExp(tokens, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */keys || options;
    keys = [];
  }

  options = options || {};

  var strict = options.strict;
  var end = options.end !== false;
  var route = '';

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];

    if (typeof token === 'string') {
      route += escapeString(token);
    } else {
      var prefix = escapeString(token.prefix);
      var capture = '(?:' + token.pattern + ')';

      keys.push(token);

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*';
      }

      if (token.optional) {
        if (!token.partial) {
          capture = '(?:' + prefix + '(' + capture + '))?';
        } else {
          capture = prefix + '(' + capture + ')?';
        }
      } else {
        capture = prefix + '(' + capture + ')';
      }

      route += capture;
    }
  }

  var delimiter = escapeString(options.delimiter || '/');
  var endsWithDelimiter = route.slice(-delimiter.length) === delimiter;

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?';
  }

  if (end) {
    route += '$';
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)';
  }

  return attachKeys(new RegExp('^' + route, flags(options)), keys);
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
function pathToRegexp(path, keys, options) {
  if (!isarray(keys)) {
    options = /** @type {!Object} */keys || options;
    keys = [];
  }

  options = options || {};

  if (path instanceof RegExp) {
    return regexpToRegexp(path, /** @type {!Array} */keys);
  }

  if (isarray(path)) {
    return arrayToRegexp( /** @type {!Array} */path, /** @type {!Array} */keys, options);
  }

  return stringToRegexp( /** @type {string} */path, /** @type {!Array} */keys, options);
}

},{"isarray":23}],23:[function(require,module,exports){
'use strict';

module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],24:[function(require,module,exports){
"use strict";

var createElement = require("./vdom/create-element.js");

module.exports = createElement;

},{"./vdom/create-element.js":36}],25:[function(require,module,exports){
"use strict";

var diff = require("./vtree/diff.js");

module.exports = diff;

},{"./vtree/diff.js":59}],26:[function(require,module,exports){
"use strict";

var h = require("./virtual-hyperscript/index.js");

module.exports = h;

},{"./virtual-hyperscript/index.js":44}],27:[function(require,module,exports){
"use strict";

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
module.exports = function split(undef) {

  var nativeSplit = String.prototype.split,
      compliantExecNpcg = /()??/.exec("")[1] === undef,

  // NPCG: nonparticipating capturing group
  self;

  self = function self(str, separator, limit) {
    // If `separator` is not a regex, use `nativeSplit`
    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
      return nativeSplit.call(str, separator, limit);
    }
    var output = [],
        flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + ( // Proposed for ES6
    separator.sticky ? "y" : ""),

    // Firefox 3+
    lastLastIndex = 0,

    // Make `global` and avoid `lastIndex` issues by working with a copy
    separator = new RegExp(separator.source, flags + "g"),
        separator2,
        match,
        lastIndex,
        lastLength;
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
          match[0].replace(separator2, function () {
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
}();

},{}],28:[function(require,module,exports){
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

},{"individual/one-version":31}],29:[function(require,module,exports){
(function (global){
'use strict';

var topLevel = typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : {};
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
},{"min-document":3}],30:[function(require,module,exports){
(function (global){
'use strict';

/*global window, global*/

var root = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {};

module.exports = Individual;

function Individual(key, value) {
    if (key in root) {
        return root[key];
    }

    root[key] = value;

    return value;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],31:[function(require,module,exports){
'use strict';

var Individual = require('./index.js');

module.exports = OneVersion;

function OneVersion(moduleName, version, defaultValue) {
    var key = '__INDIVIDUAL_ONE_VERSION_' + moduleName;
    var enforceKey = key + '_ENFORCE_SINGLETON';

    var versionValue = Individual(enforceKey, version);

    if (versionValue !== version) {
        throw new Error('Can only have one copy of ' + moduleName + '.\n' + 'You already have version ' + versionValue + ' installed.\n' + 'This means you cannot install version ' + version);
    }

    return Individual(key, defaultValue);
}

},{"./index.js":30}],32:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

module.exports = function isObject(x) {
	return (typeof x === "undefined" ? "undefined" : _typeof(x)) === "object" && x !== null;
};

},{}],33:[function(require,module,exports){
"use strict";

var nativeIsArray = Array.isArray;
var toString = Object.prototype.toString;

module.exports = nativeIsArray || isArray;

function isArray(obj) {
    return toString.call(obj) === "[object Array]";
}

},{}],34:[function(require,module,exports){
"use strict";

var patch = require("./vdom/patch.js");

module.exports = patch;

},{"./vdom/patch.js":39}],35:[function(require,module,exports){
"use strict";

var isObject = require("is-object");
var isHook = require("../vnode/is-vhook.js");

module.exports = applyProperties;

function applyProperties(node, props, previous) {
    for (var propName in props) {
        var propValue = props[propName];

        if (propValue === undefined) {
            removeProperty(node, propName, propValue, previous);
        } else if (isHook(propValue)) {
            removeProperty(node, propName, propValue, previous);
            if (propValue.hook) {
                propValue.hook(node, propName, previous ? previous[propName] : undefined);
            }
        } else {
            if (isObject(propValue)) {
                patchObject(node, props, previous, propName, propValue);
            } else {
                node[propName] = propValue;
            }
        }
    }
}

function removeProperty(node, propName, propValue, previous) {
    if (previous) {
        var previousValue = previous[propName];

        if (!isHook(previousValue)) {
            if (propName === "attributes") {
                for (var attrName in previousValue) {
                    node.removeAttribute(attrName);
                }
            } else if (propName === "style") {
                for (var i in previousValue) {
                    node.style[i] = "";
                }
            } else if (typeof previousValue === "string") {
                node[propName] = "";
            } else {
                node[propName] = null;
            }
        } else if (previousValue.unhook) {
            previousValue.unhook(node, propName, propValue);
        }
    }
}

function patchObject(node, props, previous, propName, propValue) {
    var previousValue = previous ? previous[propName] : undefined;

    // Set attributes
    if (propName === "attributes") {
        for (var attrName in propValue) {
            var attrValue = propValue[attrName];

            if (attrValue === undefined) {
                node.removeAttribute(attrName);
            } else {
                node.setAttribute(attrName, attrValue);
            }
        }

        return;
    }

    if (previousValue && isObject(previousValue) && getPrototype(previousValue) !== getPrototype(propValue)) {
        node[propName] = propValue;
        return;
    }

    if (!isObject(node[propName])) {
        node[propName] = {};
    }

    var replacer = propName === "style" ? "" : undefined;

    for (var k in propValue) {
        var value = propValue[k];
        node[propName][k] = value === undefined ? replacer : value;
    }
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value);
    } else if (value.__proto__) {
        return value.__proto__;
    } else if (value.constructor) {
        return value.constructor.prototype;
    }
}

},{"../vnode/is-vhook.js":50,"is-object":32}],36:[function(require,module,exports){
"use strict";

var document = require("global/document");

var applyProperties = require("./apply-properties");

var isVNode = require("../vnode/is-vnode.js");
var isVText = require("../vnode/is-vtext.js");
var isWidget = require("../vnode/is-widget.js");
var handleThunk = require("../vnode/handle-thunk.js");

module.exports = createElement;

function createElement(vnode, opts) {
    var doc = opts ? opts.document || document : document;
    var warn = opts ? opts.warn : null;

    vnode = handleThunk(vnode).a;

    if (isWidget(vnode)) {
        return vnode.init();
    } else if (isVText(vnode)) {
        return doc.createTextNode(vnode.text);
    } else if (!isVNode(vnode)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", vnode);
        }
        return null;
    }

    var node = vnode.namespace === null ? doc.createElement(vnode.tagName) : doc.createElementNS(vnode.namespace, vnode.tagName);

    var props = vnode.properties;
    applyProperties(node, props);

    var children = vnode.children;

    for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts);
        if (childNode) {
            node.appendChild(childNode);
        }
    }

    return node;
}

},{"../vnode/handle-thunk.js":48,"../vnode/is-vnode.js":51,"../vnode/is-vtext.js":52,"../vnode/is-widget.js":53,"./apply-properties":35,"global/document":29}],37:[function(require,module,exports){
"use strict";

// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

var noChild = {};

module.exports = domIndex;

function domIndex(rootNode, tree, indices, nodes) {
    if (!indices || indices.length === 0) {
        return {};
    } else {
        indices.sort(ascending);
        return recurse(rootNode, tree, indices, nodes, 0);
    }
}

function recurse(rootNode, tree, indices, nodes, rootIndex) {
    nodes = nodes || {};

    if (rootNode) {
        if (indexInRange(indices, rootIndex, rootIndex)) {
            nodes[rootIndex] = rootNode;
        }

        var vChildren = tree.children;

        if (vChildren) {

            var childNodes = rootNode.childNodes;

            for (var i = 0; i < tree.children.length; i++) {
                rootIndex += 1;

                var vChild = vChildren[i] || noChild;
                var nextIndex = rootIndex + (vChild.count || 0);

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(indices, rootIndex, nextIndex)) {
                    recurse(childNodes[i], vChild, indices, nodes, rootIndex);
                }

                rootIndex = nextIndex;
            }
        }
    }

    return nodes;
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false;
    }

    var minIndex = 0;
    var maxIndex = indices.length - 1;
    var currentIndex;
    var currentItem;

    while (minIndex <= maxIndex) {
        currentIndex = (maxIndex + minIndex) / 2 >> 0;
        currentItem = indices[currentIndex];

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right;
        } else if (currentItem < left) {
            minIndex = currentIndex + 1;
        } else if (currentItem > right) {
            maxIndex = currentIndex - 1;
        } else {
            return true;
        }
    }

    return false;
}

function ascending(a, b) {
    return a > b ? 1 : -1;
}

},{}],38:[function(require,module,exports){
"use strict";

var applyProperties = require("./apply-properties");

var isWidget = require("../vnode/is-widget.js");
var VPatch = require("../vnode/vpatch.js");

var updateWidget = require("./update-widget");

module.exports = applyPatch;

function applyPatch(vpatch, domNode, renderOptions) {
    var type = vpatch.type;
    var vNode = vpatch.vNode;
    var patch = vpatch.patch;

    switch (type) {
        case VPatch.REMOVE:
            return removeNode(domNode, vNode);
        case VPatch.INSERT:
            return insertNode(domNode, patch, renderOptions);
        case VPatch.VTEXT:
            return stringPatch(domNode, vNode, patch, renderOptions);
        case VPatch.WIDGET:
            return widgetPatch(domNode, vNode, patch, renderOptions);
        case VPatch.VNODE:
            return vNodePatch(domNode, vNode, patch, renderOptions);
        case VPatch.ORDER:
            reorderChildren(domNode, patch);
            return domNode;
        case VPatch.PROPS:
            applyProperties(domNode, patch, vNode.properties);
            return domNode;
        case VPatch.THUNK:
            return replaceRoot(domNode, renderOptions.patch(domNode, patch, renderOptions));
        default:
            return domNode;
    }
}

function removeNode(domNode, vNode) {
    var parentNode = domNode.parentNode;

    if (parentNode) {
        parentNode.removeChild(domNode);
    }

    destroyWidget(domNode, vNode);

    return null;
}

function insertNode(parentNode, vNode, renderOptions) {
    var newNode = renderOptions.render(vNode, renderOptions);

    if (parentNode) {
        parentNode.appendChild(newNode);
    }

    return parentNode;
}

function stringPatch(domNode, leftVNode, vText, renderOptions) {
    var newNode;

    if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, vText.text);
        newNode = domNode;
    } else {
        var parentNode = domNode.parentNode;
        newNode = renderOptions.render(vText, renderOptions);

        if (parentNode && newNode !== domNode) {
            parentNode.replaceChild(newNode, domNode);
        }
    }

    return newNode;
}

function widgetPatch(domNode, leftVNode, widget, renderOptions) {
    var updating = updateWidget(leftVNode, widget);
    var newNode;

    if (updating) {
        newNode = widget.update(leftVNode, domNode) || domNode;
    } else {
        newNode = renderOptions.render(widget, renderOptions);
    }

    var parentNode = domNode.parentNode;

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode);
    }

    if (!updating) {
        destroyWidget(domNode, leftVNode);
    }

    return newNode;
}

function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
    var parentNode = domNode.parentNode;
    var newNode = renderOptions.render(vNode, renderOptions);

    if (parentNode && newNode !== domNode) {
        parentNode.replaceChild(newNode, domNode);
    }

    return newNode;
}

function destroyWidget(domNode, w) {
    if (typeof w.destroy === "function" && isWidget(w)) {
        w.destroy(domNode);
    }
}

function reorderChildren(domNode, moves) {
    var childNodes = domNode.childNodes;
    var keyMap = {};
    var node;
    var remove;
    var insert;

    for (var i = 0; i < moves.removes.length; i++) {
        remove = moves.removes[i];
        node = childNodes[remove.from];
        if (remove.key) {
            keyMap[remove.key] = node;
        }
        domNode.removeChild(node);
    }

    var length = childNodes.length;
    for (var j = 0; j < moves.inserts.length; j++) {
        insert = moves.inserts[j];
        node = keyMap[insert.key];
        // this is the weirdest bug i've ever seen in webkit
        domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to]);
    }
}

function replaceRoot(oldRoot, newRoot) {
    if (oldRoot && newRoot && oldRoot !== newRoot && oldRoot.parentNode) {
        oldRoot.parentNode.replaceChild(newRoot, oldRoot);
    }

    return newRoot;
}

},{"../vnode/is-widget.js":53,"../vnode/vpatch.js":56,"./apply-properties":35,"./update-widget":40}],39:[function(require,module,exports){
"use strict";

var document = require("global/document");
var isArray = require("x-is-array");

var render = require("./create-element");
var domIndex = require("./dom-index");
var patchOp = require("./patch-op");
module.exports = patch;

function patch(rootNode, patches, renderOptions) {
    renderOptions = renderOptions || {};
    renderOptions.patch = renderOptions.patch && renderOptions.patch !== patch ? renderOptions.patch : patchRecursive;
    renderOptions.render = renderOptions.render || render;

    return renderOptions.patch(rootNode, patches, renderOptions);
}

function patchRecursive(rootNode, patches, renderOptions) {
    var indices = patchIndices(patches);

    if (indices.length === 0) {
        return rootNode;
    }

    var index = domIndex(rootNode, patches.a, indices);
    var ownerDocument = rootNode.ownerDocument;

    if (!renderOptions.document && ownerDocument !== document) {
        renderOptions.document = ownerDocument;
    }

    for (var i = 0; i < indices.length; i++) {
        var nodeIndex = indices[i];
        rootNode = applyPatch(rootNode, index[nodeIndex], patches[nodeIndex], renderOptions);
    }

    return rootNode;
}

function applyPatch(rootNode, domNode, patchList, renderOptions) {
    if (!domNode) {
        return rootNode;
    }

    var newNode;

    if (isArray(patchList)) {
        for (var i = 0; i < patchList.length; i++) {
            newNode = patchOp(patchList[i], domNode, renderOptions);

            if (domNode === rootNode) {
                rootNode = newNode;
            }
        }
    } else {
        newNode = patchOp(patchList, domNode, renderOptions);

        if (domNode === rootNode) {
            rootNode = newNode;
        }
    }

    return rootNode;
}

function patchIndices(patches) {
    var indices = [];

    for (var key in patches) {
        if (key !== "a") {
            indices.push(Number(key));
        }
    }

    return indices;
}

},{"./create-element":36,"./dom-index":37,"./patch-op":38,"global/document":29,"x-is-array":33}],40:[function(require,module,exports){
"use strict";

var isWidget = require("../vnode/is-widget.js");

module.exports = updateWidget;

function updateWidget(a, b) {
    if (isWidget(a) && isWidget(b)) {
        if ("name" in a && "name" in b) {
            return a.id === b.id;
        } else {
            return a.init === b.init;
        }
    }

    return false;
}

},{"../vnode/is-widget.js":53}],41:[function(require,module,exports){
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
    if (prev && prev.type === 'AttributeHook' && prev.value === this.value && prev.namespace === this.namespace) {
        return;
    }

    node.setAttributeNS(this.namespace, prop, this.value);
};

AttributeHook.prototype.unhook = function (node, prop, next) {
    if (next && next.type === 'AttributeHook' && next.namespace === this.namespace) {
        return;
    }

    var colonPosition = prop.indexOf(':');
    var localName = colonPosition > -1 ? prop.substr(colonPosition + 1) : prop;
    node.removeAttributeNS(this.namespace, localName);
};

AttributeHook.prototype.type = 'AttributeHook';

},{}],42:[function(require,module,exports){
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

EvHook.prototype.unhook = function (node, propertyName) {
    var es = EvStore(node);
    var propName = propertyName.substr(3);

    es[propName] = undefined;
};

},{"ev-store":28}],43:[function(require,module,exports){
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

},{}],44:[function(require,module,exports){
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
    if (tag === 'INPUT' && !namespace && props.hasOwnProperty('value') && props.value !== undefined && !isHook(props.value)) {
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
    err.message = 'Unexpected virtual child passed to h().\n' + 'Expected a VNode / Vthunk / VWidget / string but:\n' + 'got:\n' + errorString(data.foreignObject) + '.\n' + 'The parent vnode is:\n' + errorString(data.parentVnode);
    '\n' + 'Suggested fix: change your `h(..., [ ... ])` callsite.';
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

},{"../vnode/is-thunk":49,"../vnode/is-vhook":50,"../vnode/is-vnode":51,"../vnode/is-vtext":52,"../vnode/is-widget":53,"../vnode/vnode.js":55,"../vnode/vtext.js":57,"./hooks/ev-hook.js":42,"./hooks/soft-set-hook.js":43,"./parse-tag.js":45,"x-is-array":33}],45:[function(require,module,exports){
'use strict';

var split = require('browser-split');

var classIdSplit = /([\.#]?[a-zA-Z0-9\u007F-\uFFFF_:-]+)/;
var notClassId = /^\.|#/;

module.exports = parseTag;

function parseTag(tag, props) {
    if (!tag) {
        return 'DIV';
    }

    var noId = !props.hasOwnProperty('id');

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

},{"browser-split":27}],46:[function(require,module,exports){
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

},{}],47:[function(require,module,exports){
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

        if (namespace === undefined) {
            // not a svg attribute
            continue;
        }

        var value = properties[key];

        if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
            continue;
        }

        if (namespace !== null) {
            // namespaced attribute
            properties[key] = attributeHook(namespace, value);
            continue;
        }

        attributes[key] = value;
        properties[key] = undefined;
    }

    return h(tagName, properties, children);
}

function isChildren(x) {
    return typeof x === 'string' || isArray(x);
}

},{"./hooks/attribute-hook":41,"./index.js":44,"./svg-attribute-namespace":46,"x-is-array":33}],48:[function(require,module,exports){
"use strict";

var isVNode = require("./is-vnode");
var isVText = require("./is-vtext");
var isWidget = require("./is-widget");
var isThunk = require("./is-thunk");

module.exports = handleThunk;

function handleThunk(a, b) {
    var renderedA = a;
    var renderedB = b;

    if (isThunk(b)) {
        renderedB = renderThunk(b, a);
    }

    if (isThunk(a)) {
        renderedA = renderThunk(a, null);
    }

    return {
        a: renderedA,
        b: renderedB
    };
}

function renderThunk(thunk, previous) {
    var renderedThunk = thunk.vnode;

    if (!renderedThunk) {
        renderedThunk = thunk.vnode = thunk.render(previous);
    }

    if (!(isVNode(renderedThunk) || isVText(renderedThunk) || isWidget(renderedThunk))) {
        throw new Error("thunk did not return a valid node");
    }

    return renderedThunk;
}

},{"./is-thunk":49,"./is-vnode":51,"./is-vtext":52,"./is-widget":53}],49:[function(require,module,exports){
"use strict";

module.exports = isThunk;

function isThunk(t) {
    return t && t.type === "Thunk";
}

},{}],50:[function(require,module,exports){
"use strict";

module.exports = isHook;

function isHook(hook) {
  return hook && (typeof hook.hook === "function" && !hook.hasOwnProperty("hook") || typeof hook.unhook === "function" && !hook.hasOwnProperty("unhook"));
}

},{}],51:[function(require,module,exports){
"use strict";

var version = require("./version");

module.exports = isVirtualNode;

function isVirtualNode(x) {
    return x && x.type === "VirtualNode" && x.version === version;
}

},{"./version":54}],52:[function(require,module,exports){
"use strict";

var version = require("./version");

module.exports = isVirtualText;

function isVirtualText(x) {
    return x && x.type === "VirtualText" && x.version === version;
}

},{"./version":54}],53:[function(require,module,exports){
"use strict";

module.exports = isWidget;

function isWidget(w) {
    return w && w.type === "Widget";
}

},{}],54:[function(require,module,exports){
"use strict";

module.exports = "2";

},{}],55:[function(require,module,exports){
"use strict";

var version = require("./version");
var isVNode = require("./is-vnode");
var isWidget = require("./is-widget");
var isThunk = require("./is-thunk");
var isVHook = require("./is-vhook");

module.exports = VirtualNode;

var noProperties = {};
var noChildren = [];

function VirtualNode(tagName, properties, children, key, namespace) {
    this.tagName = tagName;
    this.properties = properties || noProperties;
    this.children = children || noChildren;
    this.key = key != null ? String(key) : undefined;
    this.namespace = typeof namespace === "string" ? namespace : null;

    var count = children && children.length || 0;
    var descendants = 0;
    var hasWidgets = false;
    var hasThunks = false;
    var descendantHooks = false;
    var hooks;

    for (var propName in properties) {
        if (properties.hasOwnProperty(propName)) {
            var property = properties[propName];
            if (isVHook(property) && property.unhook) {
                if (!hooks) {
                    hooks = {};
                }

                hooks[propName] = property;
            }
        }
    }

    for (var i = 0; i < count; i++) {
        var child = children[i];
        if (isVNode(child)) {
            descendants += child.count || 0;

            if (!hasWidgets && child.hasWidgets) {
                hasWidgets = true;
            }

            if (!hasThunks && child.hasThunks) {
                hasThunks = true;
            }

            if (!descendantHooks && (child.hooks || child.descendantHooks)) {
                descendantHooks = true;
            }
        } else if (!hasWidgets && isWidget(child)) {
            if (typeof child.destroy === "function") {
                hasWidgets = true;
            }
        } else if (!hasThunks && isThunk(child)) {
            hasThunks = true;
        }
    }

    this.count = count + descendants;
    this.hasWidgets = hasWidgets;
    this.hasThunks = hasThunks;
    this.hooks = hooks;
    this.descendantHooks = descendantHooks;
}

VirtualNode.prototype.version = version;
VirtualNode.prototype.type = "VirtualNode";

},{"./is-thunk":49,"./is-vhook":50,"./is-vnode":51,"./is-widget":53,"./version":54}],56:[function(require,module,exports){
"use strict";

var version = require("./version");

VirtualPatch.NONE = 0;
VirtualPatch.VTEXT = 1;
VirtualPatch.VNODE = 2;
VirtualPatch.WIDGET = 3;
VirtualPatch.PROPS = 4;
VirtualPatch.ORDER = 5;
VirtualPatch.INSERT = 6;
VirtualPatch.REMOVE = 7;
VirtualPatch.THUNK = 8;

module.exports = VirtualPatch;

function VirtualPatch(type, vNode, patch) {
    this.type = Number(type);
    this.vNode = vNode;
    this.patch = patch;
}

VirtualPatch.prototype.version = version;
VirtualPatch.prototype.type = "VirtualPatch";

},{"./version":54}],57:[function(require,module,exports){
"use strict";

var version = require("./version");

module.exports = VirtualText;

function VirtualText(text) {
    this.text = String(text);
}

VirtualText.prototype.version = version;
VirtualText.prototype.type = "VirtualText";

},{"./version":54}],58:[function(require,module,exports){
"use strict";

var isObject = require("is-object");
var isHook = require("../vnode/is-vhook");

module.exports = diffProps;

function diffProps(a, b) {
    var diff;

    for (var aKey in a) {
        if (!(aKey in b)) {
            diff = diff || {};
            diff[aKey] = undefined;
        }

        var aValue = a[aKey];
        var bValue = b[aKey];

        if (aValue === bValue) {
            continue;
        } else if (isObject(aValue) && isObject(bValue)) {
            if (getPrototype(bValue) !== getPrototype(aValue)) {
                diff = diff || {};
                diff[aKey] = bValue;
            } else if (isHook(bValue)) {
                diff = diff || {};
                diff[aKey] = bValue;
            } else {
                var objectDiff = diffProps(aValue, bValue);
                if (objectDiff) {
                    diff = diff || {};
                    diff[aKey] = objectDiff;
                }
            }
        } else {
            diff = diff || {};
            diff[aKey] = bValue;
        }
    }

    for (var bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {};
            diff[bKey] = b[bKey];
        }
    }

    return diff;
}

function getPrototype(value) {
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value);
    } else if (value.__proto__) {
        return value.__proto__;
    } else if (value.constructor) {
        return value.constructor.prototype;
    }
}

},{"../vnode/is-vhook":50,"is-object":32}],59:[function(require,module,exports){
"use strict";

var isArray = require("x-is-array");

var VPatch = require("../vnode/vpatch");
var isVNode = require("../vnode/is-vnode");
var isVText = require("../vnode/is-vtext");
var isWidget = require("../vnode/is-widget");
var isThunk = require("../vnode/is-thunk");
var handleThunk = require("../vnode/handle-thunk");

var diffProps = require("./diff-props");

module.exports = diff;

function diff(a, b) {
    var patch = { a: a };
    walk(a, b, patch, 0);
    return patch;
}

function walk(a, b, patch, index) {
    if (a === b) {
        return;
    }

    var apply = patch[index];
    var applyClear = false;

    if (isThunk(a) || isThunk(b)) {
        thunks(a, b, patch, index);
    } else if (b == null) {

        // If a is a widget we will add a remove patch for it
        // Otherwise any child widgets/hooks must be destroyed.
        // This prevents adding two remove patches for a widget.
        if (!isWidget(a)) {
            clearState(a, patch, index);
            apply = patch[index];
        }

        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b));
    } else if (isVNode(b)) {
        if (isVNode(a)) {
            if (a.tagName === b.tagName && a.namespace === b.namespace && a.key === b.key) {
                var propsPatch = diffProps(a.properties, b.properties);
                if (propsPatch) {
                    apply = appendPatch(apply, new VPatch(VPatch.PROPS, a, propsPatch));
                }
                apply = diffChildren(a, b, patch, apply, index);
            } else {
                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b));
                applyClear = true;
            }
        } else {
            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b));
            applyClear = true;
        }
    } else if (isVText(b)) {
        if (!isVText(a)) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b));
            applyClear = true;
        } else if (a.text !== b.text) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b));
        }
    } else if (isWidget(b)) {
        if (!isWidget(a)) {
            applyClear = true;
        }

        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b));
    }

    if (apply) {
        patch[index] = apply;
    }

    if (applyClear) {
        clearState(a, patch, index);
    }
}

function diffChildren(a, b, patch, apply, index) {
    var aChildren = a.children;
    var orderedSet = reorder(aChildren, b.children);
    var bChildren = orderedSet.children;

    var aLen = aChildren.length;
    var bLen = bChildren.length;
    var len = aLen > bLen ? aLen : bLen;

    for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i];
        var rightNode = bChildren[i];
        index += 1;

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply, new VPatch(VPatch.INSERT, null, rightNode));
            }
        } else {
            walk(leftNode, rightNode, patch, index);
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count;
        }
    }

    if (orderedSet.moves) {
        // Reorder nodes last
        apply = appendPatch(apply, new VPatch(VPatch.ORDER, a, orderedSet.moves));
    }

    return apply;
}

function clearState(vNode, patch, index) {
    // TODO: Make this a single walk, not two
    unhook(vNode, patch, index);
    destroyWidgets(vNode, patch, index);
}

// Patch records for all destroyed widgets must be added because we need
// a DOM node reference for the destroy function
function destroyWidgets(vNode, patch, index) {
    if (isWidget(vNode)) {
        if (typeof vNode.destroy === "function") {
            patch[index] = appendPatch(patch[index], new VPatch(VPatch.REMOVE, vNode, null));
        }
    } else if (isVNode(vNode) && (vNode.hasWidgets || vNode.hasThunks)) {
        var children = vNode.children;
        var len = children.length;
        for (var i = 0; i < len; i++) {
            var child = children[i];
            index += 1;

            destroyWidgets(child, patch, index);

            if (isVNode(child) && child.count) {
                index += child.count;
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index);
    }
}

// Create a sub-patch for thunks
function thunks(a, b, patch, index) {
    var nodes = handleThunk(a, b);
    var thunkPatch = diff(nodes.a, nodes.b);
    if (hasPatches(thunkPatch)) {
        patch[index] = new VPatch(VPatch.THUNK, null, thunkPatch);
    }
}

function hasPatches(patch) {
    for (var index in patch) {
        if (index !== "a") {
            return true;
        }
    }

    return false;
}

// Execute hooks when two nodes are identical
function unhook(vNode, patch, index) {
    if (isVNode(vNode)) {
        if (vNode.hooks) {
            patch[index] = appendPatch(patch[index], new VPatch(VPatch.PROPS, vNode, undefinedKeys(vNode.hooks)));
        }

        if (vNode.descendantHooks || vNode.hasThunks) {
            var children = vNode.children;
            var len = children.length;
            for (var i = 0; i < len; i++) {
                var child = children[i];
                index += 1;

                unhook(child, patch, index);

                if (isVNode(child) && child.count) {
                    index += child.count;
                }
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index);
    }
}

function undefinedKeys(obj) {
    var result = {};

    for (var key in obj) {
        result[key] = undefined;
    }

    return result;
}

// List diff, naive left to right reordering
function reorder(aChildren, bChildren) {
    // O(M) time, O(M) memory
    var bChildIndex = keyIndex(bChildren);
    var bKeys = bChildIndex.keys;
    var bFree = bChildIndex.free;

    if (bFree.length === bChildren.length) {
        return {
            children: bChildren,
            moves: null
        };
    }

    // O(N) time, O(N) memory
    var aChildIndex = keyIndex(aChildren);
    var aKeys = aChildIndex.keys;
    var aFree = aChildIndex.free;

    if (aFree.length === aChildren.length) {
        return {
            children: bChildren,
            moves: null
        };
    }

    // O(MAX(N, M)) memory
    var newChildren = [];

    var freeIndex = 0;
    var freeCount = bFree.length;
    var deletedItems = 0;

    // Iterate through a and match a node in b
    // O(N) time,
    for (var i = 0; i < aChildren.length; i++) {
        var aItem = aChildren[i];
        var itemIndex;

        if (aItem.key) {
            if (bKeys.hasOwnProperty(aItem.key)) {
                // Match up the old keys
                itemIndex = bKeys[aItem.key];
                newChildren.push(bChildren[itemIndex]);
            } else {
                // Remove old keyed items
                itemIndex = i - deletedItems++;
                newChildren.push(null);
            }
        } else {
            // Match the item in a with the next free item in b
            if (freeIndex < freeCount) {
                itemIndex = bFree[freeIndex++];
                newChildren.push(bChildren[itemIndex]);
            } else {
                // There are no free items in b to match with
                // the free items in a, so the extra free nodes
                // are deleted.
                itemIndex = i - deletedItems++;
                newChildren.push(null);
            }
        }
    }

    var lastFreeIndex = freeIndex >= bFree.length ? bChildren.length : bFree[freeIndex];

    // Iterate through b and append any new keys
    // O(M) time
    for (var j = 0; j < bChildren.length; j++) {
        var newItem = bChildren[j];

        if (newItem.key) {
            if (!aKeys.hasOwnProperty(newItem.key)) {
                // Add any new keyed items
                // We are adding new items to the end and then sorting them
                // in place. In future we should insert new items in place.
                newChildren.push(newItem);
            }
        } else if (j >= lastFreeIndex) {
            // Add any leftover non-keyed items
            newChildren.push(newItem);
        }
    }

    var simulate = newChildren.slice();
    var simulateIndex = 0;
    var removes = [];
    var inserts = [];
    var simulateItem;

    for (var k = 0; k < bChildren.length;) {
        var wantedItem = bChildren[k];
        simulateItem = simulate[simulateIndex];

        // remove items
        while (simulateItem === null && simulate.length) {
            removes.push(remove(simulate, simulateIndex, null));
            simulateItem = simulate[simulateIndex];
        }

        if (!simulateItem || simulateItem.key !== wantedItem.key) {
            // if we need a key in this position...
            if (wantedItem.key) {
                if (simulateItem && simulateItem.key) {
                    // if an insert doesn't put this key in place, it needs to move
                    if (bKeys[simulateItem.key] !== k + 1) {
                        removes.push(remove(simulate, simulateIndex, simulateItem.key));
                        simulateItem = simulate[simulateIndex];
                        // if the remove didn't put the wanted item in place, we need to insert it
                        if (!simulateItem || simulateItem.key !== wantedItem.key) {
                            inserts.push({ key: wantedItem.key, to: k });
                        }
                        // items are matching, so skip ahead
                        else {
                                simulateIndex++;
                            }
                    } else {
                        inserts.push({ key: wantedItem.key, to: k });
                    }
                } else {
                    inserts.push({ key: wantedItem.key, to: k });
                }
                k++;
            }
            // a key in simulate has no matching wanted key, remove it
            else if (simulateItem && simulateItem.key) {
                    removes.push(remove(simulate, simulateIndex, simulateItem.key));
                }
        } else {
            simulateIndex++;
            k++;
        }
    }

    // remove all the remaining nodes from simulate
    while (simulateIndex < simulate.length) {
        simulateItem = simulate[simulateIndex];
        removes.push(remove(simulate, simulateIndex, simulateItem && simulateItem.key));
    }

    // If the only moves we have are deletes then we can just
    // let the delete patch remove these items.
    if (removes.length === deletedItems && !inserts.length) {
        return {
            children: newChildren,
            moves: null
        };
    }

    return {
        children: newChildren,
        moves: {
            removes: removes,
            inserts: inserts
        }
    };
}

function remove(arr, index, key) {
    arr.splice(index, 1);

    return {
        from: index,
        key: key
    };
}

function keyIndex(children) {
    var keys = {};
    var free = [];
    var length = children.length;

    for (var i = 0; i < length; i++) {
        var child = children[i];

        if (child.key) {
            keys[child.key] = i;
        } else {
            free.push(i);
        }
    }

    return {
        keys: keys, // A hash of key name to index
        free: free // An array of unkeyed item indices
    };
}

function appendPatch(apply, patch) {
    if (apply) {
        if (isArray(apply)) {
            apply.push(patch);
        } else {
            apply = [apply, patch];
        }

        return apply;
    } else {
        return patch;
    }
}

},{"../vnode/handle-thunk":48,"../vnode/is-thunk":49,"../vnode/is-vnode":51,"../vnode/is-vtext":52,"../vnode/is-widget":53,"../vnode/vpatch":56,"./diff-props":58,"x-is-array":33}],60:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DOMReady = require('document-ready-promise')();
var defaults = require('object.defaults/immutable');
var mix = require('mixwith-es5').mix;
var EventEmitterMixin = require('./event-emitter-mixin');
var VDOMPatch = require('virtual-dom/patch');
var VDOMDiff = require('virtual-dom/diff');
var h = require('virtual-dom/h');
var createElement = require('virtual-dom/create-element');

var VDOMWidget = require('./vdom-widget');

var defaultOpts = {
    markupTransforms: [],
    stylesTransforms: [],
    childStylesFirst: true
};

function createStyleEl(id) {
    var className = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    var styleEl = document.createElement('style');
    styleEl.setAttribute('type', 'text/css');
    document.head.appendChild(styleEl);
    styleEl.id = id;
    styleEl.classList.add(className);
    return styleEl;
}

var App = function (_mix$with) {
    _inherits(App, _mix$with);

    _createClass(App, null, [{
        key: 'patchMethods',
        get: function get() {
            return ['patchDOM', 'patchStyles'];
        }
    }]);

    function App(opts) {
        var _Object$definePropert;

        _classCallCheck(this, App);

        opts = defaults(opts, defaultOpts);

        var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, opts));

        if (opts.styles) {
            console.warn('You are using deprecated syntax: opts.styles on the app are no longer supported. Use static getter');
        }
        _this.styles = opts.styles || _this.constructor.styles;
        _this.renderOrder = ['markup', 'styles'];
        _this.pipelineInitMethods = opts.pipelineInitMethods;
        _this.componentInitOpts = Array.isArray(opts.Component) ? opts.Component[1] : {};
        _this.shouldRender = {};
        _this.renderInterval = opts.renderInterval;
        _this.stylesRenderFormat = opts.stylesRenderFormat;
        _this.markupRenderFormat = opts.markupRenderFormat;
        _this.markupTransforms = opts.markupTransforms;
        _this.stylesTransforms = opts.stylesTransforms;
        _this.childStylesFirst = opts.childStylesFirst;

        Object.defineProperties(_this, (_Object$definePropert = {
            Component: { value: _this.constructor.Weddell.classes.Component.makeComponentClass(Array.isArray(opts.Component) ? opts.Component[0] : opts.Component) },
            component: { get: function get() {
                    return _this._component;
                } },
            vTree: { value: h('div'), writable: true },
            el: { get: function get() {
                    return _this._el;
                } },
            _el: { value: null, writable: true },
            _elInput: { value: opts.el },
            _patchPromise: { value: null, writable: true },
            patchPromise: { get: function get() {
                    return _this._patchPromise;
                } },
            _RAFCallback: { value: null, writable: true },
            _patchRequests: { value: [], writable: true }
        }, _defineProperty(_Object$definePropert, '_patchPromise', { value: null, writable: true }), _defineProperty(_Object$definePropert, '_component', { value: null, writable: true }), _Object$definePropert));

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

        Object.defineProperties(_this, {
            rootNode: { value: createElement(_this.vTree), writable: true }
        });
        return _this;
    }

    _createClass(App, [{
        key: 'patchDOM',
        value: function patchDOM(patchRequests) {
            var _this2 = this;

            if (!this.rootNode.parentNode) {
                this.el.appendChild(this.rootNode);
            }

            this.component.refreshPendingWidgets();
            var newTree = new VDOMWidget({ component: this.component });
            var diffTree = VDOMWidget.pruneNullNodes(newTree.vTree); //this.component.constructor.pruneNullNodes(newTree);
            var patches = VDOMDiff(this.vTree, diffTree);
            var rootNode = VDOMPatch(this.rootNode, patches);
            this.rootNode = rootNode;
            this.vTree = newTree;

            var mountedComponents = this.component.reduceComponents(function (acc, component) {
                return Object.assign(acc, component._lastRenderedComponents);
            }, {});

            this.component.walkComponents(function (component) {
                return component.isMounted ? component.unmount() : component.mount();
            }, function (component) {
                return component !== _this2.component && component.isMounted !== component.id in mountedComponents;
            });

            this.trigger('patchdom');
        }
    }, {
        key: 'patchStyles',
        value: function patchStyles(patchRequests) {
            var results = patchRequests.reduceRight(function (acc, item) {
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

            this.component.walkComponents(function (component) {
                var id = component.id;
                var needsPatch = id in results.components;
                var stylesObj = needsPatch ? results.components[id].results.renderStyles : component._renderCache.renderStyles;

                var makeObj = function makeObj(key, obj) {
                    return Object.assign(Object.create(null, { styles: { get: function get() {
                                return obj ? obj[key] : null;
                            } } }), { id: id, needsPatch: needsPatch });
                };

                instanceStyles.push(makeObj('dynamicStyles', stylesObj));

                id = component.constructor.id;

                if (!(id in staticStyles)) {
                    needsPatch = id in results.classes;
                    stylesObj = needsPatch ? results.classes[id].results.renderStyles : component._renderCache.renderStyles;
                    staticStyles[id] = makeObj('staticStyles', stylesObj);
                }
            }, function (component) {
                return component.isMounted;
            });

            staticStyles = Object.values(staticStyles);

            //We now have a pretty good idea what we're writing. Let's patch those styles to DOM

            var prevEl;
            var styles;

            staticStyles.concat(instanceStyles).reduce(function (final, obj) {
                var styleIndex = final.findIndex(function (styleEl) {
                    return styleEl.id === 'weddell-style-' + obj.id;
                });
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
            }, Array.from(document.querySelectorAll('head style.weddell-style'))).forEach(function (el) {
                document.head.removeChild(el);
            });

            this.trigger('patchstyles');
        }
    }, {
        key: 'makeComponent',
        value: function makeComponent() {
            var component = new this.Component({
                isRoot: true
            });

            component.assignProps(Object.values(this.el.attributes).reduce(function (finalObj, attr) {
                finalObj[attr.name] = attr.value;
                return finalObj;
            }, {}));

            return component;
        }
    }, {
        key: 'queuePatch',
        value: function queuePatch(patchRequests) {
            var _this3 = this;

            if (!this._patchPromise) {
                var resolveFunc;
                this._patchPromise = new Promise(function (resolve) {
                    resolveFunc = resolve;
                }).then(function (patchRequests) {
                    _this3._patchPromise = null;
                    _this3.constructor.patchMethods.forEach(function (patcher) {
                        _this3[patcher](patchRequests);
                    });
                    _this3.trigger('patch');
                    return _this3.onPatch();
                });

                this._patchRequests = [].concat(patchRequests);

                requestAnimationFrame(this._RAFCallback = function () {
                    _this3._RAFCallback = null;
                    resolveFunc(_this3._patchRequests);
                    _this3._patchRequests = [];
                });
            } else {
                this._patchRequests = this._patchRequests.concat(patchRequests);
            }
        }
    }, {
        key: 'onPatch',
        value: function onPatch() {
            //noop
        }
    }, {
        key: 'awaitPatch',
        value: function awaitPatch() {
            return this.patchPromise || Promise.resolve();
        }
    }, {
        key: 'awaitNextPatch',
        value: function awaitNextPatch() {
            var _this4 = this;

            return this.patchPromise || this.component.awaitEvent('requestpatch').then(function () {
                return _this4.patchPromise;
            });
        }
    }, {
        key: 'init',
        value: function init() {
            var _this5 = this;

            return DOMReady.then(function () {
                var el = _this5._elInput;
                if (typeof el == 'string') {
                    el = document.querySelector(el);
                    if (!el) {
                        throw new Error("Could not mount an element using provided query.");
                    }
                }
                _this5._el = el;

                if (_this5.styles) {
                    createStyleEl('weddell-app-styles').textContent = _this5.styles;
                }

                _this5._component = _this5.makeComponent();

                _this5.trigger('createcomponent', { component: _this5.component });
                _this5.trigger('createrootcomponent', { component: _this5.component });
                _this5.component.on('createcomponent', function (evt) {
                    return _this5.trigger('createcomponent', Object.assign({}, evt));
                });
                _this5.component.on('requestpatch', function (evt) {
                    _this5.queuePatch(evt);
                });

                Object.seal(_this5);

                return _this5.component.init(_this5.componentInitOpts).then(function () {
                    return _this5.component.mount();
                }).then(function () {
                    return _this5.awaitPatch().then(function () {
                        _this5.el.classList.add('first-markup-render-complete', 'first-styles-render-complete', 'first-render-complete');
                    });
                });
            });
        }
    }]);

    return App;
}(mix(App).with(EventEmitterMixin));

module.exports = App;

},{"./event-emitter-mixin":62,"./vdom-widget":64,"document-ready-promise":10,"mixwith-es5":13,"object.defaults/immutable":15,"virtual-dom/create-element":24,"virtual-dom/diff":25,"virtual-dom/h":26,"virtual-dom/patch":34}],61:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var EventEmitterMixin = require('./event-emitter-mixin');
var defaults = require('object.defaults/immutable');
var generateHash = require('../utils/make-hash');
var mix = require('mixwith-es5').mix;
var h = require('virtual-dom/h');
var VDOMWidget = require('./vdom-widget');

function flatten(arr) {
    var _ref;

    return (_ref = []).concat.apply(_ref, _toConsumableArray(arr));
}

function compact(arr) {
    return arr.filter(function (item) {
        return item != null;
    });
}

function uniq(arr) {
    return arr.reduce(function (acc, item) {
        return acc.includes(item) ? acc : acc.concat(item);
    }, []);
}

var defaultOpts = {
    store: {},
    inputs: null,
    isRoot: false
};
var defaultInitOpts = {};
var _generatedComponentClasses = {};
var testElement = document.createElement('div');

var Component = function (_mix$with) {
    _inherits(Component, _mix$with);

    _createClass(Component, null, [{
        key: 'renderMethods',
        get: function get() {
            return ['renderVNode', 'renderStyles'];
        }
    }]);

    function Component(opts) {
        _classCallCheck(this, Component);

        opts = defaults(opts, defaultOpts);

        var _this = _possibleConstructorReturn(this, (Component.__proto__ || Object.getPrototypeOf(Component)).call(this, opts));

        var Store = _this.constructor.Weddell.classes.Store;
        if (opts.inputs) {
            console.warn('you are using outdated syntax! opts.inputs is deprecated in favor of static getter.');
        }
        Object.defineProperties(_this, {
            id: { get: function get() {
                    return _this._id;
                } },
            isRoot: { value: opts.isRoot },
            content: { value: [], writable: true },
            hasMounted: { get: function get() {
                    return _this._hasMounted;
                } },
            isMounted: { get: function get() {
                    return _this._isMounted;
                } },
            renderPromise: { get: function get() {
                    return _this._renderPromise;
                } },
            hasRendered: { get: function get() {
                    return _this._hasRendered;
                } },
            el: { get: function get() {
                    return _this._el;
                } },
            isInit: { get: function get() {
                    return _this._isInit;
                } },
            defaultInitOpts: { value: defaults(opts.defaultInitOpts, defaultInitOpts) },
            root: { value: opts.isRoot ? _this : opts.root },
            inputs: { value: compact(_this.constructor.inputs || opts.inputs || []) },
            //@TODO inputs don't need to be stored on isntance at all

            renderers: { value: {} },

            _el: { value: null, writable: true },
            _lastAccessedStateKeys: { value: _this.constructor.renderMethods.reduce(function (acc, key) {
                    return Object.assign(acc, _defineProperty({}, key, []));
                }, {}) },
            _dirtyRenderers: { value: false, writable: true },
            _inlineEventHandlers: { writable: true, value: {} },
            _isMounted: { writable: true, value: null },
            _lastRenderedComponents: { writable: true, value: null },
            _componentsRequestingPatch: { writable: true, value: [] },
            _renderPromise: { writable: true, value: null },
            _hasMounted: { writable: true, value: false },
            _hasRendered: { writable: true, value: false },
            _renderCache: { value: _this.constructor.renderMethods.reduce(function (acc, key) {
                    return Object.assign(acc, _defineProperty({}, key, []));
                }, {}) },
            _isInit: { writable: true, value: false },
            _id: { value: generateHash() },
            _tagDirectives: { value: {} },
            _componentListenerCallbacks: { value: {}, writable: true }
        });

        var inputMappings = _this.constructor._inputMappings ? Object.entries(_this.constructor._inputMappings).filter(function (entry) {
            return _this.inputs.find(function (input) {
                return input === entry[0] || input.key === entry[0];
            });
        }).reduce(function (final, entry) {
            final[entry[1]] = entry[0];
            return final;
        }, {}) : {};

        Object.defineProperties(_this, {
            props: {
                value: new Store(_this.inputs.map(function (input) {
                    return typeof input === 'string' ? input : input.key ? input.key : null;
                }), {
                    shouldMonitorChanges: true,
                    extends: opts.parentComponent ? [opts.parentComponent.props, opts.parentComponent.state, opts.parentComponent.store] : null,
                    inputMappings: inputMappings,
                    validators: _this.inputs.filter(function (input) {
                        return (typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object';
                    }).reduce(function (final, inputObj) {
                        return Object.assign(final, _defineProperty({}, inputObj.key, { validator: inputObj.validator, required: inputObj.required }));
                    }, {}),
                    shouldEvalFunctions: false
                })
            },
            store: {
                value: new Store(Object.assign({
                    $bind: _this.bindEvent.bind(_this),
                    $bindValue: _this.bindEventValue.bind(_this)
                }, opts.store), {
                    shouldMonitorChanges: false,
                    shouldEvalFunctions: false
                })
            }
        });

        if (opts.state) {
            console.warn("opts.state is deprecated in favor of static 'state' getter. Update your code!");
        }
        var state = _this.constructor.state || opts.state || {};

        Object.defineProperty(_this, 'state', {
            value: new Store(defaults({
                $attributes: null,
                $id: function $id() {
                    return _this.id;
                }
            }, state), {
                overrides: [_this.props],
                proxies: [_this.store]
            })
        });

        if (opts.components) {
            console.warn("opts.components is deprecated in favor of static 'components' getter. Please update your code.");
        }
        var components = _this.constructor.components || opts.components || {};

        Object.defineProperties(_this, {
            _componentInstances: { value: Object.keys(components).map(function (key) {
                    return key.toLowerCase();
                }).reduce(function (final, key) {
                    final[key] = {};
                    return final;
                }, {})
            },
            _locals: { value: new Store({}, { proxies: [_this.state, _this.store], shouldMonitorChanges: false, shouldEvalFunctions: false }) }
        });

        Object.defineProperty(_this, 'components', {
            value: Object.entries(components).map(function (entry) {
                return [entry[0].toLowerCase(), entry[1]];
            }).reduce(function (final, entry) {
                final[entry[0]] = _this.createChildComponentClass(entry[0], entry[1]);
                return final;
            }, {})
        });

        // this.on('componentschange', evt => {
        //     this.markDirty(null, 'styles');
        // });

        _this.getParent = function () {
            return opts.parentComponent || null;
        };
        if (opts.markupTemplate) {
            console.warn("You are using deprecated syntax. 'markupTemplate' will be removed in the next major version. Use static 'markup' getter.");
        }
        if (opts.stylesTemplate) {
            console.warn("You are using deprecated syntax. 'stylesTemplate' will be removed in the next major version. Use static 'styles' getter for static styles, and instance 'styles' for runtime templates.");
        }
        _this.vNodeTemplate = _this.makeVNodeTemplate(_this.constructor.markup, opts.markupTemplate);
        _this.stylesTemplate = _this.makeStylesTemplate(_this.constructor.dynamicStyles || opts.stylesTemplate, _this.constructor.styles);
        _this.vTree = null;

        window[_this.constructor.Weddell.consts.VAR_NAME].components[_this._id] = _this;
        return _this;
    }

    _createClass(Component, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var dirtyRenderers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            var promise = this.constructor.renderMethods.reduce(function (acc, method) {
                return acc.then(function (results) {
                    return Promise.resolve(_this2[method]()).then(function (result) {
                        Object.defineProperty(results, method, { get: function get() {
                                return result;
                            }, enumerable: true });
                        return results;
                    });
                });
            }, Promise.resolve({})).then(function (results) {
                return Promise.resolve(results).then(function (results) {
                    if (_this2._dirtyRenderers) {
                        _this2._dirtyRenderers = null;
                        return Promise.reject(_this2._dirtyRenderers);
                    }
                    return results;
                }).then(function (results) {
                    _this2._renderPromise = null;
                    _this2._hasRendered = true;
                    _this2.requestPatch(results);
                    return results;
                }, function (dirtyRenderers) {
                    return _this2.render(dirtyRenderers);
                });
            }, function (err) {
                throw err;
            }).then(function (results) {
                return Promise.resolve(_this2.onRender()).then(function () {
                    return results;
                });
            });

            return !this._renderPromise ? this._renderPromise = promise : promise;
        }
    }, {
        key: 'onInit',
        value: function onInit() {}
    }, {
        key: 'onFirstRender',
        value: function onFirstRender() {}
    }, {
        key: 'onRender',
        value: function onRender() {}
    }, {
        key: 'onDOMCreate',
        value: function onDOMCreate() {}
    }, {
        key: 'onDOMMove',
        value: function onDOMMove() {}
    }, {
        key: 'onDOMChange',
        value: function onDOMChange() {}
    }, {
        key: 'onDOMCreateOrChange',
        value: function onDOMCreateOrChange() {}
    }, {
        key: 'onDOMDestroy',
        value: function onDOMDestroy() {}
    }, {
        key: 'onMount',
        value: function onMount() {}
    }, {
        key: 'onUnmount',
        value: function onUnmount() {}
    }, {
        key: 'onFirstMount',
        value: function onFirstMount() {}
    }, {
        key: 'onRenderMarkup',
        value: function onRenderMarkup() {}
    }, {
        key: 'onRenderStyles',
        value: function onRenderStyles() {}
    }, {
        key: 'requestPatch',
        value: function requestPatch(results) {
            this.trigger('requestpatch', { results: results ? Object.create(results) : {}, id: this.id, classId: this.constructor.id });
        }
    }, {
        key: 'makeVNodeTemplate',
        value: function makeVNodeTemplate() {
            var _this3 = this;

            /*
            * Take instance and static template inputs, return a function that will generate the correct output.
            */

            return Array.from(arguments).reduce(function (acc, curr) {
                if (!acc) {
                    if (typeof curr === 'function') {
                        return _this3.wrapTemplate(curr, 'renderVNode', h);
                    }
                    if (typeof curr === 'string') {
                        //TODO support template string parser;
                    }
                }
                return acc;
            }, null);
        }
    }, {
        key: 'makeStylesTemplate',
        value: function makeStylesTemplate(dynamicStyles) {
            var _this4 = this;

            var staticStyles = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

            if (typeof dynamicStyles === 'function') {} else if (dynamicStyles) {
                throw new Error('Only functions are supported for dynamic styles for now.');
            }

            if (typeof staticStyles !== 'string') {
                throw new Error('Only strings are supported for static component styles.');
            }

            return this.wrapTemplate(function (locals) {
                var styles = dynamicStyles ? dynamicStyles.call(_this4, locals) : null;
                return Object.defineProperties({}, {
                    dynamicStyles: {
                        get: function get() {
                            return styles;
                        }
                    },
                    staticStyles: {
                        get: function get() {
                            return staticStyles;
                        }
                    }
                });
            }, 'renderStyles');
        }
    }, {
        key: 'wrapTemplate',
        value: function wrapTemplate(func, renderMethodName) {
            var _this5 = this,
                _arguments = arguments;

            return function () {
                var accessed = {};

                _this5.state.on('get', function (evt) {
                    accessed[evt.key] = 1;
                });

                var result = func.apply(_this5, [_this5.state].concat(Array.from(_arguments).slice(2)));

                _this5._renderCache[renderMethodName] = result;
                _this5._lastAccessedStateKeys[renderMethodName] = accessed;

                return result;
            };
        }
    }, {
        key: 'renderStyles',
        value: function renderStyles() {
            var _this6 = this;

            return Promise.resolve(this.stylesTemplate()).then(function (results) {
                return Promise.resolve(_this6.onRenderStyles()).then(function () {
                    return results;
                });
            });
        }
    }, {
        key: 'renderVNode',
        value: function renderVNode() {
            var _this7 = this;

            var vTree = this.vNodeTemplate();

            if (Array.isArray(vTree)) {
                if (vTree.length > 1) {
                    console.warn('Template output was truncated in', this.constructor.name, 'component. Component templates must return a single vNode!');
                }
                vTree = vTree[0];
            }
            var renderedComponents = {};
            return vTree ? this.replaceComponentPlaceholders(vTree, renderedComponents).then(function (vTree) {
                _this7.vTree = vTree;
                return Promise.all(flatten(Object.values(renderedComponents))).then(function (rendered) {
                    _this7._lastRenderedComponents = rendered.reduce(function (acc, item) {
                        return Object.assign(acc, _defineProperty({}, item.id, item), {});
                    }, {});
                });
            }).then(function () {
                return _this7.onRenderMarkup();
            }).then(function () {
                return _this7.vTree;
            }) : this.vTree = null;
        }
    }, {
        key: 'replaceComponentPlaceholders',
        value: function replaceComponentPlaceholders(vNode) {
            var _this8 = this;

            var renderedComponents = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var components;
            var componentName;

            if (Array.isArray(vNode)) {
                return Promise.all(vNode.map(function (child) {
                    return _this8.replaceComponentPlaceholders(child, renderedComponents);
                }));
            } else if (!vNode.tagName) {
                return vNode;
            } else if ((componentName = vNode.tagName.toLowerCase()) in this.constructor.tagDirectives) {
                return Promise.resolve(this.constructor.tagDirectives[componentName].call(this, vNode, vNode.children || [], vNode.properties.attributes));
            }

            if (vNode.children) {
                var promise = this.replaceComponentPlaceholders(vNode.children, renderedComponents).then(function (children) {
                    if (children.some(function (child, ii) {
                        return vNode.children[ii] !== child;
                    })) {
                        return VDOMWidget.cloneVNode(vNode, flatten(children));
                    }
                    return vNode;
                });
            } else {
                promise = Promise.resolve(vNode);
            }

            return promise.then(function (vNode) {
                if (componentName in (components = _this8.collectComponentTree())) {
                    var props = vNode.properties.attributes;
                    var content = vNode.children || [];
                    if (!(componentName in renderedComponents)) {
                        renderedComponents[componentName] = [];
                    }
                    var index = vNode.properties.attributes && vNode.properties.attributes[_this8.constructor.Weddell.consts.INDEX_ATTR_NAME] || renderedComponents[componentName].length;

                    return _this8.makeChildComponentWidget(componentName, index, content, props, renderedComponents);
                }

                return VDOMWidget.cloneVNode(vNode, null, true);
            });
        }
    }, {
        key: 'makeChildComponentWidget',
        value: function makeChildComponentWidget(componentName, index, content, props) {
            var _this9 = this;

            var renderedComponents = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

            var prom = this.getInitComponentInstance(componentName, index);
            if (!(componentName in renderedComponents)) {
                renderedComponents[componentName] = [];
            }
            renderedComponents[componentName].push(prom);

            return prom.then(function (component) {
                return Promise.all(content.map(function (contentNode) {
                    return component.replaceComponentPlaceholders(contentNode, renderedComponents);
                })).then(function (content) {
                    component.content = content;
                    component.assignProps(props, _this9);
                    return component.mount().then(function (didMount) {
                        _this9.trigger('componentplaceholderreplaced', { component: component });
                        return new VDOMWidget({ component: component });
                    });
                });
            });
        }
    }, {
        key: 'refreshPendingWidgets',
        value: function refreshPendingWidgets() {
            var componentsToRefresh = uniq(this._componentsRequestingPatch);
            componentsToRefresh.forEach(function (instance) {
                return instance.refreshPendingWidgets();
            });
            this.vTree = this.refreshWidgets(this.vTree, componentsToRefresh);
            this._componentsRequestingPatch = [];
        }
    }, {
        key: 'refreshWidgets',
        value: function refreshWidgets(vNode) {
            var _this10 = this;

            var targetComponents = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

            if (!vNode) {
                return vNode;
            } else if (vNode.type === 'Widget') {
                if (targetComponents.includes(vNode.component)) {
                    return new VDOMWidget({ component: vNode.component });
                }
            } else if (vNode.children) {
                var children = vNode.children.map(function (child) {
                    return _this10.refreshWidgets(child, targetComponents);
                });
                if (children.some(function (child, ii) {
                    return child !== vNode.children[ii];
                })) {
                    return VDOMWidget.cloneVNode(vNode, children);
                }
            }
            return vNode;
        }
    }, {
        key: 'walkComponents',
        value: function walkComponents(callback) {
            var filterFunc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
                return true;
            };

            if (filterFunc(this)) {
                callback(this);
            }
            for (var componentName in this.components) {
                Object.values(this._componentInstances[componentName]).forEach(function (instance) {
                    return instance.walkComponents(callback, filterFunc);
                });
            }
        }
    }, {
        key: 'reduceComponents',
        value: function reduceComponents(callback, initialVal) {
            var filterFunc = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {
                return true;
            };

            var acc = initialVal;
            if (filterFunc(this)) {
                acc = callback(acc, this);
            }
            for (var componentName in this.components) {
                acc = Object.values(this._componentInstances[componentName]).reduce(function (acc, instance) {
                    return instance.reduceComponents(callback, acc, filterFunc);
                }, acc);
            }
            return acc;
        }
    }, {
        key: 'checkChangedKey',
        value: function checkChangedKey(key) {
            return Object.entries(this._lastAccessedStateKeys).reduce(function (acc, entry) {
                return key in entry[1] ? Object.assign(acc || {}, _defineProperty({}, entry[0], 1)) : acc;
            }, null);
        }
    }, {
        key: 'collectComponentTree',
        value: function collectComponentTree() {
            var _this11 = this;

            var parent = this.getParent();
            return Object.entries(this.components).reduce(function (acc, entry) {
                return Object.assign(acc, _defineProperty({}, entry[0].toLowerCase(), {
                    sourceInstance: _this11,
                    componentClass: entry[1]
                }));
            }, parent ? parent.collectComponentTree() : {});
        }
    }, {
        key: 'queryDOM',
        value: function queryDOM(query) {
            return this.awaitRender().then(function () {
                return document.querySelector(query);
            });
        }
    }, {
        key: 'queryDOMAll',
        value: function queryDOMAll(query) {
            return this.awaitRender().then(function () {
                return document.querySelectorAll(query);
            });
        }
    }, {
        key: 'awaitEvent',
        value: function awaitEvent(eventName, evtObjValidator) {
            var resolveProm;
            var promise = new Promise(function (resolve) {
                resolveProm = resolve;
            });
            this.once(eventName, function (evt) {
                resolveProm(evt);
            });
            return promise;
        }
    }, {
        key: 'awaitRender',
        value: function awaitRender(val) {
            return (this.renderPromise ? this.renderPromise : Promise.resolve()).then(function () {
                return val;
            });
        }
    }, {
        key: 'addTagDirective',
        value: function addTagDirective(name, directive) {
            this._tagDirectives[name.toUpperCase()] = directive;
        }
    }, {
        key: 'createChildComponentClass',
        value: function createChildComponentClass(componentName, ChildComponent) {
            if (Array.isArray(ChildComponent)) {
                var initOpts = ChildComponent[2];
                var inputMappings = ChildComponent[1];
                ChildComponent = ChildComponent[0];
            }

            ChildComponent = this.constructor.makeComponentClass(ChildComponent);

            var parentComponent = this;
            var root = this.root;

            var obj = {};

            obj[componentName] = function (_ChildComponent) {
                _inherits(_class, _ChildComponent);

                function _class(opts) {
                    _classCallCheck(this, _class);

                    var _this12 = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, defaults({
                        root: root,
                        parentComponent: parentComponent
                    }, opts)));

                    parentComponent.trigger('createcomponent', { component: _this12, parentComponent: parentComponent, componentName: componentName });

                    _this12.on('createcomponent', function (evt) {
                        parentComponent.trigger('createcomponent', Object.assign({}, evt));
                    });
                    return _this12;
                }

                return _class;
            }(ChildComponent);

            this.trigger('createcomponentclass', { ComponentClass: obj[componentName] });

            Object.defineProperties(obj[componentName], {
                _initOpts: { value: initOpts },
                _inputMappings: { value: inputMappings }
            });

            return obj[componentName];
        }
    }, {
        key: 'markDirty',
        value: function markDirty() {
            var dirtyRenderers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            //@TODO maybe also set dirtyRenderers when component isn't mounted
            if (this.renderPromise || !this.isMounted) {
                this._dirtyRenderers = Object.assign(this._dirtyRenderers || {}, dirtyRenderers);
            } else {
                this.render(dirtyRenderers);
            }
        }
    }, {
        key: 'init',
        value: function init(opts) {
            var _this13 = this;

            opts = defaults(opts, this.defaultInitOpts);
            if (!this._isInit) {
                this._isInit = true;

                ['props', 'state'].forEach(function (propName) {
                    _this13[propName].on('change', function (evt) {
                        if (evt.target === _this13[propName]) {
                            var dirtyRenderers = _this13.checkChangedKey(evt.changedKey);
                            if (dirtyRenderers) {
                                _this13.markDirty(dirtyRenderers);
                            }
                        }
                    });
                });

                return this.render().then(function () {
                    return Promise.resolve(_this13.onFirstRender(opts));
                }).then(function () {
                    return Promise.resolve(_this13.onInit(opts));
                }).then(function () {
                    _this13.trigger('init');
                    return _this13;
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
        key: 'bindEventValue',
        value: function bindEventValue(propName, opts) {
            return this.bindEvent("this.state['" + propName + "'] = event.target.value", opts);
        }
    }, {
        key: 'getMountedChildComponents',
        value: function getMountedChildComponents() {
            var _this14 = this;

            return this.reduceComponents(function (acc, component) {
                return acc.concat(component);
            }, [], function (component) {
                return component !== _this14 && component._isMounted;
            });
        }
    }, {
        key: 'assignProps',
        value: function assignProps(props, parentScope) {
            var _this15 = this;

            if (props) {
                this.inputs.filter(function (input) {
                    return !(input in props || input.key in props);
                }).forEach(function (input) {
                    _this15.props[input.key || input] = null;
                });

                var parsedProps = Object.entries(props).reduce(function (acc, entry) {
                    if (_this15.inputs.some(function (input) {
                        return input === entry[0] || input.key === entry[0];
                    })) {
                        acc[0][entry[0]] = entry[1];
                    } else if (entry[0].slice(0, 2) === 'on' && !(entry[0] in testElement)) {
                        //TODO support more spec-compliant data- attrs
                        acc[1][entry[0]] = entry[1];
                    } else {
                        acc[2][entry[0]] = entry[1];
                    }
                    return acc;
                }, [{}, {}, {}]); //first item props, second item event handlers, third item attributes

                Object.assign(this.props, parsedProps[0]);
                this.bindInlineEventHandlers(parsedProps[1], parentScope);
                this.state.$attributes = parsedProps[2];
            }
        }
    }, {
        key: 'bindInlineEventHandlers',
        value: function bindInlineEventHandlers(handlersObj, scope) {
            var _this16 = this;

            var results = Object.entries(this._inlineEventHandlers).reduce(function (acc, currHandlerEntry) {
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

            handlerEntriesToRemove.forEach(function (handlerEntry) {
                handlerEntry[1].off();
                delete _this16._inlineEventHandlers[handlerEntry[0]];
            });

            for (var eventName in handlersToAdd) {
                var handlerString = handlersToAdd[eventName];
                this._inlineEventHandlers[eventName] = { handlerString: handlerString };
                try {
                    var callback = new Function('component', 'event', handlerString).bind(scope, this);
                } catch (err) {
                    throw "Failed parsing event handler for component: " + err.stack;
                }
                this._inlineEventHandlers[eventName].off = this.on(eventName.slice(2), callback);
            }
        }
    }, {
        key: 'addComponentEvents',
        value: function addComponentEvents(componentName, childComponent, index) {
            var _this17 = this;

            var componentKeyIndex;
            if (this.constructor.componentEventListeners && (componentKeyIndex = Object.keys(this.constructor.componentEventListeners).map(function (key) {
                return key.toLowerCase();
            }).indexOf(componentName)) > -1) {
                if (!(componentName in this._componentListenerCallbacks)) {
                    this._componentListenerCallbacks[componentName] = {};
                }
                this._componentListenerCallbacks[componentName][index] = Object.entries(this.constructor.componentEventListeners[Object.keys(this.constructor.componentEventListeners)[componentKeyIndex]]).map(function (entry) {
                    return childComponent.on(entry[0], function () {
                        if (childComponent.isMounted) {
                            entry[1].apply(this, Array.from(arguments).concat(childComponent));
                        }
                    }.bind(_this17));
                });
            }
        }
    }, {
        key: 'unmount',
        value: function unmount() {
            if (this._isMounted) {
                for (var eventName in this._inlineEventHandlers) {
                    this._inlineEventHandlers[eventName].off();
                    delete this._inlineEventHandlers[eventName];
                }
                this._isMounted = false;
                this.trigger('unmount');
                return Promise.resolve(this.onUnmount()).then(function () {
                    return true;
                });
            }
            return Promise.resolve(false);
        }
    }, {
        key: 'mount',
        value: function mount() {
            var _this18 = this;

            if (!this._isMounted) {
                this._isMounted = true;
                this.trigger('mount');
                var arr = ['onMount'];
                if (!this.hasMounted) {
                    this._hasMounted = true;
                    this.trigger('firstmount');
                    arr.push('onFirstMount');
                }
                if (this._dirtyRenderers) {
                    this._dirtyRenderers = null;
                    return this.render().then(function () {
                        return Promise.all(arr.map(function (func) {
                            return _this18[func]();
                        }));
                    });
                }
                return Promise.all(arr.map(function (func) {
                    return _this18[func]();
                })).then(function () {
                    return true;
                });
            }
            return Promise.resolve(false);
        }
    }, {
        key: 'makeComponentInstance',
        value: function makeComponentInstance(componentName, index, opts) {
            var _this19 = this;

            componentName = componentName.toLowerCase();
            var instance = new this.components[componentName]({
                store: defaults({
                    $componentID: this.components[componentName]._id,
                    $instanceKey: index
                })
            });
            this.addComponentEvents(componentName, instance, index);

            instance.on('requestpatch', function (evt) {
                if (_this19.vTree) {
                    _this19._componentsRequestingPatch.push(instance);
                    _this19.trigger('requestpatch', Object.assign({}, evt));
                }
            });

            instance.on('componentleavedom', function (evt) {
                return _this19.trigger('componentleavedom', Object.assign({}, evt));
            });
            instance.on('componententerdom', function (evt) {
                return _this19.trigger('componententerdom', Object.assign({}, evt));
            });

            return instance;
        }
    }, {
        key: 'getComponentInstance',
        value: function getComponentInstance(componentName, index) {
            componentName = componentName.toLowerCase();
            var instances = this._componentInstances[componentName];
            return instances[index];
        }
    }, {
        key: 'getInitComponentInstance',
        value: function getInitComponentInstance(componentName, index) {
            var instance = this.getComponentInstance(componentName, index);
            if (!instance) {
                return (this._componentInstances[componentName][index] = this.makeComponentInstance(componentName, index)).init(this.components[componentName]._initOpts);
            }

            return Promise.resolve(instance);
        }
    }, {
        key: 'cleanupComponentInstances',
        value: function cleanupComponentInstances() {
            //TODO right now, if a component becomes unused, it will continue to sit in memory and possibly generate events. We should probably clean them up.
        }
    }], [{
        key: 'makeComponentClass',
        value: function makeComponentClass(ComponentClass) {
            if (typeof ComponentClass === 'function' && !ComponentClass.prototype) {
                // We got a non-Component class function, so we assume it is a component factory function
                var str = ComponentClass.toString();
                if (str in this.generatedComponentClasses) {
                    return this.generatedComponentClasses[str];
                } else {
                    return this.generatedComponentClasses[str] = this.bootstrapComponentClass(ComponentClass.call(this, this.Weddell.classes.Component));
                }
            } else {
                return this.bootstrapComponentClass(ComponentClass);
            }
        }
    }, {
        key: 'bootstrapComponentClass',
        value: function bootstrapComponentClass(ComponentClass) {
            var WeddellComponent = this.Weddell.classes.Component;
            if (ComponentClass.prototype && (ComponentClass.prototype instanceof WeddellComponent || ComponentClass.prototype.constructor === WeddellComponent)) {
                if (!ComponentClass.id) {
                    var id = generateHash();
                    var BaseClass = ComponentClass;
                    ComponentClass = function (_BaseClass) {
                        _inherits(Component, _BaseClass);

                        function Component() {
                            _classCallCheck(this, Component);

                            return _possibleConstructorReturn(this, (Component.__proto__ || Object.getPrototypeOf(Component)).apply(this, arguments));
                        }

                        _createClass(Component, null, [{
                            key: 'id',
                            get: function get() {
                                return id;
                            }
                        }, {
                            key: 'BaseClass',
                            get: function get() {
                                return BaseClass;
                            }
                        }]);

                        return Component;
                    }(BaseClass);
                }
                return ComponentClass;
            } else {
                //@TODO We may want to support plain objects here as well. Only problem is then we don't get the clean method inheritance and would have to additionally support passing method functions along as options, which is a bit messier.
                throw "Unsupported component input";
            }
        }
    }, {
        key: 'state',
        get: function get() {
            return {};
        }
    }, {
        key: 'tagDirectives',
        get: function get() {
            return {
                content: function content() {
                    return this.content;
                }
            };
        }
    }, {
        key: 'generatedComponentClasses',
        get: function get() {
            return _generatedComponentClasses;
        },
        set: function set(val) {
            return _generatedComponentClasses = val;
        }
    }]);

    return Component;
}(mix(Component).with(EventEmitterMixin));

module.exports = Component;

},{"../utils/make-hash":75,"./event-emitter-mixin":62,"./vdom-widget":64,"mixwith-es5":13,"object.defaults/immutable":15,"virtual-dom/h":26}],62:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Mixin = require('mixwith-es5').Mixin;
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

                eventObj = Object.assign({}, eventObj, { eventName: eventName });
                if (Array.isArray(eventName)) {
                    return eventName.map(function (evtName) {
                        return _this3.trigger(evtName, eventObj, thisArg);
                    });
                } else {
                    var cbs = eventName in this._callbacks ? this._callbacks[eventName] : [];
                    return cbs.map(function (cb) {
                        return cb.call(thisArg || _this3, eventObj);
                    });
                }
            }
        }]);

        return _class;
    }(superClass);
});

module.exports = EventEmitterMixin;

},{"../utils/includes":74,"mixwith-es5":13}],63:[function(require,module,exports){
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
var mix = require('mixwith-es5').mix;
var uniq = require('array-uniq');

var defaultOpts = {
    shouldMonitorChanges: true,
    shouldEvalFunctions: true,
    inputMappings: {},
    validators: {}
};

var Store = function (_mix$with) {
    _inherits(Store, _mix$with);

    function Store(data, opts) {
        _classCallCheck(this, Store);

        opts = defaults(opts, defaultOpts);

        var _this = _possibleConstructorReturn(this, (Store.__proto__ || Object.getPrototypeOf(Store)).call(this));

        Object.defineProperties(_this, {
            _initialCalled: { value: {}, writable: true },
            shouldMonitorChanges: { value: opts.shouldMonitorChanges },
            shouldEvalFunctions: { value: opts.shouldEvalFunctions },
            _data: { configurable: false, value: {} },
            _cache: { value: {}, writable: true },
            _funcProps: { configurable: false, value: {} },
            _funcPropHandlerRemovers: { configurable: false, value: {} },
            _proxyObjs: { configurable: false, value: {} },
            _dependencyKeys: { configurable: false, value: [] },
            _proxyProps: { configurable: false, value: {} },
            _firstGet: { writable: true, value: false },
            _validators: { value: opts.validators },
            overrides: { value: Array.isArray(opts.overrides) ? opts.overrides : opts.overrides ? [opts.overrides] : [] },
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
                    this.trigger('get', evt);
                }
            }.bind(_this));
        });

        Object.keys(_this.inputMappings).forEach(function (key) {
            _this.set(key, null, true);
        });

        _this.proxies.concat(_this.overrides).forEach(function (obj) {
            Object.keys(obj).forEach(function (key) {
                _this.set(key, null, true);
            });

            obj.on('change', function (evt) {
                _this.trigger('change', Object.assign({}, evt));
            });

            obj.on('get', function (evt) {
                _this.trigger('get', Object.assign({}, evt));
            });
        });

        _this.on('change', function (evt) {
            delete _this._cache[evt.changedKey];
        });

        Object.seal(_this);
        return _this;
    }

    _createClass(Store, [{
        key: 'set',
        value: function set(key, val, isReadOnly) {
            if (!(key in this)) {
                if (!isReadOnly) {
                    var setter = function (newValue) {
                        if (this.shouldMonitorChanges) {
                            var oldValue = this._data[key];
                            if (oldValue && (typeof oldValue === 'undefined' ? 'undefined' : _typeof(oldValue)) === "object") {
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
                                    throw 'Required component input missing: ' + key;
                                }
                                if (input.validator && !input.validator(val)) {
                                    throw 'Input failed validation: ' + key + '. Received value: ' + val;
                                }
                            }
                            this._data[key] = newValue;

                            if (this.shouldMonitorChanges) {

                                if (!deepEqual(newValue, oldValue)) {
                                    this.trigger('change', { target: this, changedKey: key, newValue: newValue, oldValue: oldValue });
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
            var _this2 = this;

            var i = 0;
            var val;

            if (this._cache[key]) {
                return this._cache[key];
            }
            if (this.shouldEvalFunctions && !this._firstGet) {
                this._firstGet = true;
                for (var propName in this._funcProps) {
                    this[propName];
                }
            }
            if (key in this._funcProps && !this._initialCalled[key]) {
                this._initialCalled[key] = true;
                val = this[key] = this.evaluateFunctionProperty(key);
                this.on('change', function (evt) {
                    if (includes(_this2._dependencyKeys[key], evt.changedKey)) {
                        _this2[key] = _this2.evaluateFunctionProperty(key);
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
        key: 'await',
        value: function _await(key) {
            var _this4 = this;

            if (Array.isArray(key)) {
                return Promise.all(key.map(function (subKey) {
                    return _this4.await(subKey);
                }));
            }
            return Promise.resolve(this.getValue(key) || new Promise(function (resolve) {
                var off = _this4.watch(key, function (vals) {
                    off();
                    resolve(vals);
                }, true, true);
            }));
        }
    }, {
        key: 'evaluateFunctionProperty',
        value: function evaluateFunctionProperty(key) {
            var dependencyKeys = [];
            var off = this.on('get', function (evt) {
                dependencyKeys.push(evt.key);
            });
            var result = this._funcProps[key].call(this);
            off();
            this._dependencyKeys[key] = uniq(dependencyKeys);
            return result;
        }
    }, {
        key: 'watch',
        value: function watch(key, func, shouldWaitForDefined, invokeImmediately) {
            if (typeof shouldWaitForDefined == 'undefined') shouldWaitForDefined = true;
            if (!Array.isArray(key)) {
                key = [key];
            }
            var checkKeys = function checkKeys() {
                var _this5 = this;

                var vals = key.map(function (currKey) {
                    return _this5[currKey];
                });
                if (!shouldWaitForDefined || vals.every(function (val) {
                    return typeof val !== 'undefined';
                })) {
                    func.apply(this, vals);
                }
            };

            var off = this.on('change', function (evt) {
                if (includes(key, evt.changedKey)) {
                    checkKeys.call(this);
                }
            });
            if (invokeImmediately) {
                checkKeys.call(this);
            }
            return off;
        }
    }]);

    return Store;
}(mix(Store).with(EventEmitterMixin));

module.exports = Store;

},{"../utils/difference":73,"../utils/includes":74,"./event-emitter-mixin":62,"array-uniq":2,"deep-equal":4,"mixwith-es5":13,"object.defaults/immutable":15}],64:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VDOMPatch = require('virtual-dom/patch');
var VDOMDiff = require('virtual-dom/diff');
var h = require('virtual-dom/h');
var createElement = require('virtual-dom/create-element');
var svg = require('virtual-dom/virtual-hyperscript/svg');

module.exports = function () {
    function VDOMWidget(opts) {
        _classCallCheck(this, VDOMWidget);

        this.type = 'Widget';
        this.component = opts.component;
        this.vTree = opts.component.vTree;
    }

    _createClass(VDOMWidget, [{
        key: 'init',
        value: function init() {
            if (!this.vTree) {
                throw "Component has no VTree to init with";
            }
            var el = createElement(this.vTree);
            this.component._el = el;

            this.component.onDOMCreate.call(this.component, { el: el });
            this.component.onDOMCreateOrChange.call(this.component, { el: el });

            return el;
        }
    }, {
        key: 'update',
        value: function update(previousWidget, prevDOMNode) {
            if (Array.isArray(this.vTree)) {
                throw "Cannot render a component with multiple nodes at root!";
            }

            previousWidget.component.trigger('componentleavedom', { component: previousWidget.component });
            this.component.trigger('componententerdom', { component: this.component });

            var patches = VDOMDiff(previousWidget.vTree, this.component.vTree);
            var el = VDOMPatch(prevDOMNode, patches);

            if (previousWidget.component !== this.component) {
                this.component._el = el;
                this.component.onDOMChange.call(this.component, { newEl: el, prevEl: prevDOMNode });
                this.component.onDOMCreateOrChange.call(this.component, { newEl: el, prevEl: prevDOMNode });
            }

            //@TODO onDOMMove?
            if (this.component.vTree == null) {
                debugger;
            }
            this.vTree = this.component.vTree;

            return el;
        }
    }, {
        key: 'destroy',
        value: function destroy(DOMNode) {
            this.component.onDOMDestroy.call(this.component, { el: this.component._el });
            this.component._el = null;
        }
    }], [{
        key: 'cloneVNode',
        value: function cloneVNode(vNode) {
            var newChildren = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            var preserveIfUnchanged = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            return preserveIfUnchanged && !newChildren && !vNode.namespace && false ? vNode : (vNode.namespace ? svg : h)(vNode.tagName, Object.assign({}, vNode.properties, {
                key: vNode.key
            }), newChildren || vNode.children);
        }
    }, {
        key: 'pruneNullNodes',
        value: function pruneNullNodes(vNode) {
            var _this = this;

            if (!vNode) {
                throw "Can't prune null nodes from a null node!";
            }

            if (vNode.type === 'Widget') {
                if (vNode.component.vTree == null) {
                    return null;
                }
            } else if (vNode.children) {
                var children = vNode.children.filter(function (child) {
                    return _this.pruneNullNodes(child);
                });
                if (children.length !== vNode.children.length || children.some(function (child, ii) {
                    return child !== vNode.children[ii];
                })) {
                    return this.cloneVNode(vNode, children);
                }
            }
            return vNode;
        }
    }]);

    return VDOMWidget;
}();

},{"virtual-dom/create-element":24,"virtual-dom/diff":25,"virtual-dom/h":26,"virtual-dom/patch":34,"virtual-dom/virtual-hyperscript/svg":47}],65:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mix = require('mixwith-es5').mix;
var App = require('./app');
var Component = require('./component');
var Store = require('./store');

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
            if (!NewWeddell.loadedPlugins.includes(pluginObj.id)) {
                if (pluginObj.requires && !NewWeddell.loadedPlugins.includes(pluginObj.requires)) {
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

},{"./app":60,"./component":61,"./store":63,"mixwith-es5":13}],66:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Mixin = require('mixwith-es5').Mixin;
var doT = require('dot');
module.exports = function (Weddell, doTOpts) {
    if (doTOpts) {
        dot.templateSettings = doTOpts;
    }
    return Weddell.plugin({
        id: 'dot',
        classes: {
            App: Mixin(function (_App) {
                _App = function (_App2) {
                    _inherits(App, _App2);

                    function App(opts) {
                        _classCallCheck(this, App);

                        var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this, opts));

                        var Transform = _this.constructor.Weddell.classes.Transform;
                        var Sig = _this.constructor.Weddell.classes.Sig;
                        Sig.addTypeAlias('doT', 'HTMLString');
                        _this.markupTransforms.push(new Transform({
                            from: 'doT',
                            to: '(locals:Object)=>HTMLString',
                            func: function func(input) {
                                //TODO Dot allows for compile-time data (static partials, etc) as 3rd arg. Need to figure out where this would be defined and passed in
                                return doT.template(input, null, null);
                            }
                        }));
                        return _this;
                    }

                    return App;
                }(_App);
                return _App;
            })
        }
    });
};

},{"dot":11,"mixwith-es5":13}],67:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Mixin = require('mixwith-es5').Mixin;
var mix = require('mixwith-es5').mix;
var Router = require('./router');
var StateMachineMixin = require('./state-machine-mixin');
var MachineStateMixin = require('./machine-state-mixin');
var defaults = require('defaults-es6/deep-merge');

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

                    _createClass(_class2, [{
                        key: 'onBeforeRoute',
                        value: function onBeforeRoute() {}
                    }]);

                    function _class2(opts) {
                        _classCallCheck(this, _class2);

                        var _this = _possibleConstructorReturn(this, (_class2.__proto__ || Object.getPrototypeOf(_class2)).call(this, opts));

                        _this.router = new Router({
                            routes: opts.routes,
                            onRoute: function (matches, componentNames) {
                                var _this2 = this;

                                var jobs = [];
                                this.el.classList.add('routing');

                                if (matches.isRouteUpdate) {
                                    this.el.classList.add('route-update');
                                }
                                this.trigger('routematched', { matches: matches });
                                return Promise.resolve(this.onBeforeRoute.call(this, { matches: matches, componentNames: componentNames })).then(function () {
                                    _this2.el.classList.add('prerouting-finished');

                                    return componentNames.map(function (componentName) {
                                        return componentName.toLowerCase();
                                    }).reduce(function (promise, componentName) {
                                        return promise.then(function (currentComponent) {
                                            return currentComponent.getInitComponentInstance(componentName, 'router').then(function (component) {
                                                if (!component) return Promise.reject('Failed to resolve ' + componentName + ' while routing.'); // throw "Could not navigate to component " + key;
                                                jobs.push({
                                                    component: component,
                                                    currentComponent: currentComponent,
                                                    componentName: componentName
                                                });
                                                return component;
                                            });
                                        });
                                    }, Promise.resolve(_this2.component)).then(function (lastComponent) {
                                        jobs.push({
                                            currentComponent: lastComponent,
                                            component: null,
                                            componentName: null
                                        });
                                        return jobs.reduce(function (promise, obj) {
                                            return promise.then(function () {
                                                return obj.currentComponent.changeState.call(obj.currentComponent, obj.componentName, { matches: matches });
                                            });
                                        }, Promise.resolve()).then(function (results) {
                                            return _this2.awaitPatch().then(function () {
                                                return results;
                                            });
                                        });
                                    }, console.warn).then(function (results) {
                                        _this2.el.classList.remove('routing');
                                        _this2.el.classList.remove('prerouting-finished');
                                        _this2.el.classList.remove('route-update');
                                        _this2.trigger('route', { matches: matches, results: results });
                                        return results;
                                    });
                                });
                            }.bind(_this),
                            onHashChange: function (hash) {
                                return hash;
                            }.bind(_this)
                        });

                        _this.on('createcomponent', function (evt) {
                            _this.on('routematched', function (routeEvt) {
                                evt.component.state.$currentRoute = routeEvt.matches;
                            });
                            evt.component.router = _this.router;
                            evt.component.state.$currentRoute = _this.router.currentRoute;
                        });
                        return _this;
                    }

                    _createClass(_class2, [{
                        key: 'init',
                        value: function init() {
                            var _this3 = this;

                            return _get(_class2.prototype.__proto__ || Object.getPrototypeOf(_class2.prototype), 'init', this).call(this).then(function () {
                                return _this3.router.init();
                            });
                        }
                    }]);

                    return _class2;
                }(App);
            }),
            Component: Mixin(function (Component) {
                var RouterComponent = function (_mix$with) {
                    _inherits(RouterComponent, _mix$with);

                    _createClass(RouterComponent, null, [{
                        key: 'state',
                        get: function get() {
                            return defaults({
                                $currentRoute: null
                            }, _get(RouterComponent.__proto__ || Object.getPrototypeOf(RouterComponent), 'state', this));
                        }
                    }, {
                        key: 'tagDirectives',
                        get: function get() {
                            return defaults({
                                routerview: function routerview(vNode, content, props) {
                                    return this.compileRouterView(content, props);
                                }
                            }, _get(RouterComponent.__proto__ || Object.getPrototypeOf(RouterComponent), 'tagDirectives', this));
                        }
                    }]);

                    function RouterComponent(opts) {
                        _classCallCheck(this, RouterComponent);

                        opts.stateClass = RouterState;
                        var self;

                        var _this4 = _possibleConstructorReturn(this, (RouterComponent.__proto__ || Object.getPrototypeOf(RouterComponent)).call(this, defaults(opts, {
                            store: {
                                $routerLink: function $routerLink() {
                                    return self.compileRouterLink.apply(self, arguments);
                                }
                            }
                        })));

                        self = _this4;

                        _this4.on('init', function () {
                            Object.entries(_this4.components).forEach(function (entry) {
                                var componentName = entry[0];
                                var routerState = new RouterState([['onEnterState', 'onEnter'], ['onExitState', 'onExit'], ['onUpdateState', 'onUpdate']].reduce(function (finalObj, methods) {
                                    var machineStateMethod = methods[0];
                                    finalObj[machineStateMethod] = function (evt) {
                                        return _this4.getInitComponentInstance(componentName, 'router').then(function (componentInstance) {
                                            return Promise.resolve(componentInstance[methods[1]] ? componentInstance[methods[1]].call(componentInstance, Object.assign({}, evt)) : null);
                                        });
                                    };
                                    return finalObj;
                                }, {
                                    Component: entry[1],
                                    componentName: componentName
                                }));
                                _this4.addState(componentName, routerState);
                            });
                            _this4.on(['enterstate', 'exitstate'], function (evt) {
                                //@TODO this could be optimized to not force a render of the parent
                                _this4.markDirty();
                            });
                        });
                        return _this4;
                    }

                    _createClass(RouterComponent, [{
                        key: 'compileRouterView',
                        value: function compileRouterView(content, props) {
                            var isContent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

                            return this.currentState ? this.makeChildComponentWidget(this.currentState.componentName, 'router', content, props) : null;
                        }
                    }, {
                        key: 'compileRouterLink',
                        value: function compileRouterLink(obj) {
                            var matches = this.router.compileRouterLink(obj);
                            if (matches && (typeof matches === 'undefined' ? 'undefined' : _typeof(matches)) === 'object') {
                                return matches.fullPath;
                            } else if (typeof matches === 'string') {
                                return matches;
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

},{"./machine-state-mixin":68,"./router":69,"./state-machine-mixin":70,"defaults-es6/deep-merge":7,"mixwith-es5":13}],68:[function(require,module,exports){
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
            value: function stateAction(methodName, eventName, evt) {
                var _this2 = this;

                return Promise.resolve(this[methodName] && this[methodName](Object.assign({}, evt))).then(function () {
                    return _this2.trigger(eventName, Object.assign({}, evt));
                });
            }
        }, {
            key: 'exitState',
            value: function exitState(evt) {
                return this.stateAction('onExitState', 'exit', evt);
            }
        }, {
            key: 'enterState',
            value: function enterState(evt) {
                return this.stateAction('onEnterState', 'enter', evt);
            }
        }, {
            key: 'updateState',
            value: function updateState(evt) {
                return this.stateAction('onUpdateState', 'update', evt);
            }
        }]);

        return _class;
    }(mix(superClass).with(DeDupe(EventEmitterMixin)));
});
module.exports = MachineState;

},{"../../core/event-emitter-mixin":62,"mixwith-es5":13}],69:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaults = require('object.defaults/immutable');
var pathToRegexp = require('path-to-regexp');
var findParent = require('find-parent');
var compact = require('array-compact');
var defaultOpts = {};

function matchPattern(pattern, parentMatched, pathName, fullPath, end) {
    var params = [];

    if (pattern.charAt(0) !== '/') {
        if (parentMatched) {
            var regex = pathToRegexp('/' + pattern, params, { end: end });
            var routePathname = pathName;
            var routeFullPath = fullPath;
            var match = regex.exec(routePathname);
        }
    } else {
        regex = pathToRegexp(pattern, params, { end: end });
        routePathname = fullPath;
        routeFullPath = routePathname;
        match = regex.exec(routePathname);
    }

    return { params: params, match: match, fullPath: routeFullPath, pathName: routePathname, regex: regex };
}

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

    _createClass(Router, [{
        key: 'route',
        value: function route(pathName, shouldReplaceState) {
            var _this = this;

            if (typeof pathName === 'string') {
                var hashIndex = pathName.indexOf('#');
                var hash = hashIndex > -1 ? pathName.slice(hashIndex + 1) : '';
                pathName = hashIndex > -1 ? pathName.slice(0, hashIndex) : pathName;
                var matches = this.matchRoute(pathName, this.routes);
            } else if (Array.isArray(pathName)) {
                matches = pathName;
            } else if (pathName) {
                //assuming an object was passed to route by named route.
                var matches = this.compileRouterLink(pathName);
                if (matches) {
                    return this.route(matches.fullPath + (pathName.hash ? '#' + pathName.hash : ''), shouldReplaceState);
                }
            }
            if (matches) {
                var isInitialRoute = !this.currentRoute;
                if (this.currentRoute && matches.fullPath === this.currentRoute.fullPath) {
                    var promise = Promise.resolve(Object.assign(matches, { isCurrentRoute: true })).then(function (matches) {
                        if (hash != matches.isCurrentRoute.hash) {
                            _this.pushState(matches.fullPath, hash);
                        }
                    });
                } else {
                    promise = Promise.all(matches.map(function (currMatch, key) {
                        if (key === matches.length - 1 && currMatch.route.redirect) {
                            if (typeof currMatch.route.redirect === 'function') {
                                var redirectPath = currMatch.route.redirect.call(_this, matches);
                            } else {
                                //assuming string - path
                                redirectPath = currMatch.route.redirect;
                            }
                            if (redirectPath === matches.fullPath) throw "Redirect loop detected: '" + redirectPath + "'";
                            return Promise.reject(redirectPath);
                        }

                        return Promise.resolve(typeof currMatch.route.handler == 'function' ? currMatch.route.handler.call(_this, matches) : currMatch.route.handler);
                    })).then(function (results) {
                        return Promise.resolve(_this.onRoute ? _this.onRoute.call(_this, matches, compact(results)) : null).then(function () {
                            return matches;
                        }).then(function (matches) {
                            if (isInitialRoute || shouldReplaceState) {
                                _this.replaceState(matches.fullPath, hash);
                            } else if (!matches.isCurrentRoute) {
                                _this.pushState(matches.fullPath, hash, matches.isRouteUpdate && matches.route.keepUpdateScrollPos ? null : { x: 0, y: 0 });
                            }
                            return matches;
                        });
                    }, function (redirectPath) {
                        return _this.route(redirectPath, true);
                    });

                    this.currentRoute = matches;
                }
                return promise;
            }
            return null;
        }
    }, {
        key: 'matchRoute',
        value: function matchRoute(pathName, routes, routePath, fullPath, parentMatched) {
            var _this2 = this;

            if (!routePath) routePath = [];
            var result = null;
            if (typeof pathName !== 'string') {
                return null;
            }

            if (typeof fullPath === 'undefined') {
                fullPath = pathName;
            }

            if (fullPath.charAt(0) !== '/' && this.currentRoute) {
                fullPath = this.currentRoute.fullPath + fullPath;
            }

            routes.every(function (currRoute) {
                var params = [];

                var currMatch = matchPattern(currRoute.pattern, parentMatched, pathName, fullPath, false);

                var newPath = routePath.concat({ route: currRoute, match: currMatch.match, params: currMatch.params });

                if (currRoute.children) {
                    result = _this2.matchRoute(currMatch.pathName.replace(currMatch.regex, ''), currRoute.children, newPath, currMatch.fullPath, !!currMatch.match);
                }

                if (!result) {
                    currMatch = matchPattern(currRoute.pattern, parentMatched, pathName, fullPath, true);
                    var matchObj = { route: currRoute, match: currMatch.match, params: currMatch.params };
                    var isValid = true;
                    if (currRoute.validator) {
                        isValid = currRoute.validator.call(currRoute, matchObj);
                    }
                    result = currMatch.match && isValid ? routePath.concat(matchObj) : null;
                }

                if (result) {
                    result.paramVals = result.reduce(function (paramsObj, routeObj) {
                        routeObj.params.forEach(function (param, key) {
                            if (routeObj.match) {
                                paramsObj[param.name] = routeObj.match[key + 1];
                            }
                        });
                        return paramsObj;
                    }, {});

                    result.route = result[result.length - 1].route;
                    result.fullPath = fullPath;
                }

                return !result;
            });

            if (result) {
                result.isRouteUpdate = this.currentRoute && result.route.name === this.currentRoute.route.name;
            }

            return result;
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
            if (typeof obj === 'string') return obj;
            var paramDefaults = {};
            var routeName;

            if (this.currentRoute) {
                routeName = this.currentRoute.route.name;

                paramDefaults = this.currentRoute.reduce(function (params, currRoute) {
                    currRoute.params.forEach(function (param, key) {
                        var val = currRoute.match[key + 1];
                        if (typeof val !== 'undefined') {
                            params[param.name] = val;
                        }
                    });
                    return params;
                }, paramDefaults);
            }

            routeName = obj.name ? obj.name : routeName;
            obj.params = Object.assign(paramDefaults, obj.params);

            var route = Router.getNamedRoute(routeName, this.routes);

            if (route) {
                try {
                    var pattern = route.reduce(function (finalPath, pathRoute) {
                        var segment = pathRoute.pattern;
                        return pathRoute.pattern.charAt(0) === '/' ? segment : finalPath + segment;
                    }, '');

                    var fullPath = pathToRegexp.compile(pattern)(obj.params);
                } catch (err) {
                    throw "Encountered error trying to build router link: " + err.toString();
                }
                var matches = [{
                    fullPath: fullPath,
                    route: route,
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
    }, {
        key: 'init',
        value: function init() {
            var _this3 = this;

            if (!this._isInit && this.routes) {
                if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
                this._isInit = true;

                addEventListener('popstate', this.onPopState.bind(this));
                addEventListener('hashchange', this.onHashChange.bind(this));

                document.body.addEventListener('click', function (evt) {
                    var clickedATag = findParent.byMatcher(evt.target, function (el) {
                        return el.tagName === 'A';
                    });
                    if (clickedATag) {
                        var href = clickedATag.getAttribute('href');
                        if (href) {
                            var result = _this3.route(href);
                            if (result) {
                                evt.preventDefault();
                                _this3.replaceState(location.pathname, location.hash);
                            }
                        }
                    }
                });

                return this.route(location.pathname + location.hash);
            }
            return Promise.resolve();
        }
    }, {
        key: 'pushState',
        value: function pushState(pathName, hash, scrollPos) {
            if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
            if (typeof hash === 'string') {
                location.hash = hash;
            }
            history.pushState({ fullPath: pathName, hash: hash, scrollPos: scrollPos, isWeddellState: true }, document.title, pathName + (hash || ''));

            this.setScrollPos(scrollPos, hash);
        }
    }, {
        key: 'replaceState',
        value: function replaceState(pathName, hash, scrollPos) {
            if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
            var currentScrollPos = { x: window.pageXOffset, y: window.pageYOffset };
            history.replaceState({ fullPath: pathName, hash: hash, scrollPos: currentScrollPos, isWeddellState: true }, document.title, pathName + (hash || ''));

            this.setScrollPos(scrollPos, hash);
        }
    }, {
        key: 'onHashChange',
        value: function onHashChange(evt) {
            if (!history.state) {
                this.replaceState(location.pathname, location.hash, { x: window.pageXOffset, y: window.pageYOffset });
            }
        }
    }, {
        key: 'setScrollPos',
        value: function setScrollPos(scrollPos, hash) {
            if (hash) {
                var el;
                try {
                    el = document.querySelector(hash);
                } catch (err) {}

                if (el) {
                    window.scrollTo(el.offsetLeft, el.offsetTop);
                }
            } else if (scrollPos) {
                window.scrollTo(scrollPos.x, scrollPos.y);
            }
        }
    }, {
        key: 'onPopState',
        value: function onPopState(evt) {
            //@TODO paging forward does not restore scroll position due to lack of available hook to capture it. we may at some point want to capture it in a scroll event.
            var state = history.state;

            if (evt && evt.state && evt.state.isWeddellState === true) {
                var result = this.route(evt.state.fullPath, true);
                if (result && evt.state.scrollPos) {
                    if (result.then) {
                        result.then(function (matches) {
                            window.scrollTo(evt.state.scrollPos.x, evt.state.scrollPos.y);
                        });
                    } else {
                        window.scrollTo(evt.state.scrollPos.x, evt.state.scrollPos.y);
                    }
                }
            }
        }
    }], [{
        key: 'getNamedRoute',
        value: function getNamedRoute(name, routes, currPath) {
            var _this4 = this;

            if (!name) return null;
            if (!currPath) currPath = [];
            var matchedRoute = null;
            routes.every(function (route) {
                matchedRoute = route.name === name ? route : matchedRoute;
                if (!matchedRoute && route.children) {
                    matchedRoute = _this4.getNamedRoute(name, route.children, currPath.concat(route));
                }
                return !matchedRoute;
            });
            if (matchedRoute) {
                matchedRoute = Object.assign({ route: matchedRoute }, matchedRoute);
                matchedRoute = Object.assign(currPath.concat(matchedRoute.route), matchedRoute);
            }
            return matchedRoute || null;
        }
    }]);

    return Router;
}();

module.exports = Router;

},{"array-compact":1,"find-parent":12,"object.defaults/immutable":15,"path-to-regexp":22}],70:[function(require,module,exports){
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
            value: function changeState(state, evt) {
                var _this2 = this;

                state = this.getState(state);

                var promise = Promise.resolve();

                if (state && this.currentState === state) {
                    promise = Promise.resolve(this.currentState.updateState(Object.assign({ updatedState: this.currentState }, evt))).then(function () {
                        _this2.trigger('updatestate', Object.assign({ updatedState: _this2.currentState }, evt));
                        return _this2.onUpdateState ? _this2.onUpdateState(Object.assign({ updatedState: _this2.currentState }, evt)) : null;
                    });
                } else {
                    if (this.currentState) {
                        promise = Promise.resolve(this.currentState.exitState(Object.assign({ exitedState: this.currentState, enteredState: state }, evt))).then(function () {
                            _this2.trigger('exitstate', Object.assign({ exitedState: _this2.currentState, enteredState: state }, evt));
                            _this2.previousState = _this2.currentState;
                            _this2.currentState = null;
                            return _this2.onExitState ? _this2.onExitState(Object.assign({ exitedState: _this2.previousState, enteredState: state }, evt)) : null;
                        });
                    }
                    if (state) {
                        promise = promise.then(function () {
                            return state.enterState(Object.assign({ exitedState: _this2.previousState, enteredState: state }, evt));
                        }).then(function () {
                            _this2.currentState = state;
                            _this2.trigger('enterstate', Object.assign({ exitedState: _this2.previousState, enteredState: _this2.currentState }, evt));
                            return _this2.onEnterState ? _this2.onEnterState(Object.assign({ exitedState: _this2.previousState, enteredState: _this2.currentState }, evt)) : null;
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

},{"../../core/event-emitter-mixin":62,"./machine-state-mixin":68,"mixwith-es5":13}],71:[function(require,module,exports){
'use strict';

require('native-promise-only');
module.exports = require('../plugins/doT')(require('../plugins/router')(require('./weddell')));

},{"../plugins/doT":66,"../plugins/router":67,"./weddell":72,"native-promise-only":14}],72:[function(require,module,exports){
'use strict';

module.exports = require('../core/weddell');

},{"../core/weddell":65}],73:[function(require,module,exports){
"use strict";

module.exports = function (arr1, arr2) {
    return arr1.filter(function (i) {
        return arr2.indexOf(i) < 0;
    });
};

},{}],74:[function(require,module,exports){
"use strict";

module.exports = function (arr, val) {
    return arr.some(function (currKey) {
        return currKey === val;
    });
};

},{}],75:[function(require,module,exports){
"use strict";

module.exports = function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }return text;
};

},{}]},{},[71])(71)
});