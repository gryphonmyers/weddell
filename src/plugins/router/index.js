var Mixin = require('@weddell/mixwith').Mixin;
var mix = require('@weddell/mixwith').mix;
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
// $currentRoute: null,
//                             $currentRouteName: null,
//                             $pathParams: null

/**
 * @typedef {object} RouterComponentState
 * @property {} $currentRouteName
 * @property {} $pathParams Key-value pairs of all path params matched
 */
/**
 * @typedef {(String|undefined)[]} PathToRegExpMatch The result from the match as performed by path-to-regexp. Array items will be undefined if no value is specified for optional path params.
 */
/**
 * @typedef {object} PathToRegExpParams The available path params (not their values) as parsed from a route pattern by path-to-regexp.
 */
/**
 * @typedef {String} PathToRegExpPath Path string as accepted by path-to-regexp.
 */
/**
 * @typedef {object} RouterMatch
 * @property {PathToRegExpParams[]} params Params that were
 * @property {PathToRegExpMatch} match The result returned by path-to-regexp after matching the current location against the component tree.
 * @property {RouteObject} route The matched route
 */

/**
 * @typedef {object} RouteObject 
 * 
 * @property {RoutingHandler} handler
 * @property {PathToRegExpPath} pattern Note that a partial match will be performed on this path, separate from its children. 
 * @property {RouteObject[]} children Subroutes that will be available for continued matching once this route matches.
 * @property {Function} validator Function used to validate the 
 * @property {String} [name] Name of this route object. Required for direct routing via link generation.
 */

/**
 * Event object that is passed to a routing handler callback.
 * 
 * @typedef {RouterMatch[]} RoutingEvent An event object is passed to routing handlers after a successful match. Each item in the array corresponds to a tier in the route tree.
 * @property {String} fullPath The full path that was matched to this route. 
 * @property {String} hash Location hash at the time the route was matched.
 * @property {Boolean} isRouteUpdate Whether or not this route matched to the same component at this point in the routing tree.
 * @property {object} paramVals Key-pairs of all path params from route match.
 * @property {RouteObject} route The route object that was matched.
 * 
 */

/**
 * Callback that executes when a route is matched in the route tree. 
 * 
 * @callback RoutingHandler
 * @param {RoutingEvent} evt
 * @returns {Promise|String} The component key to select in the component tree. Every node in the component tree should correspond to a node in the routing tree. A returned Promise will defer route matching. If the Promise is rejected, the route matching process will be restarted with the rejected value (a redirect).
 * @example 
 * var myApp = new Weddell.App({
 *  routes: [
 *      {
 *          pattern: '/foo',
 *          handler: evt => 'my-component-a',
 *          children: [
 *              {
 *                  pattern: ':myParam/'
 *                  handler: evt => 'my-subcomponent'
 *              }
 *          ]
 *      }
 *  ],
 *  Component: class extends Weddell.Component {
 *      static get components() {
 *          return {
 *              'my-component-a': class extends Weddell.Component {
 *                  static get components() {
 *                      return {
 *                          'my-subcomponent': MySubComponent
 *                      }
 *                  }
 *              }
 *          }
 *      }
 *  }
 * })
 * 
 * // If a route is performed against the path 'foo/bar', 'my-component-a' will be mounted into the root component's routerview, and 'my-subcomponent' will be routed into that component's routerview.  
 */
/**
 * Event fired whenever the location path is matched against the component tree, but before component tree transitions are fired.
 * 
 * @event App#routematched 
 * @type {object}
 * @property {RouterMatch[]} matches
 */

/**
* Event fired whenever the location path is matched against the component tree, after all component tree transitions have finished firing.
* 
* @event App#route 
* @type {object}
* @property {RouterMatch[]} matches
* @property {*} results If any data was returned by the transition events fired over the course of routing, it will be available here. Usually this is null.
*/

/**
* Weddell decorator function.
* 
* @param {Weddell} _Weddell The Weddell class to augment.
* @returns {Weddell} The passed Weddell class, augmented with routing functionality.
*/

