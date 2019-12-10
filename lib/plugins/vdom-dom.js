import createVdomPatcherClass from '../create-vdom-patcher-class';
import { WIDGET } from '../symbols/vdom';
import { GET_APP_RENDER_REQUEST_FROM_COMPONENT_RENDER_RESULT, COMPONENT } from '../symbols/app';

export default function(weddell) {
    const { createAppClass } = weddell;
    Object.assign(weddell, { 
        createAppClass: function() {
            return class extends createAppClass(...arguments) {
                constructor() {
                    super(...arguments);

                    this[RENDERERS].vdom = new weddell.VdomPatcher();
                }
                [GET_APP_RENDER_REQUEST_FROM_COMPONENT_RENDER_RESULT](component, rendererName, result) {
                    if (rendererName === 'vdom') {
                        return this[COMPONENT][WIDGET];
                    }
                    return super[GET_APP_RENDER_REQUEST_FROM_COMPONENT_RENDER_RESULT](...arguments);
                }
            }
        },        
        createVdomPatcherClass
    });
    
    weddell.setLazyProperty('VdomPatcher', function () {
        const { Renderer } = this;
        return this.createVdomPatcherClass({ Renderer });
    });
}