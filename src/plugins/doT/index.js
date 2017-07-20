var Mixin = require('mixwith-es5').Mixin;
var doT = require('dot');
module.exports = function(Weddell, doTOpts){
    if (doTOpts) {
        dot.templateSettings = doTOpts;
    }
    return Weddell.plugin({
        id: 'dot',
        classes:  {
            App: Mixin(function(App){
                App = class extends App {
                    constructor(opts) {
                        super(opts);
                        var Transform = this.constructor.Weddell.classes.Transform;
                        var Sig = this.constructor.Weddell.classes.Sig;
                        Sig.addTypeAlias('doT', 'HTMLString');
                        this.markupTransforms.push(new Transform({
                            from: 'doT',
                            to: '(locals:Object)=>HTMLString',
                            func: function(input) {
                                //TODO Dot allows for compile-time data (static partials, etc) as 3rd arg. Need to figure out where this would be defined and passed in
                                return doT.template(input, null, null);
                            }
                        }));
                    }
                }
                return App;
            })
        }
    });
}
