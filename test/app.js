const tap = require('tap');
import { COMPONENT } from '../lib/symbols/app';
import { RENDER_RESULTS } from '../lib/symbols/component';
import weddell from '../lib/presets/node.js';
const { App, Component } = weddell;
const vdomToHtml = require('vdom-to-html');

tap.test('App works', async test => {
    test.test(async test => {
        test.throws(() => new App());

        const app = new App({
            Component: class extends Component {
                static get markup() {
                    return (locals, h) => {
                        return h('.boy')
                    }
                }
            }
        })
        const evts = [];
        app.on('renderfinish', (evt) => evts.push(evt))
        await app.init();
        await app.awaitRender();
        test.equals(evts.length, 1);
        test.equals(vdomToHtml(app[COMPONENT][RENDER_RESULTS].vdom.output), '<div class="boy"></div>');
    })
});