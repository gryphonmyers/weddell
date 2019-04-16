var Weddell = require('../src/plugins/svg')(require('../src/presets/weddell-ro.js'));
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
        static get svg() {
            return [{
                ID: 'youtube-sprite',
                SVG: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="512px" height="512px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve">
                <g>
                    <g>
                        <g>
                            <path fill="#020202" d="M204.192,62.194c14.147-20.472,29.339-41.613,50.963-54.72c21.323,12.782,36.366,33.547,50.311,53.656     c32.847,49.754,52.929,109.515,48.878,169.578c10.615,8.898,21.537,17.441,31.994,26.521     c15.011,13.797,22.02,35.319,18.406,55.327c-5.036,25.275-9.876,50.607-15.206,75.813c-2.963,12.968-20.508,18.905-30.823,10.62     c-17.121-14.291-33.816-29.108-50.932-43.417c-12.95,12.462-30.153,20.772-48.214,21.773     c-20.791,1.466-41.375-7.156-56.448-21.242c-12.28,9.401-23.666,20.686-35.664,30.755c-5.799,4.66-10.621,10.784-17.484,13.966     c-10.64,4.565-24.342-2.248-26.747-13.685c-5.479-24.642-11.203-49.24-16.52-73.92c-4.321-20.878,3.332-43.61,19.419-57.607     c9.313-7.822,18.756-15.487,28.243-23.096c2.643-1.39,1.315-4.596,1.465-6.951C153.005,167.614,172.8,110.333,204.192,62.194z      M220.995,138.526c-12.424,15.994-10.921,40.768,3.488,55.052c15.255,16.809,44.15,17.422,60.106,1.29     c12.317-11.253,16.482-30.146,10.603-45.671c-5.387-14.967-19.809-26.195-35.671-27.591     C244.873,119.92,229.706,126.659,220.995,138.526z"/>
                        </g>
                        <path fill="#020202" d="M198.263,407.819c-0.213-7.266,8.83-12.262,14.942-8.417c25.87,13.32,58.027,13.314,83.896-0.007    c5.937-3.645,14.736,0.733,14.955,7.803c0.087,15.432,0.105,30.88,0.024,46.317c0.119,7.533-9.832,12.337-15.681,7.626    c-4.452-3.926-8.467-8.341-12.75-12.461c-6.776,13.201-13.163,26.602-19.995,39.772c-3.281,6.275-13.533,6.318-16.877,0.105    c-6.87-13.195-13.213-26.676-20.121-39.858c-4.221,4.157-8.248,8.548-12.694,12.468c-5.824,4.734-15.756-0.162-15.675-7.647    C198.163,438.291,198.244,423.055,198.263,407.819z"/>
                    </g>
                    <circle fill="#020202" cx="254.831" cy="164.509" r="20.812"/>
                </g>
                </svg>`
            }]
        }

        static get markup() {
            return (locals, h) => {
                return h('.boasdas', [h('svgsprite', {attributes: {svgId: 'youtube-sprite'}}),h('deeply-nested-component'), h('deeply-nested-component')])
            }
        }
    }
}

var SubComponent = Component => class extends Component {

    onUnmount() {
        // console.log('onunmounted', this.constructor.id, this.id);
    }

    static get svg() {
        return [
            {
                ID: 'youtube-sprite',
                SVG: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">
                <g>
                    <g>
                        <path d="M125.696,125.994c-5.52,0-10,4.48-10,10s4.48,10,10,10c5.52,0,10-4.48,10-10S131.216,125.994,125.696,125.994z"/>
                    </g>
                </g>
                <g>
                    <g>
                        <path d="M215.691,312.984h-29.998v-29.998c0-5.522-4.478-10-10-10s-9.999,4.478-9.999,10v29.998h-29.998    c-5.522,0-10,4.478-10,9.999s4.478,10,10,10h29.998v29.998c0,5.522,4.478,10,9.999,10s10-4.478,10-10v-29.998h29.998    c5.522,0,10-4.478,10-10S221.214,312.984,215.691,312.984z"/>
                    </g>
                </g>
                <g>
                    <g>
                        <path d="M485.578,321.984c-22.105-38.286-70.981-51.389-109.274-29.279l-40.618,23.45v-86.836c0-10.735-3.55-21.388-9.999-29.998    l-49.997-66.661v-28.386c11.638-4.128,19.999-15.242,19.999-28.279V29.998C295.687,13.457,282.23,0,265.689,0H85.698    C69.157,0,55.699,13.457,55.699,29.998v45.998c0,13.035,8.361,24.151,19.999,28.279v28.386l-50.001,66.665    c-6.446,8.606-9.996,19.258-9.996,29.993v193.66c0,27.569,22.429,49.997,49.997,49.997h160.702    c22.421,37.583,70.767,50.161,108.664,28.279L456.3,431.258C494.255,409.34,507.794,360.479,485.578,321.984z M75.698,29.998    c0-5.514,4.486-10,9.999-10h179.991c5.514,0,10,4.486,10,10v45.998c0,5.514-4.486,9.999-10,9.999H85.698    c-5.514,0-9.999-4.486-9.999-9.999V29.998z M41.701,211.319l51.996-69.326c1.298-1.73,2-3.836,2-6v-29.998h159.992v19.999h-89.995    c-5.522,0-10,4.478-10,10s4.478,10,10,10h94.995l48.993,65.322c3.202,4.275,5.191,9.39,5.792,14.674H35.913    C36.513,220.705,38.502,215.59,41.701,211.319z M65.699,452.977c-16.541,0-29.998-13.457-29.998-29.998v-10.099h181.675    c-3.171,12.965-3.15,26.813,0.481,40.098H65.699z M225.219,392.98H35.7V245.987h279.986V327.7l-60.619,35.002    C242.428,370.003,232.212,380.396,225.219,392.98z M325.066,483.935c-28.697,16.571-65.367,6.771-81.949-21.946    c-16.661-28.994-6.564-65.498,21.952-81.969l54.277-31.338l59.997,103.915L325.066,483.935z M446.3,413.939l-49.637,28.659    l-59.998-103.917l49.638-28.656c28.716-16.578,65.373-6.761,81.955,21.957C484.913,360.844,474.785,397.49,446.3,413.939z"/>
                    </g>
                </g>
                <g>
                </g>
                <g>
                </g>
                <g>
                </g>
                <g>
                </g>
                <g>
                </g>
                <g>
                </g>
                <g>
                </g>
                <g>
                </g>
                <g>
                </g>
                <g>
                </g>
                <g>
                </g>
                <g>
                </g>
                <g>
                </g>
                <g>
                </g>
                <g>
                </g>
                </svg>`
            }
        ];
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
            }, ['The wiggles are awesome', h('svgsprite', {attributes:{ svgId: 'youtube-sprite'}}), h('nested-component'), h('nested-component')]) : null)

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