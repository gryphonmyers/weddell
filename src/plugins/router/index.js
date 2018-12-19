var Mixin = require('mixwith-es5').Mixin;
var mix = require('mixwith-es5').mix;
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

module.exports = function(_Weddell){
    return _Weddell.plugin({
        id: 'router',
        classes:  {
            App: Mixin(function(App){
                return class extends App {

                    onBeforeRoute() {}

                    constructor(opts) {
                        super(opts);

                        this.router = new Router({
                            routes: opts.routes,
                            onRoute: function(matches, componentNames) {
                                var jobs = [];
                                this.el.classList.add('routing');
                                
                                this.el.setAttribute('data-current-route', matches.route.name);
                                if (matches.isRouteUpdate) {
                                    this.el.classList.add('route-update');
                                    if (matches.keepUpdateScrollPos) {
                                        this.el.classList.add('keep-scroll-pos');
                                    }
                                }
                                this.trigger('routematched', {matches});
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
                                                            .then(() => obj.currentComponent.changeState.call(obj.currentComponent, obj.componentName, {matches}))
                                                    }, Promise.resolve())
                                                    .then(results =>
                                                        this.awaitPatch()
                                                            .then(() => results));
                                            }, console.warn)
                                            .then(results => {
                                                this.el.classList.remove('routing');
                                                this.el.classList.remove('prerouting-finished');
                                                this.el.classList.remove('route-update');
                                                this.el.classList.remove('keep-scroll-pos');
                                                this.trigger('route', {matches, results});
                                                return results;
                                            })
                                    })
                            }.bind(this),
                            onHashChange: function(hash) {
                                return hash;
                            }.bind(this)
                        });

                        this.on('createcomponent', evt => {
                            this.on('routematched', routeEvt => {
                                evt.component.state.$currentRoute = routeEvt.matches;
                            });
                            evt.component.router = this.router;
                            evt.component.state.$currentRoute = this.router.currentRoute;
                        });
                    }

                    initRootComponent(initObj={}) {
                        return super.initRootComponent()
                            .then(() => this.router.init(initObj.initialRoute))
                    }
                }
            }),
            Component: Mixin(function(Component){
                var RouterComponent = class extends mix(Component).with(StateMachineMixin) {

                    onEnter() {}
                    onExit() {}
                    onUpdate() {}

                    static get state() {
                        return defaults({
                            $currentRoute: null
                        }, super.state);
                    }

                    static get tagDirectives() {
                        return defaults({
                            routerview: function(vNode, content, props, renderedComponents){
                                return this.currentState ? this.makeChildComponentWidget(this.currentState.componentName, 'router', content, props, renderedComponents) : null;
                            } 
                        }, super.tagDirectives)
                    }

                    constructor(opts) {
                        opts.stateClass = RouterState;
                        var self;
                        super(defaults(opts, {
                            store: {
                                $routerLink: function(){
                                    return self.compileRouterLink.apply(self, arguments);
                                }
                            }
                        }));

                        Object.defineProperties(this, {
                            _initialRouterStateName: { value: opts.initialRouterStateName, writable: false} 
                        })

                        self = this;

                        this.on('init', () => {
                            Object.entries(this.components)
                                .forEach(entry => {
                                    var componentName = entry[0]
                                    var routerState = new RouterState([['onEnterState', 'onEnter'], ['onExitState', 'onExit'], ['onUpdateState', 'onUpdate']].reduce((finalObj, methods) => {
                                        var machineStateMethod = methods[0];
                                        finalObj[machineStateMethod] = (evt) => {
                                            return this.getInitComponentInstance(componentName, 'router')
                                                .then(componentInstance => {
                                                    return Promise.resolve(componentInstance[methods[1]].call(componentInstance, Object.assign({}, evt)))
                                                        .then(() => componentInstance);
                                                })
                                                .then(componentInstance => {
                                                    switch (machineStateMethod) {
                                                        case 'onEnter':
                                                        case 'onExit':
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
                            return matches.fullPath;
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
