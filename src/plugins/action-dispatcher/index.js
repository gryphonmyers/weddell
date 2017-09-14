var Mixin = require('mixwith-es5').Mixin;
var ActionDispatcher = require('./action-dispatcher');

module.exports = function(Weddell, pluginOpts){
    return Weddell.plugin({
        id: 'action-dispatcher',
        classes:  {
            App: Mixin(function(App){
                App = class extends App {
                    constructor(opts) {
                        super(opts);
                        Object.defineProperty(this, '_actionDispatcher', {
                            value: new ActionDispatcher
                        });
                        this.on('createcomponent', evt => {
                            this._actionDispatcher.addDispatchee(evt.component);
                            evt.component.on('createaction', evt => {
                                this._actionDispatcher.dispatch(evt.actionName, evt.actionData)
                            });
                        });
                    }
                }
                return App;
            }),
            Component: Mixin(function(Component){
                Component = class extends Component {
                    constructor(opts) {
                        super(opts);
                        var actionLocals = {
                            $act: this.createAction.bind(this)
                        };
                        this.store.assign(actionLocals);
                        this._locals.assign(actionLocals);
                    }

                    createAction(actionName, actionData) {
                        this.trigger('createaction', {actionName, actionData});
                    }
                }
                return Component;
            })
        }
    });
}
