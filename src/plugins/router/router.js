var defaults = require('defaults-es6');
var pathToRegexp = require('path-to-regexp');
var findParent = require('find-parent');
var defaultOpts = {};
const { mix } = require('@weddell/mixwith');
var EventEmitterMixin = require('@weddell/event-emitter-mixin');

function matchPattern(pattern, parentMatched, pathName, fullPath, end) {
    var params = [];

    if (pattern.charAt(0) !== '/') {
        if (parentMatched) {
            var regex = pathToRegexp('/' + pattern, params, { end });
            var routePathname = pathName;
            var routeFullPath = fullPath;
            var match = regex.exec(routePathname);
        }
    } else {
        regex = pathToRegexp(pattern, params, { end });
        routePathname = fullPath;
        routeFullPath = routePathname;
        match = regex.exec(routePathname);
    }

    return { params, match, fullPath: routeFullPath, pathName: routePathname, regex };
}

class BaseRouter { }

class Router extends mix(BaseRouter).with(EventEmitterMixin) {

    constructor(opts) {
        opts = defaults(opts, defaultOpts);
        super(opts);
        this.currentRoute = null;
        this.routes = [];
        this.queue = [];
        this.promise = null;
        this.onRoute = opts.onRoute;
        this._isInit = false;
        if (opts.routes) {
            this.addRoutes(opts.routes);
        }
    }

    awaitFirstRoute() {
        return this.currentRoute ? Promise.resolve() : new Promise(resolve => this.once('route', resolve))
    }

    performRoute(pathName, shouldReplaceState, triggeringEvent) {
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
            if (!pathName.name && !this.currentRoute) {
                throw new Error(`Unable to route to unnamed object route because no routing event has occurred yet. Try awaiting router.awaitFirstRoute() before caling router.route.`);
            }
            matches = this.compileRouterLink(pathName);
            if (matches) {
                return this.performRoute(matches.fullPath + (pathName.hash ? '#' + pathName.hash : ''), shouldReplaceState, triggeringEvent);
            }
        }

        if (matches) {
            var hash = matches.hash;
            Object.assign(matches, { triggeringEvent });
            var isInitialRoute = !this.currentRoute;

            if (this.currentRoute && matches.fullPath === this.currentRoute.fullPath && this.currentRoute.hash === matches.hash) {
                var promise = Promise.resolve(Object.assign(matches, { isCurrentRoute: true }))
                    .then(matches => {
                        if (shouldReplaceState) {
                            return this.replaceState(matches.fullPath, hash);
                        } else {
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
                        return Promise.resolve(this.onRoute ? this.onRoute.call(this, matches, results.filter(val => val)) : null)
                            .then(() => matches)
                            .then(matches => {
                                if (isInitialRoute || shouldReplaceState) {
                                    this.replaceState(matches.fullPath, hash, matches.isRouteUpdate && matches.keepUpdateScrollPos ? null : { x: 0, y: 0 });
                                } else if (!matches.isCurrentRoute) {
                                    return this.pushState(matches.fullPath, hash, matches.isRouteUpdate && matches.keepUpdateScrollPos ? null : { x: 0, y: 0 })
                                        .then(() => matches);
                                }
                                return matches;
                            });
                    }, redirectPath => {
                        return this.performRoute(redirectPath, true, triggeringEvent)
                    });
                this.currentRoute = matches;
            }
        }
        
        return promise;
    }

    route(pathName, shouldReplaceState = false, triggeringEvent = null) {
        var routeArgs = [pathName, shouldReplaceState, triggeringEvent];
        if (this.promise) {
            this.queue.push(routeArgs)
            return this.promise;
        } else {
            var consumeRouteQueue = (routeArgs) => {
                var promise = this.performRoute(...routeArgs);
                if (!promise) {
                    return null;
                }
                return promise
                    .then(result => {
                        if (this.queue.length) {
                            return consumeRouteQueue(this.queue.splice(0,1)[0]);
                        } else {
                            this.promise = null;
                            this.trigger('route');
                            return result;
                        }
                    });
            }
            return this.promise = consumeRouteQueue(routeArgs)
        }
        return null;
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
            matchedRoute = Object.assign({ route: matchedRoute }, matchedRoute);
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

            var newPath = routePath.concat({ route: currRoute, match: currMatch.match, params: currMatch.params });

            if (currRoute.children) {
                result = this.matchRoute(currMatch.pathName.replace(currMatch.regex, ''), currRoute.children, newPath, currMatch.fullPath, !!currMatch.match);
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
                (result.route.keepUpdateScrollPos.call(this, { newRoute: result, prevRoute: this.currentRoute })) :
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
        var hash = obj.hash;

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
            matches.hash = hash;
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
                    if (href && href.slice(0, 11) !== 'javascript:') {

                        var result =  this.matchRoute(href, this.routes) && this.route(href, evt);
                        if (result) {
                            evt.preventDefault();
                            this.replaceState(location.pathname, location.hash, { x: window.pageXOffset, y: window.pageYOffset });
                        }
                    }
                }
            });
            return this.route(initPath || (location.pathname + location.hash));
        }
        return Promise.resolve();
    }

    pushState(pathName, hash, scrollPos={ x: window.pageXOffset, y: window.pageYOffset }) {
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
                    history.replaceState({ fullPath: pathName, hash, scrollPos, isWeddellState: true }, document.title, location.origin + pathName + location.search + (hash || ''));
                    this.setScrollPos(scrollPos, hash);
                } else {
                    history.pushState({ fullPath: pathName, hash, scrollPos, isWeddellState: true }, document.title, location.origin + pathName + location.search + (hash || ''));
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

        if (!history.state || !history.state.isWeddellState || history.state.fullPath !== pathName || history.state.hash !== hash || (scrollPos && (history.state.x !== scrollPos.x || history.state.y !== scrollPos.y))) {
            history.replaceState({ fullPath: pathName, hash, scrollPos: scrollPos || (history.state && history.state.scrollPos) || { x: window.pageXOffset, y: window.pageYOffset }, isWeddellState: true }, document.title, location.origin + pathName + location.search + (hash || ''));
        }

        this.setScrollPos(scrollPos, hash);
    }

    onHashChange(evt) {
        if (!history.state) {
            this.replaceState(location.pathname, location.hash, { x: window.pageXOffset, y: window.pageYOffset });
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
                var rect = el.getBoundingClientRect();
                window.scrollTo(rect.left + window.pageXOffset, rect.top + window.pageYOffset);
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
