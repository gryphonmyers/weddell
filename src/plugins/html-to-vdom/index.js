var Mixin = require('mixwith-es5').Mixin;
var parse = require('html-to-vdom-parser/parse');

module.exports = function(_Weddell){
    return _Weddell.plugin({
        id: 'html-to-vdom',
        requires: 'vdom',
        classes:  {
            App: Mixin(function(App){
                App = class extends App {
                    constructor(opts) {
                        super(opts);
                        var Transform = this.constructor.Weddell.classes.Transform;
                        var h = this.constructor.Weddell.deps.h;

                        this.markupTransforms.push(new Transform({
                            from: 'HTMLString',
                            to: 'VNode',
                            func: function(input) {
                                return parse(h, input);
                            }
                        }));
                    }
                }
                return App;
            })
        }
    });
}
