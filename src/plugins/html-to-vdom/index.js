var Mixin = require('mixwith-es5').Mixin;
var htmltovdomparser = require('./html-to-vdom-parser');
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
                                return htmltovdomparser.parse(input, h);
                            }
                        }));
                    }
                }
                return App;
            })
        }
    });
}
