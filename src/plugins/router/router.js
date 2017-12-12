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
        this._isInit = false;
        if (opts.routes) {
            this.addRoutes(opts.routes);
        }
    }

    route(pathName) {
        if (this.currentRoute && (pathName === this.currentRoute.fullPath || pathName.fullPath === this.currentRoute.fullPath)) {
            return Promise.resolve(Object.assign([].concat(this.currentRoute), {isCurrentRoute: true}, this.currentRoute));
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
                return Promise.resolve(Object.assign(matches, {isCurrentRoute: true}));
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

    matchRoute(pathName, routes, routePath, fullPath, parentMatched) {
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
        routes.every((currRoute) => {
            var params = [];

            if (currRoute.pattern.charAt(0) !== '/') {
                if (parentMatched) {
                    var regex = pathToRegexp('/' + currRoute.pattern, params, {end: false});
                    var routePathname = pathName;
                    var routeFullPath = fullPath;
                    var match = regex.exec(routePathname);
                }

            } else {
                regex = pathToRegexp(currRoute.pattern, params, {end: false});
                routePathname = fullPath;
                routeFullPath = routePathname;
                match = regex.exec(routePathname);
            }

            var newPath = routePath.concat({route: currRoute, match, params});
            if (match) {
                result = newPath;
            }
            if (currRoute.children) {
                var childResult = this.matchRoute(routePathname.replace(regex, ''), currRoute.children, newPath, routeFullPath, !!match);
                result = childResult || result;
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
            }
            return !result;
        });

        return result;
    }

    addRoutes(routes) {
        this.routes = this.routes.concat(routes);
    }

    compileRouterLink(obj) {
         /*
        * Takes an object specifying a router name and params, returns an object with compiled path and matched route
        */
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
            matches.fullPath = fullPath;
            return matches;
        } else {
            console.warn('could not find route with name', routeName);
        }
        return null;
    }

    init() {
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
                        var split = href.split('#');
                        var aPath = split[0];
                        var hash = split[1];

                        var result = this.route(aPath);
                        if (result) {
                            evt.preventDefault();
                            this.replaceState(location.pathname, location.hash)
                            result
                                .then(matches => {
                                    if (!matches.isCurrentRoute) {
                                        this.pushState(matches.fullPath, hash, {x:0,y:0});
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

    onHashChange(evt) {
        if (!history.state) {
            this.replaceState(location.pathname, location.hash, {x: window.pageXOffset, y: window.pageYOffset});
        }
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

        if (evt && evt.state && typeof evt.state.fullPath === 'string') {
            var result = this.route(evt.state.fullPath);
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
