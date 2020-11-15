import eventHandlerExpressionRenderResultClassMixin from "./event-handler-expression-render-result-class-mixin.js";

export default RenderResult => 
    class extends eventHandlerExpressionRenderResultClassMixin(RenderResult) {

        toArtifact() {
            const template = super.toArtifact(arguments);

            template.addEventListener('eventproxy', evt => {
                evt.stopPropagation();
                const {detail: {event, token}} = evt;

                this.invokeHandler(token, event, event.target);
            });

            return template;
        }
    }