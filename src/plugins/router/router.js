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
