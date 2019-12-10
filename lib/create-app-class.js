import {
    COMPONENT,
    RENDERERS,
    GET_APP_RENDER_REQUEST_FROM_COMPONENT_RENDER_RESULT
} from './symbols/app.js';
import {
    INIT
} from './symbols/component.js';

export default ({EventEmitter}) => {
    class App extends EventEmitter {
        constructor({
            Component=null
        }={}) {
            if (!Component) throw new Error("No root component class");
            super(...arguments);

            Object.defineProperties(this, {
                [RENDERERS]: { 
                    value: new Proxy({}, {
                        get: (obj, key) => obj[key],
                        set: (obj, key, val) => {
                            val.on('renderfinish', ({result}) => this.emit('renderfinish', {result}));
                            obj[key] = val;
                            return true;
                        }
                    }) 
                },
            });

            this[COMPONENT] = new Component();
            var makeFunc = (component) => {
                return ({rendererName, result}) => {
                    this[RENDERERS][rendererName] && this[RENDERERS][rendererName].request(
                        this[GET_APP_RENDER_REQUEST_FROM_COMPONENT_RENDER_RESULT](component, rendererName, result)
                    );
                }
            }
            this[COMPONENT].on('renderfinish', makeFunc(this[COMPONENT]));
            this[COMPONENT].on('createcomponent', ({component}) => {
                component.on('renderfinish', makeFunc(component));
            });
        }
        
        async awaitRender() {
            return Promise.all(
                Object.values(this[RENDERERS]).map(renderer => renderer.renderPromise)
            );
        }

        [GET_APP_RENDER_REQUEST_FROM_COMPONENT_RENDER_RESULT](rendererName, result) {
            return result;
        }

        async init() {
            await this[COMPONENT][INIT]();
        }
    }

    return App;
}