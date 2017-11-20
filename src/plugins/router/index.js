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
                                this.el.classList.add('routing');
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
                                        return jobs.reduce((promise, obj) => {
                                            return promise
                                                .then(() => obj.currentComponent.changeState.call(obj.currentComponent, obj.componentName, {matches}))
                                        }, Promise.resolve());
                                    }, console.warn)
                                    .then(result => {
                                        this.el.classList.remove('routing');
                                        return this.component.awaitRender(result);
                                    });
                            }.bind(this),
                            onHashChange: function(hash) {
                                return hash;
                            }.bind(this)
                        });

                        this.on('createcomponent', evt => {
                            evt.component.router = this.router;
                        });
                    }

                    initRenderLifecycleStyleHooks(rootComponent) {
                        var off = rootComponent.on('renderdomstyles', evt => {
                            if (evt.component.currentState) {
                                this.el.classList.add('first-styles-render-complete');
                                if (this.el.classList.contains('first-markup-render-complete')) {
                                    this.el.classList.add('first-render-complete');
                                }
                                off();
                            }
                        });
                
                       var off2 = rootComponent.on('renderdommarkup', evt => {
                            this.el.classList.add('first-markup-render-complete');
                            if (evt.component.currentState) {
                                if (this.el.classList.contains('first-styles-render-complete')) {
                                    this.el.classList.add('first-render-complete');
                                    off2();
                                }
                            }
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
                                    var componentName = entry[0]
                                    var routerState = new RouterState([['onEnterState', 'onEnter'], ['onExitState', 'onExit'], ['onUpdateState', 'onUpdate']].reduce((finalObj, methods) => {
                                        var machineStateMethod = methods[0];
                                        finalObj[machineStateMethod] = (evt) => {
                                            return this.getComponentInstance(componentName, 'router')
                                                .then(componentInstance => Promise.resolve(componentInstance[methods[1]] ? componentInstance[methods[1]].call(componentInstance, Object.assign({}, evt)) : null));
                                        }
                                        return finalObj;
                                    }, {
                                        Component: entry[1],
                                        componentName
                                    }));
                                    this.addState(componentName, routerState);
                                    routerState.on(['exit', 'enter'], evt => {
                                        this.markDirty();
                                    });
                                });
                        })
                    }

                    compileRouterView(content, props, isContent) {
                        if (this.currentState) {
                            return this.getComponentInstance(this.currentState.componentName, 'router')
                                .then(component => component.render('markup', content, props))
                                .then(routerOutput => {
                                    this.trigger('rendercomponent', {componentOutput: routerOutput, componentName: this.currentState.componentName, props, isContent});
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