module.exports = function (_Weddell) {
    return _Weddell.plugin({
        id: 'router',
        classes: {
            App: Mixin(function (App) {

                /**
                 * A decorated Weddell class will generate an App class with routing functionality.
                 * 
                 * @extends App
                 */

                return class extends App {

                    /**
                     * App routing hook. Fires after a location match has been made against the routed path, but before the routing event has started.
                     * 
                     * @returns {Promise} Routing may be deferred by returning a Promise in this method.
                     */

                    onBeforeRoute() { }

                    /**
                     * Augments the App constructor with new parameters and events.
                     * 
                     * @param {object} opts
                     * @param {RouteObject[]} opts.routes Specifies routes that will be available to this app, matching location.path against the component tree.
                     * 
                     */

                    constructor(opts) {
                        super(opts);

                        this.router = new Router({
                            routes: opts.routes,

                            /**
                             * Router object callback that maps the routing result to the Weddell app and its configured routes. 
                             * 
                             * @private
                             * @fires App#routematched
                             * @fires App#route
                             * @returns {Promise}
                             */
                            onRoute: function (matches, componentNames) {
                                var jobs = [];
                                this.el.classList.add('routing');

                                this.el.setAttribute('data-current-route', matches.route.name);
                                if (matches.isRouteUpdate) {
                                    this.el.classList.add('route-update');
                                    if (matches.keepUpdateScrollPos) {
                                        this.el.classList.add('keep-scroll-pos');
                                    }
                                }

                                this.trigger('routematched', { matches });
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
                                                        .then(() => obj.currentComponent.changeState.call(obj.currentComponent, obj.componentName, { matches }))
                                                }, Promise.resolve())
                                                    .then(results =>
                                                        this.queuePatch()
                                                            .then(() => results));
                                            }, console.warn)
                                            .then(results => {
                                                this.el.classList.remove('routing');
                                                this.el.classList.remove('prerouting-finished');
                                                this.el.classList.remove('route-update');
                                                this.el.classList.remove('keep-scroll-pos');
                                                this.trigger('route', { matches, results });
                                                return results;
                                            })
                                    })
                            }.bind(this),
                            onHashChange: function (hash) {
                                return hash;
                            }.bind(this)
                        });

                        this.on('createcomponent', evt => {
                            this.on('routematched', routeEvt => {
                                evt.component.state.$currentRoute = Object.assign({}, routeEvt.matches);
                                evt.component.state.$pathParams = routeEvt.matches.paramVals;
                                evt.component.state.$currentRouteName = routeEvt.matches.route.name;
                            });
                            evt.component.router = this.router;

                            if (this.router.currentRoute) {
                                evt.component.state.$currentRoute = Object.assign({}, this.router.currentRoute);
                                evt.component.state.$currentRouteName = this.router.currentRoute && this.router.currentRoute.route.name;
                                evt.component.state.$pathParams = this.router.currentRoute.paramVals;
                            }
                        });
                    }

                    /**
                     * Augments root component initialization to also initialize the app's router.
                     * 
                     * @param {object} initObj 
                     * @property {String} [initObj.initialPath] Path to match at initialization. Defaults to location.pathname
                     */

                    initRootComponent(initObj) {
                        return super.initRootComponent(initObj)
                            .then(() => this.router.init(initObj.initialPath))
                    }
                }
            }),
            Component: Mixin(function (Component) {
                var RouterComponent = class extends mix(Component).with(StateMachineMixin) {
                    /**
                     * Component routing hook. Fires during the routing process, when a component in the component tree has been matched to a route in the route tree. 
                     * 
                     * If the matched route is not the current route, the current routed component is exited.
                     * 
                     * @param {RoutingEvent}
                     * @returns {Promise} Routing may be deferred by overriding this method with one that returns a Promise.
                     */
                    onExit() { }
                    /**
                     * Component routing hook. Fires during the routing process, after a component in the component tree has been matched to a route in the route tree. 
                     * 
                     * After the current component is exited, the newly matched component is entered.
                     * 
                     * @param {RoutingEvent}
                     * @returns {Promise} Routing may be deferred by returning a Promise in this method.
                     */
                    onEnter() { }

                    /**
                     * Component routing hook. Fires during the routing process, after a component in the component tree has been matched to a route in the route tree. 
                     * 
                     * If the matched route is the currently matched route, the component will be updated instead of being exited or entered.
                     * 
                     * @param {RoutingEvent}
                     * @returns {Promise} Routing may be deferred by returning a Promise in this method.
                     */
                    onUpdate() { }

                    /**
                     * Component routing hook. Fires during the routing process, after a component in the component tree has been matched to a route in the route tree. 
                     * 
                     * Whether the component is updated or entered, this hook will fire in addition to the respective primary hook.
                     * 
                     * @param {RoutingEvent}
                     * @returns {Promise} Routing may be deferred by returning a Promise in this method.
                     */
                    onEnterOrUpdate() { }

                    /**
                     * Augments component state with routing data.
                     * 
                     * @static 
                     * @returns {RouterComponentState} State object with routing information assigned to it. Be sure to call super when overriding this function!
                     * 
                     */

                    static get state() {
                        return defaults({
                            $currentRoute: null,
                            $currentRouteName: null,
                            $pathParams: null
                        }, super.state);
                    }

                    static get tagDirectives() {
                        return defaults({
                            routerview: function (vNode, content, props, renderedComponents) {
                                return this.currentState ? this.makeChildComponentWidget(this.currentState.componentName, 'router', content, props, renderedComponents) : null;
                            }
                        }, super.tagDirectives)
                    }

                    constructor(opts) {
                        opts.stateClass = RouterState;
                        var self;
                        super(defaults(opts, {
                            store: {
                                $routerLink: function () {
                                    return self.compileRouterLink.apply(self, arguments);
                                }
                            }
                        }));

                        Object.defineProperties(this, {
                            _initialRouterStateName: { value: opts.initialRouterStateName, writable: false }
                        })

                        self = this;

                        this.on('init', () => {
                            Object.entries(this.components)
                                .forEach(entry => {
                                    var componentName = entry[0]
                                    var routerState = new RouterState([['onEnterState', ['onEnter', 'onEnterOrUpdate']], ['onExitState', 'onExit'], ['onUpdateState', ['onUpdate', 'onEnterOrUpdate']]].reduce((finalObj, methods) => {
                                        var machineStateMethod = methods[0];
                                        finalObj[machineStateMethod] = (evt) => {
                                            return this.getInitComponentInstance(componentName, 'router')
                                                .then(componentInstance => {
                                                    var methodNames = methods[1];
                                                    if (!Array.isArray(methodNames)) {
                                                        methodNames = [methodNames]
                                                    }
                                                    return Promise.all(methodNames.map(methodName =>
                                                        componentInstance[methodName].call(componentInstance, Object.assign({}, evt))
                                                    )
                                                    )
                                                        .then(() => componentInstance)
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
                            return matches.fullPath + (matches.hash ? '#' + matches.hash : '');
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
