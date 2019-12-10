const tap = require('tap');
import { RENDERERS, RENDER_RESULTS } from '../lib/symbols/component';
import weddell from '../lib/presets/node.js';
const { Component } = weddell;
const vdomToHtml = require('vdom-to-html');

tap.test('Component works', async test => {
    
    test.test(async test => {
        class MyComponent extends Component {
            static get markup() {
                return (locals, h) => {
                    return h('div', { attributes: { 'data-foo': 'bar' } });
                }
            }
        }
        const component = new MyComponent();
        const result = await component[RENDERERS].vdom.request();
        test.deepEquals(result.properties.attributes, { 'data-foo': 'bar' });
        test.same(result.tagName, 'DIV');
    })

    test.test(async test => {
        class MyComponent extends Component {
            static get markup() {
                return (locals, h) => {
                    return h('div', { attributes: { 'data-foo': 'bar' } }, [
                        h('my-component')
                    ]);
                }
            }

            static get components() {
                return {
                    'my-component': class extends Component {
                        static get markup() {
                            return (locals, h) =>
                                h('div.goo')
                        }
                    }
                }
            }
        }
        const component = new MyComponent();
        const result = await component[RENDERERS].vdom.request();
        
        test.equals(vdomToHtml(result), '<div data-foo="bar"><div class="goo"></div></div>');
    })

    test.test(async test => {
        class MyComponent extends Component {
            static get markup() {
                return (locals, h) =>
                    h('div', { attributes: { 'data-foo': 'bar' } }, [
                        h('my-component', [
                            h('div.bar')
                        ])
                    ]);
            }

            static get components() {
                return {
                    'my-component': class extends Component {
                        static get markup() {
                            return (locals, h) =>
                                h('div.goo', [
                                    h('content')
                                ])
                        }
                    }
                }
            }
        }
        const component = new MyComponent();
        const result = await component[RENDERERS].vdom.request();
        
        test.equals(vdomToHtml(result), '<div data-foo="bar"><div class="goo"><div class="bar"></div></div></div>');
    })

    test.test(async test => {
        class MyComponent extends Component {
            static get markup() {
                return (locals, h) => 
                    h('div', { attributes: { 'data-foo': 'bar' } }, [
                        h('my-component', [
                            h('div.bar', [locals.num])
                        ])
                    ]);                    
            }

            static get state() {
                return {
                    num: 1
                }
            }

            increment() {
                this.state.num++
            }

            static get components() {
                return {
                    'my-component': class extends Component {
                        static get markup() {
                            return (locals, h) =>
                                h('div.goo', [
                                    h('content')
                                ])
                        }
                    }
                }
            }
        }
        const component = new MyComponent();
        var result = await component[RENDERERS].vdom.request(component.state);
        
        test.equals(vdomToHtml(result), '<div data-foo="bar"><div class="goo"><div class="bar">1</div></div></div>');
        
        component.on('renderfinish', evt => {
            result = evt.result;
        })
        component.increment();
        await component.awaitRender();
        
        test.equals(vdomToHtml(result), '<div data-foo="bar"><div class="goo"><div class="bar">2</div></div></div>');
    })

    test.test(async test => {
        class MyComponent extends Component {
            static get markup() {
                return (locals, h) =>
                    h('div', { attributes: { 'data-foo': 'bar' } }, [
                        h('my-component', [
                            h('div.bar', [locals.num])
                        ])
                    ]);
            }

            static get state() {
                return {
                    num: 1
                }
            }

            increment() {
                this.state.num++
            }

            static get components() {
                return {
                    'my-component': class extends Component {
                        static get markup() {
                            return (locals, h) =>
                                h('div.goo', [
                                    h('content')
                                ])
                        }
                    }
                }
            }
        }
        const component = new MyComponent();
        const patchRequests = [];
        component.on('renderfinish', evt => {
            patchRequests.push(evt);
        });

        var result = await component[RENDERERS].vdom.request(component.state); //@TODO not calling this makes it fail. Problem?
    
        component.increment();
        await component.awaitRender();

        test.equals(patchRequests.length, 2);        
    });

    test.test(async test => {
        class MyComponent extends Component {
            static get markup() {
                return (locals, h) =>
                    h('div', { attributes: { 'data-foo': 'bar' } }, [
                        h('my-component', { attributes: { hibar: locals.type }})
                    ]);
            }

            static get state() {
                return {
                    type: null
                }
            }

            changeType() {
                this.state.type = 'accident';
            }


            static get components() {
                return {
                    'my-component': class extends Component {
                        static get markup() {
                            return (locals, h) =>
                                h('div.goo', [
                                    locals.hibar
                                ])
                        }

                        static get state() {
                            return {
                                hibar: 'routine'
                            }
                        }
                        
                        static get inputs() {
                            return ['hibar'];
                        }
                    }
                }
            }
        }
        const component = new MyComponent();

        var result = await component[RENDERERS].vdom.request(component.state); //@TODO not calling this makes it fail. Problem?
        
        test.equals(vdomToHtml(result), '<div data-foo="bar"><div class="goo">routine</div></div>');

        component.changeType();

        await component.awaitRender();

        test.equals(vdomToHtml(result), '<div data-foo="bar"><div class="goo">accident</div></div>');

        // component.increment();
        // await component.awaitRender();

        // test.equals(patchRequests.length, 1);        
    });
    
    test.test(async test => {
        var dink;
        class MyComponent extends Component {
            static get markup() {
                return (locals, h) =>
                    h('div', { attributes: { 'data-foo': locals.type } }, [
                        h('my-component', { attributes: { onfire: 'this.state.type = "bar"' }})
                    ]);
            }

            static get state() {
                return {
                    type: 'wash'
                }
            }

            static get components() {
                return {
                    'my-component': class extends Component {
                        onInit() {
                            dink = this;
                        }

                        fire() {
                            this.trigger('fire', {});
                        }

                        static get markup() {
                            return (locals, h) =>
                                h('div.goo')
                        }
                    }
                }
            }
        }
        const component = new MyComponent();

        var result = await component[RENDERERS].vdom.request(component.state); //@TODO not calling this makes it fail. Problem?
        
        test.equals(vdomToHtml(result), '<div data-foo="wash"><div class="goo"></div></div>');

        dink.fire();

        await component.awaitRender();

        test.equals(vdomToHtml(component[RENDER_RESULTS].vdom.output), '<div data-foo="bar"><div class="goo"></div></div>');       
    });

    test.end();
})