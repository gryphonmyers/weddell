var Mixin = require('mixwith-es5').Mixin;
var mix = require('mixwith-es5').mix;
var Router = require('./router');
var StateMachineMixin = require('./state-machine-mixin');
var MachineStateMixin = require('./machine-state-mixin');

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
                    constructor(opts) {
                        super(opts);

                        this.router = new Router({
                            routes: opts.routes,
                            onRoute: function(matches, componentNames) {
                                var jobs = [];

                                return componentNames.reduce((promise, componentName) => {
                                        return promise
                                            .then(currentComponent => {
                                                return currentComponent.getComponentInstance(componentName, 'router')
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
                                        return Promise.all(jobs.map(obj => obj.currentComponent.changeState.call(obj.currentComponent, obj.componentName, {matches})));
                                    }, console.warn);

                            }.bind(this)
                        });

                        this.on('createcomponent', evt => {
                            evt.component.router = this.router;
                        });
                    }

                    init() {
                        return super.init()
                            .then(() => {
                                return this.router.init();
                            });
                    }
                }
            }),
            Component: Mixin(function(Component){
                var RouterComponent = class extends mix(Component).with(StateMachineMixin) {
                    constructor(opts) {
                        opts.stateClass = RouterState;
                        super(opts);

                        this.addTagDirective('RouterView', this.compileRouterView.bind(this));

                        var routerLocals = {
                            $routerLink: this.compileRouterLink.bind(this)
                        };
                        this.store.assign(routerLocals);
                        this._locals.assign(routerLocals);

                        this.on('init', () => {
                            Object.entries(this.components)
                                .forEach(entry => {
                                    var routerState = new RouterState([['onEnterState', 'onEnter'], ['onExitState', 'onExit'], ['onUpdateState', 'onUpdate']].reduce((finalObj, methods) => {
                                        finalObj[methods[0]] = evt => this.getComponentInstance(entry[0]).then(componentInstance => Promise.resolve(componentInstance[methods[1]] ? componentInstance[methods[1]].call(componentInstance, Object.assign({}, evt)) : null));
                                        return finalObj;
                                    }, {
                                        Component: entry[1],
                                        componentName: entry[0]
                                    }));
                                    this.addState(entry[0], routerState);
                                    routerState.on(['exit', 'enter'], evt => {
                                        this.markDirty();
                                    });
                                });
                        })
                    }

                    compileRouterView(content, props) {
                        if (this.currentState) {
                            return this.getComponentInstance(this.currentState.componentName, 'router')
                                .then(component => component.render('markup', content, props))
                                .then(routerOutput => {
                                    return Array.isArray(routerOutput.output) ? routerOutput.output[0] : routerOutput.output;
                                });
                        }
                        return Promise.resolve(null);
                    }

                    compileRouterLink(obj) {
                        var matches = this.router.compileRouterLink(obj);
                        if (matches) {
                            return matches.fullPath;
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
