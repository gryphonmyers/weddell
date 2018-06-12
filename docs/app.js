var Weddell = require('../src/presets/weddell-ro.js');
var defaults = require('defaults-es6/deep');
var subComponents = {
    'nested-component': Component => class extends Component {
        static get components() {
            return this._components ? this._components : this._components = {
                'deeply-nested-component': Component => class extends Component {
                    static get state() {
                        return defaults({
                            posX: 1
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

    onUnmount() {
        // console.log('onunmounted', this.constructor.id, this.id);
    }

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
            var result = (locals.render ? h('div', {
                style: {
                    backgroundColor: bgColor,
                    color: `rgb(${locals.color.map(Math.floor).join(', ')})`
                }
            }, ['The wiggles are awesome', h('nested-component'), h('nested-component')]) : null)

            return result;
        }
    }

    static get components() {
        return subComponents
    }

    static get state() {
        return defaults({
            false: true,
            render: true,
            color: [0,0,0]
        }, super.state);
    }

    onRender() {
    }

    onMount() {
        // console.log('mounting', this.constructor.id, this.id);
        // setInterval(() => {
        //     this.state.render = !this.state.render;
        // }, 2000);
    }
}

var app = new Weddell.classes.App({
    el: '#app',
    routes: [
        {
            name: 'homey',
            pattern: '/boo',
            handler: function(){
                // debugger;
                return 'other-component-yo'
            }
        },
        {
            name: 'home',
            pattern: '/',
            handler: function(){
                // debugger;
                return 'routed-component-yo'
            }
        }
    ],
    Component: Component => {
        return class extends Component {
            constructor(opts) {
                super(defaults(opts, {
                    // state: {
                    //     body: 'Bloooo'
                    // }
                }))
            }

            static get components() {
                return {
                    'routed-component-yo': Component => class extends Component {
                        static get markup() {
                            return (locals, h) => h('.bingo', ['The blarney stone']);
                        }
                    },
                    'other-component-yo': Component => class extends Component {
                        static get markup() {
                            return (locals, h) => h('.bingo', ['The moogie stone' + locals.borgus]);
                        }

                        static get inputs() {
                            return [
                                'borgus'
                            ];
                        }
                    },
                    'my-component': SubComponent,
                    'my-component-2': SubComponent,
                    'my-component-3': SubComponent
                }
            }

            static get state() {
                return defaults({
                    body: 'Blooo',
                    fontSize: '12px',
                    a: true,
                    johnson: 'Twinkle'
                }, super.state);
            }

            static get markup() {
                return (locals, h) => {
                    return h('.foo', [ h('routerview', { attributes: {
                        borgus: locals.johnson
                    }}), h('a', {attributes: {href: '/boo'}}, 'Wuzipan'), h('span.boo', { className: 'cmpt-' + locals.$id }, [locals.body]) ].concat(locals.a ? [
                        h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), 
                        h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), 
                        h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2'), 
                        h('my-component'), h('my-component-2'), h('my-component'), h('my-component-2')
                    ] : [
                        h('my-component-3'), h('my-component-3'), h('my-component-3'), h('my-component-3'), 
                        h('my-component-3'), h('my-component-3'), h('my-component-3'), h('my-component-3'), 
                        h('my-component-3'), h('my-component-3'), h('my-component-3'), h('my-component-3'), 
                        h('my-component-3'), h('my-component-3'), h('my-component-3'), h('my-component-3')
                    ]))
                };
            }

            onUnmount() {
                console.log('unmount')
            }

            onMount() {
                console.log('mount');
                setInterval(() => {
                    this.state.a = !this.state.a;
                    this.state.johnson += 'too';
                }, 5000);
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