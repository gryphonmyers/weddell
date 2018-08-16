var defaults = require('object.defaults/immutable');
var pathToRegexp = require('path-to-regexp');
var findParent = require('find-parent');
var compact = require('array-compact');
var defaultOpts = {};

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

class Router {

    constructor(opts) {
        opts = defaults(opts, defaultOpts);
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
            var hashIndex = pathName.indexOf('#');
            var hash = hashIndex > -1 ? pathName.slice(hashIndex + 1) : '';
            pathName = hashIndex > -1 ? pathName.slice(0, hashIndex) : pathName;
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
            Object.assign(matches, {hash, triggeringEvent});
            var isInitialRoute = !this.currentRoute;
            
            if (this.currentRoute && matches.fullPath === this.currentRoute.fullPath) {
                var promise = Promise.resolve(Object.assign(matches, {isCurrentRoute: true}))
                    .then(matches => {
                        if (hash != matches.isCurrentRoute.hash) {
                            return this.pushState(matches.fullPath, hash);
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
                        return Promise.resolve(this.onRoute ? this.onRoute.call(this, matches, compact(results)) : null)
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
                        var result = this.route(href, evt);
                        if (result) {
                            evt.preventDefault();
                            this.replaceState(location.pathname, location.hash);
                        }
                    }
                }
            });

            return this.route(location.pathname + location.hash);
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
            var pushState = () => {
                if (!history.state) {
                    this.replaceState(location.pathname, location.hash, {x: window.pageXOffset, y: window.pageYOffset});
                }
                
                window.removeEventListener('hashchange', pushState);
                
                history.pushState({fullPath: pathName, hash, scrollPos, isWeddellState: true}, document.title, location.origin + pathName + location.search + (hash  || ''));
                this.setScrollPos(scrollPos, hash);
                resolve();
            }
            if (location.hash === hash) {
                pushState()
            } else {
                window.addEventListener('hashchange', pushState);
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
            var result = this.route(evt.state.fullPath, true, evt);
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
