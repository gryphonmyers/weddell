var defaults = require('object.defaults/immutable');
var pathToRegexp = require('path-to-regexp');
var findParent = require('find-parent');
var compact = require('array-compact');
var defaultOpts = {};

class Router {

    constructor(opts) {
        opts = defaults(opts, defaultOpts);
        this.currentRoute = null;
        this.routes = [];
        this.onRoute = opts.onRoute;
        this.onHashChange = opts.onHashChange;
        this._isInit = false;
        if (opts.routes) {
            this.addRoutes(opts.routes);
        }
    }

    route(pathName) {
        if (this.currentRoute && (pathName === this.currentRoute.fullPath || pathName.fullPath === this.currentRoute.fullPath)) {
            return Promise.resolve(null);
        }
        if (typeof pathName === 'string') {
            var matches = this.matchRoute(pathName, this.routes);
        } else if (Array.isArray(pathName)) {
            matches = pathName;
        } else if (pathName) {
             //assuming an object was passed to route by named route.
            var matches = this.compileRouterLink(pathName);
        }
        if (matches) {
            if (this.currentRoute && matches.fullPath === this.currentRoute.fullPath) {
                return Promise.resolve(null);
            }
            var promise = Promise.all(matches.map((currMatch, key) => {

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
                return Promise.resolve(this.onRoute ? this.onRoute.call(this, matches, compact(results)) : null)
                    .then(() => matches);
            }, redirectPath => {
                return this.route(redirectPath)
            });

            this.currentRoute = matches;

            return promise;
        }
        return null;
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

    matchRoute(pathName, routes, routePath) {
        if (!routePath) routePath = [];
        var result = null;
        if (typeof pathName !== 'string') {
            return null;
        }
        if (pathName.charAt(0) !== '/' && this.currentRoute) {
            pathName = this.currentRoute.fullPath + pathName;
        }
        routes.every((currRoute) => {
            var params = [];
            var currPattern = currRoute.pattern.charAt(0) === '/' ? currRoute.pattern : routePath.map(pathObj => pathObj.route).concat(currRoute).reduce((finalPattern, pathObj) => {
                return pathObj.pattern.charAt(0) === '/' ? pathObj.pattern : finalPattern + pathObj.pattern;
            }, '');
            var match = pathToRegexp(currPattern, params, {}).exec(pathName);
            var newPath = routePath.concat({route: currRoute, match, params})
            if (match) {
                result = newPath;
            }
            if (currRoute.children) {
                var childResult = this.matchRoute(pathName, currRoute.children, newPath);
                result = childResult || result;
            }
            if (result) {
                var currMatch = result[result.length - 1];
                result.paramVals = currMatch.params.reduce((finalVal, param, key) => {
                    finalVal[param.name] = currMatch.match[key + 1];
                    return finalVal;
                }, {});
                result.route = result[result.length - 1].route;
                result.fullPath = result[result.length - 1].match[0];
            }
            return !result;
        });
        return result;
    }

    addRoutes(routes) {
        this.routes = this.routes.concat(routes);
    }

    compileRouterLink(obj) {
        var paramDefaults = {};
        var routeName;
        if (this.currentRoute) {
            routeName = this.currentRoute.route.name;
            var matchedRoute = this.currentRoute[this.currentRoute.length - 1]
            var matches = matchedRoute.match.slice(1);
            matchedRoute.params.forEach((param, key)=> {
                if (typeof matches[key] !== 'undefined') paramDefaults[param.name] = matches[key];
            });
        }
        routeName = obj.name ? obj.name : routeName;
        obj.params = Object.assign(paramDefaults, obj.params);
        /*
        * Takes an object specifying a router name and params, returns an object with compiled path and matched route
        */
        var route = Router.getNamedRoute(routeName, this.routes);
        if (route) {
            try {
                var fullPath = pathToRegexp.compile(route.reduce((finalPath, pathRoute) => {
                    var segment = pathRoute.pattern;
                    return pathRoute.pattern.charAt(0) === '/' ? segment : finalPath + segment;
                }, ''))(obj.params);
            } catch (err) {
                throw "Encountered error trying to build router link: " + err.toString();
            }
            var matches = [{
                fullPath,
                route,
                match: null
            }];
            matches.route = route;
            matches.fullPath = fullPath;
            return matches;
        } else {
            console.warn('could not find route with name', routeName);
        }
        return null;
    }

    init() {
        if (!this._isInit && this.routes) {
            // if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
            this._isInit = true;

            addEventListener('popstate', this.onPopState.bind(this));
            addEventListener('hashchange', this.hashChange.bind(this));

            document.body.addEventListener('click', (evt) => {
                var clickedATag = findParent.byMatcher(evt.target, el => el.tagName === 'A');
                if (clickedATag) {
                    var href = clickedATag.getAttribute('href');
                    if (href) {
                        var split = href.split('#');
                        var aPath = split[0];
                        var hash = split[1];
                        var result = this.route(aPath);
                        if (result) {
                            evt.preventDefault();
                            result
                                .then(matches => {
                                    if (matches) {
                                        this.pushState(matches.fullPath, hash, {x:0, y:0})
                                    } else if (hash !== location.hash) {
                                        this.pushState(location.pathname, hash);
                                    }
                                });
                        }
                    }
                }
            });
            var result = this.route(location.pathname);
            return result && result.then(matches => {
                    if (matches) {
                        this.replaceState(matches.fullPath, location.hash)
                    }
                })
        }
        return Promise.resolve();
    }

    pushState(pathName, hash, scrollPos) {
        if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
        if (history.state) {
            var currentScrollPos = {x: window.pageXOffset, y: window.pageYOffset};
            //first set our scroll position into previous state so that we can restore it when we navigate back
            history.replaceState(Object.assign({}, history.state, {scrollPos: currentScrollPos}), document.title, location.pathname + location.hash);
        }
        if (typeof hash === 'string') {
            location.hash = hash;
        }
        history.pushState({fullPath: pathName, hash, scrollPos}, document.title, pathName + (hash  || ''));

        this.setScrollPos(scrollPos, hash);
    }

    replaceState(pathName, hash, scrollPos) {
        if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
        var currentScrollPos = {x: window.pageXOffset, y: window.pageYOffset};
        history.replaceState({fullPath: pathName, hash, scrollPos: currentScrollPos}, document.title, pathName + (hash  || ''));

        this.setScrollPos(scrollPos, hash);
    }

    hashChange(evt) {
        if (!history.state) {
            this.replaceState(location.pathname, location.hash, {x: window.pageXOffset, y: window.pageYOffset});
        }
    }

    setScrollPos(scrollPos, hash) {
        if (hash) {
            var el = document.querySelector(hash);
            if (el) {
                window.scrollTo(el.offsetLeft, el.offsetTop);
            }
        } else if (scrollPos) {
            window.scrollTo(scrollPos.x, scrollPos.y);
        }

    }

    onPopState(evt) {
        var state = history.state;

        if (evt && evt.state) {
            var result = this.route(evt.state.fullPath);
            if (result) {
                if (result.then) {
                    result
                        .then(matches => window.scrollTo(evt.state.scrollPos.x, evt.state.scrollPos.y))
                } else {
                     window.scrollTo(evt.state.scrollPos.x, evt.state.scrollPos.y);
                }
            }
        }
    }
}
module.exports = Router;
