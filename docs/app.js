// var diff = require("virtual-dom").diff
// var patch = require("virtual-dom").patch
// var h = require("virtual-dom").h
// var createElement = require("virtual-dom").create

// var OddCounterWidget = function() {}
// OddCounterWidget.prototype.type = "Widget"
// OddCounterWidget.prototype.count = 1
// OddCounterWidget.prototype.init = function() {
//   // With widgets, you can use any method you would like to generate the DOM Elements.
//   // We could get the same result using:
//   // return createElement(h("div", "Count is: " + this.count))
//   var divElem = document.createElement("div")
//   var textElem = document.createTextNode("Count is: " + this.count)
//   divElem.appendChild(textElem)
//   return divElem
// }

// OddCounterWidget.prototype.update = function(previous, domNode) {
//     debugger
//   this.count = previous.count + 1
//   // Only re-render if the current count is odd
//   if (this.count % 2) {
//     // Returning a new element from widget#update
//     // will replace the previous node
//     return this.init()
//   }
//   return null
// }

// OddCounterWidget.prototype.destroy = function(domNode) {
//   // While you can do any cleanup you would like here,
//   // we don't really have to do anything in this case.
//   // Instead, we'll log the current count

//   console.log(this.count)
// }

// var myCounter = new OddCounterWidget()
// var currentNode = myCounter
// var rootNode = createElement(currentNode)

// // A simple function to diff your widgets, and patch the dom
// var update = function(nextNode) {
//     debugger;
//   var patches = diff(currentNode, nextNode)
//   rootNode = patch(rootNode, patches)
//   currentNode = nextNode
// }

// document.body.appendChild(rootNode)
// var widget = new OddCounterWidget();
// setInterval(function(){
   
//   update(widget)
// }, 1000)



var Weddell = require('../src/presets/weddell-ro.js');
var defaults = require('defaults-es6/deep');
var subComponents = {
    'nested-component': Component => class extends Component {
        static get components() {
            return this._components ? this._components : this._components = {
                'deeply-nested-component': Component => class extends Component {
                    static get state() {
                        return defaults({
                            posX: 0
                        }, super.state);
                    }

                    static get markup() {
                        return (locals, h) => {
                            return h('.google', { className: 'cmpt-' + locals.$id }, [locals.posX + ' off'])
                        }
                    }

                    static get styles() {
                        return `
                            .google {
                                color: green;
                                transition: transform .5s;
                            }
                        `;
                    }

                    static get dynamicStyles() {
                        return locals => `
                            .google.cmpt-${locals.$id} {
                                transform: scale(${locals.posX.toFixed(1)})
                            }
                        `;
                    }

                    onMount() {
                        window.addEventListener('scroll', () => {
                            this.state.posX = Math.random() * 3;
                        })
                    }
                }
            }
        }

        static get markup() {
            return (locals, h) => {
                return h('.boasdas', [h('deeply-nested-component'), h('deeply-nested-component')])
            }
        }
    }
}

var SubComponent = Component => class extends Component {
    static get markup() {
        return (locals, h) => {
            var bgColor = Math.floor(Math.random() * 3);
            switch (bgColor) {
                case 0:
                    bgColor = 'red';
                    break;
                case 1:
                    bgColor = 'blue';
                    break;
                case 2:
                    bgColor = 'yellow';
                    break;

            }
            return h('div', {
                style: {
                    backgroundColor: bgColor,
                    color: `rgb(${locals.color.map(Math.floor).join(', ')})`
                }
            }, ['The wiggles are awesome', h('nested-component'), h('nested-component')]);
        }
    }

    static get components() {
        return subComponents
    }

    static get state() {
        return defaults({
            color: [0,0,0]
        }, super.state);
    }

    onRender() {
    }

    onMount() {
        setInterval(() => {
            this.state.color = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
        }, 2000);
    }
}

var app = new Weddell.classes.App({
    el: '#app',
    Component: Component => {
        return class extends Component {
            constructor(opts) {
                super(defaults(opts, {
                    // state: {
                    //     body: 'Bloooo'
                    // }
                }))
            }

            onMount() {
            }

            static get components() {
                return {
                    'my-component': SubComponent,
                    'my-component-2': SubComponent
                }
            }

            static get state() {
                return defaults({
                    body: 'Blooo',
                    fontSize: '12px'
                }, super.state);
            }

            static get markup() {
                return (locals, h) => {
                    return h('.foo', [ h('span.boo', { className: 'cmpt-' + locals.$id }, [locals.body]), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2') ])
                };
            }

            static get styles() {
                return `
                    .foo {
                        color: red;
                    }
                `;
            }

            static get dynamicStyles() {
                return (locals) => {
                    return `
                        .foo.cmpt-${locals.$id} {
                            font-size: ${locals.fontSize};
                        }
                    `;
                }
            }
        }
    }
});

app.init();