const h = require('virtual-dom/h');
const svg = require('virtual-dom/virtual-hyperscript/svg');

module.exports = function(vNode, newChildren=null, preserveIfUnchanged=false) {
    return preserveIfUnchanged && !newChildren && !vNode.namespace ? vNode : 
        (vNode.namespace ? svg : h)(vNode.tagName, Object.assign({}, vNode.properties, {
            key: vNode.key
        }), newChildren || vNode.children);
};