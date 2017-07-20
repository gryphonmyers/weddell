var Parser = require('prescribe');
module.exports = {
    parse: function(html, h) {
        var parser = new Parser(html);
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
                current = {tok, parent: current, children:[]};
            },
            endTag: function(tok){
                //TODO add support for SVG
                //TODO ensure unary elements work
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
