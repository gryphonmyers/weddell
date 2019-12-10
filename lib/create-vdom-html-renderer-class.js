import vdomToHtml from 'vdom-to-html';

export default ({Renderer}) => 
    /**
     * A renderer that takes app VDOM widget requests and asynchronously renders the most recent batched widget as an HTML string.
     * 
     */
    class VdomRenderer extends Renderer {
        
        /**
         * Renders a batch of requests by taking the last requested widget and rendering it into an html string.
         * @param {*} widgets 
         */
        async render(widgets) {
            return vdomToHtml(widgets[widgets.length - 1]);
        }
    }