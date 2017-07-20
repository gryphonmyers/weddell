var Mixin = require('mixwith-es5').Mixin;
var mix = require('mixwith-es5').mix;
var Router = require('./router');
var StateMachineMixin = require('./state-machine-mixin');
var MachineStateMixin = require('./machine-state-mixin');

module.exports = function(Weddell){
    return Weddell.plugin({
        id: 'router',
        classes:  {
            App: Mixin(function(Weddell){
                return class extends Weddell {
                    constructor(opts) {
                        super(opts);
                        this.router = new Router({
                            routes: opts.routes,
                            onRoute: function(matches, componentNames) {
                                var component = this.component;
                                var promises = [];
                                var key = 0;
                                while (component && component.components) {
                                    if (componentNames[key]) {
                                        var newComponent = component.getState(componentNames[key]);
                                        if (newComponent) {
                                            promises.push(component.changeState(newComponent));
                                            component = newComponent;
                                        } else {
                                            throw "Could not navigate to component " + key;
                                        }
                                    } else {
                                        if (component.currentState) {
                                            promises.push(component.changeState(null));
                                        }
                                        component = component.currentState;
                                    }
                                    key++;
                                }
                                return Promise.all(promises);
                            }.bind(this)
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
                var RouterComponent = class extends mix(Component).with(StateMachineMixin, MachineStateMixin) {
                    constructor(opts) {
                        opts.stateClass = RouterComponent;
                        super(opts);
                        var routerLocals = {
                            $router: this.importRouterView.bind(this)
                        };
                        this.store.assign(routerLocals);
                        this._locals.assign(routerLocals);

                        this.on('createcomponent', (evt) => {
                            this.addState(evt.componentName, evt.component);
                        });
                    }

                    importRouterView() {
                        return this.currentState ? this.currentState._pipelines.markup.import() : '';
                    }
                }
                return RouterComponent;
            }),
            Router
        }
    });
}
