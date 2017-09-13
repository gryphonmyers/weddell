var Parser = require('prescribe');
module.exports = {
    parse: function(html, h) {
        var parser = new Parser(html.trim());
        var nodes = [];
        var current;

        parser.readTokens({
            chars: function(tok) {
                if (current) {
                    current.children.push(tok.text);
                } else {
                    nodes.push(tok.text);
                }
            },
            startTag: function(tok){
                if (tok.unary || tok.html5Unary || tok.tagName === 'input') {
                    //NOTE this is how we will handle unary elements. Prescribe's unary element detection isn't perfect, so in the case of input elements, for example, we need to check for those explicity.
                    var node = h(tok.tagName, {attributes: Object.assign({}, tok.attrs, tok.booleanAttrs)});
                    if (current) {
                        current.children.push(node);
                    } else {
                        nodes.push(node);
                    }
                } else {
                    current = {tok, parent: current, children:[]};
                }
            },
            endTag: function(tok){
                //TODO add support for SVG
                var node = h(current.tok.tagName, {attributes: Object.assign({}, current.tok.attrs, current.tok.booleanAttrs)}, current.children);
                current = current.parent;
                if (!current) {
                    nodes.push(node);
                } else {
                    current.children.push(node);
                }
            }
        });
        return nodes;
    }
}
