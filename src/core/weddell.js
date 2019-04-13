/**
 * Base Weddell module.
 * 
 * @module weddell

 */

var mix = require('@weddell/mixwith').mix;

/**
 * @requires module:weddell/app
 * @see {@link app}
 */
var App = require('./app');
/**
 * @requires module:weddell/component
 * @see {@link component}
 */
var Component = require('./component');
/**
 * @requires module:weddell/store
 * @see {@link store}
 */
var Store = require('./store');



class Weddell {
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
                    commonClass.NewWeddell = NewWeddell;
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
}
Weddell.loadedPlugins = [];
Weddell.consts = {
    VAR_NAME: '_wdl',
    INDEX_ATTR_NAME: 'data-component-index'
};
Weddell.deps = {};
Weddell.classes = {App, Component, Store};
Object.entries(Weddell.classes)
    .forEach(([key, commonClass]) => {
        commonClass.Weddell = Weddell;
        Object.defineProperty(Weddell, key, { get: () => commonClass })
    });
module.exports = Weddell;
