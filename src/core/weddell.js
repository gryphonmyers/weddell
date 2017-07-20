var mix = require('mixwith-es5').mix;
var App = require('./app');
var Component = require('./component');
var Store = require('./store');
var Pipeline = require('./pipeline');
var Transform = require('./transform');
var Sig = require('./sig');
var includes = require('../utils/includes');

class Weddell {
    static plugin(pluginObj) {
        Weddell = class extends Weddell {};
        if (!pluginObj.id) {
            throw 'Got a plugin with no ID assigned. Aborting';
        }
        if (!includes(Weddell.loadedPlugins, pluginObj.id)) {
            if (pluginObj.requires && !includes(Weddell.loadedPlugins, pluginObj.requires)) {
                [].concat(pluginObj.requires).forEach((plugReq) => {
                    throw 'Plugin ' + pluginObj.id + ' requires the plugin ' + plugReq + ', which is not loaded. Load ' + plugReq + ' first.';
                });
            }
            if (pluginObj.classes) {
                Object.entries(pluginObj.classes).forEach((entry) => {
                    var className = entry[0];
                    var classOrMixin = entry[1];
                    if (className in Weddell.classes) {
                        // Core class, we assume a mixin was passed and we should mix it
                        Weddell.classes[className] = mix(Weddell.classes[className]).with(classOrMixin);
                    } else {
                        // Helper class
                        Weddell.classes[className] = classOrMixin;
                    }
                });
                Object.values(Weddell.classes).forEach(function(commonClass){
                    commonClass.Weddell = Weddell;
                });
            }

            if (pluginObj.deps) {
                Object.entries(pluginObj.deps).forEach((entry) => {
                    if (entry[0] in Weddell.deps) {
                        throw 'Dependency conflict while loading plugin: ' + entry[0] + ' is taken.';
                    }
                    Weddell.deps[entry[0]] = entry[1];
                });
            }

            Weddell.loadedPlugins.push(pluginObj.id);
        } else {
            console.warn('Plugin ' + pluginObj.id + ' already loaded. Ignoring.');
        }
        return Weddell;
    }
}
Weddell.loadedPlugins = [];
Weddell.consts = {
    VAR_NAME: '_wdl'
};
Weddell.deps = {};
Weddell.classes = {App, Component, Store, Pipeline, Transform, Sig};
Object.values(Weddell.classes).forEach(function(commonClass){
    commonClass.Weddell = Weddell;
});
module.exports = Weddell;
