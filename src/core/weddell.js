

var mix = require('@weddell/mixwith').mix;

var WeddellApp = require('./app');
var WeddellComponent = require('./component');
var WeddellStore = require('./store');

/**
 * @typedef {object} WeddellPlugin
 * 
 * @property {string} id Plugin id (for deduplication and dependency purposes).
 * @property {string[]} requires Ids of other plugins that are required for this plugin to function.
 * @property {object[]} classes Classes to override on the base Weddell module (keys as class names, values as classes).
 */

/**
 * Top-level Weddell class serving as an entrypoint to various APIs. 
 * 
 * @abstract
 */

class Weddell {
    /**
     * Extends the base Weddell class with additional functionality, as defined in a plugin object.
     * 
     * @param {WeddellPlugin} pluginObj A plugin object to apply to the base Weddell class.
     * 
     * @example
     * const Weddell = require('weddell');
     * 
     * const WeddellWithPluginApplied = Weddell.plugin({
     *  id: 'my-plugin',
     *  require: ['my-other-plugin'], // will error if app is initialized without 'my-other-plugin' also applied
     *  classes: {
     *      Component: Component => class extends Component {
     * 
     *          onMount() {
     *              console.log(this.myNewComponentMethod());
     *          }
     * 
     *          myNewComponentMethod() {
     *              this.foo = 'bar';
     *          }
     *      }
     *  },
     * 
     *  // Every component mounted by this app will print 'bar' to logs.
     *  
     * })
     */

    static plugin(pluginObj) {
        class NewWeddell extends Weddell {};
        if (!pluginObj.id) {
            throw 'Got a plugin with no ID assigned. Aborting';
        }
        if (!NewWeddell.loadedPlugins.includes(pluginObj.id)) {
            if (pluginObj.requires && !NewWeddell.loadedPlugins.includes(pluginObj.requires)) {
                [].concat(pluginObj.requires).forEach((plugReq) => {
                    throw 'Plugin ' + pluginObj.id + ' requires the plugin ' + plugReq + ', which is not loaded. Load ' + plugReq + ' first.';
                });
            }
            if (pluginObj.classes) {
                Object.entries(pluginObj.classes).forEach((entry) => {
                    var className = entry[0];
                    var classOrMixin = entry[1];
                    if (className in NewWeddell.classes) {
                        // Core class, we assume a mixin was passed and we should mix it
                        NewWeddell.classes[className] = mix(NewWeddell.classes[className]).with(classOrMixin);
                    } else {
                        // Helper class
                        NewWeddell.classes[className] = classOrMixin;
                    }
                });
                Object.values(NewWeddell.classes).forEach(function(commonClass){
                    commonClass.Weddell = NewWeddell;
                });
            }

            if (pluginObj.deps) {
                Object.entries(pluginObj.deps).forEach((entry) => {
                    if (entry[0] in NewWeddell.deps) {
                        throw 'Dependency conflict while loading plugin: ' + entry[0] + ' is taken.';
                    }
                    NewWeddell.deps[entry[0]] = entry[1];
                });
            }

            NewWeddell.loadedPlugins.push(pluginObj.id);
        } else {
            console.warn('Plugin ' + pluginObj.id + ' already loaded. Ignoring.');
        }
        return NewWeddell;
    }
    
    static get App() {
        return this.classes.App;
    }
    
    static get Store() {
        return this.classes.Store;
    }

    static get Component() {
        return this.classes.Component;
    }
}
Weddell.loadedPlugins = [];
Weddell.consts = {
    VAR_NAME: '_wdl',
    INDEX_ATTR_NAME: 'data-component-index'
};
Weddell.deps = {};
Weddell.classes = {App: WeddellApp, Component: WeddellComponent, Store: WeddellStore };
// Object.entries(Weddell.classes)
//     .forEach(([key, commonClass]) => {
//         commonClass.Weddell = Weddell;
//         Object.defineProperty(Weddell, key, { get: () => commonClass })
//     });
module.exports = Weddell;
