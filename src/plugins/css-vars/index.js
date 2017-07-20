var Mixin = require('mixwith-es5').Mixin;
var CSSVars = require('./css-vars');

module.exports = function(Weddell, pluginOpts){
    return Weddell.plugin({
        id: 'css-vars',
        classes:  {
            App: Mixin(function(App){
                App = class extends App {
                    constructor(opts) {
                        super(opts);
                        var Transform = this.constructor.Weddell.classes.Transform;
                        this.stylesTransforms.push(new Transform({
                            from: 'CSSString',
                            to: '(locals:Object)=>CSSString',
                            func: function(input) {
                                return CSSVars.template(input);
                            }
                        }));
                    }
                }
                return App;
            })
        }
    });
};
