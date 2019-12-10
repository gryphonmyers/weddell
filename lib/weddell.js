import createComponentClass from './create-component-class';
import createEventEmitterClass from './create-event-emitter-class';
import createRendererClass from './create-renderer-class';
import createStoreClass from './create-store-class';
import createAppClass from './create-app-class';

const weddell = {};

const INSTALLED_PLUGINS = Symbol('installedPlugins');

// private properties
Object.defineProperties(weddell, { 
    cache: { value: {} }, 
    [INSTALLED_PLUGINS]: { value: new Map() }
});

// other public properties
Object.assign(weddell, {
    createComponentClass,
    createEventEmitterClass,
    createRendererClass,
    createAppClass,
    createStoreClass,
    EventTarget: null,
    CustomEvent: null,
    domAttributes: null,
    setLazyProperty(key, func) {
        Object.defineProperty(this, key, { 
            get: function(){
                return this.cache[key] || (this.cache[key] = func.call(this))
            }
        })
    },
    use: function() {
        var plugins = Array.from(arguments).flat();

        plugins.forEach(plugin => {
            if (this[INSTALLED_PLUGINS].has(plugin)) {
                return;
            }
    
            plugin(this)
    
            for (var prop in this.cache) {
                delete this.cache[prop];
            }
    
            this[INSTALLED_PLUGINS].set(plugin);
        });        

        return this;
    }
})

// class getters (public)
var handlers = [
    ['EventEmitter',function() {
        const { EventTarget, CustomEvent } = this;
        return this.createEventEmitterClass({ EventTarget, CustomEvent });
    }], 
    ['Store', function() {
        const { EventEmitter } = this;
        return this.createStoreClass({ EventEmitter });
    }], 
    ['Component', function() {
        const { EventEmitter, Store, domAttributes, Renderer } = this;
        return this.createComponentClass({ EventEmitter, Store, domAttributes, Renderer });
    }],
    ['Renderer', function() {
        const { EventEmitter } = this;
        return this.createRendererClass({ EventEmitter });
    }],
    ['App', function() {
        const { EventEmitter } = this;
        return this.createAppClass({ EventEmitter });
    }]
]
handlers.forEach(([k,v]) => {
    weddell.setLazyProperty(k, v);
})

export default weddell;