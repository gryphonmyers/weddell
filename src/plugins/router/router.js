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
    //TODO allow for absolute routes prefixed with /

    route(pathName) {
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
            promise = Promise.all(matches.map((currMatch, key) => {
                if (key === matches.length - 1 && currMatch.route.redirect) {
                    if (typeof currMatch.route.redirect === 'function') {
                        this.route(currMatch.route.redirect.call(this, matches));
                    } else {
                        //assuming string - path
                        this.route(currMatch.route.redirect);
                    }
                    return Promise.reject();
                }

                if (typeof currMatch.route.handler == 'function') {
                    return Promise.resolve(currMatch.route.handler.call(this, matches));
                } else {
                    return currMatch.route.handler;
                }
            }))
            .then(results => compact(results))
            .then(this.onRoute.bind(this, matches), ()=>{})
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

    static getNamedRoute(name, routes) {
        if (!name) return null;

        return (function findRoute(routes, path) {
            var matchedRoute = null;

            routes.forEach(route => {
                matchedRoute = route.name === name ? route : matchedRoute;

                if (!matchedRoute && route.children) {
                    matchedRoute = findRoute(route.children, path.concat(route));
                }

                return !matchedRoute;
            });

            return matchedRoute ? Object.assign(path.concat(matchedRoute), matchedRoute) : null;
        })(routes, []);
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

    addRoutes(routes) {
        this.routes = this.routes.concat(routes);
    }

    compileRouterLink(obj) {

        /*
        * Takes an object specifying a router name and params, returns an object with compiled path and matched route
        */

        var route = Router.getNamedRoute(obj.name, this.routes);
        if (route) {
            var fullPath = route.map(route => pathToRegexp.compile(route.pattern)(obj.params)).join('/');
            var matches = [{
                fullPath,
                route,
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

    init() {
        if (!this._isInit && this.routes) {
            this._isInit = true;
            addEventListener('popstate', this.onPopState.bind(this));

            document.body.addEventListener('click', (evt) => {
                var clickedATag = findParent.byMatcher(evt.target, el => el.tagName === 'A');
                if (clickedATag) {
                    var href = Router.matchRoute(clickedATag.getAttribute('href'), this.routes);
                    if (href) {
                        evt.preventDefault();
                        this.route(href);
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
