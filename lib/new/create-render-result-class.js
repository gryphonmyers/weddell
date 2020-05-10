

export default ({ComponentRenderHandle, Slot}) => class RenderResult {

    getChildComponentHandles(component=this.component) {
        return this.expressions.flat(1).reduce((acc, exp) => exp instanceof ComponentRenderHandle && exp.didRender && exp.parent === component
            ? [...acc, ...exp.renderResult.getChildComponentHandles(component)]
            : exp instanceof RenderResult && exp.component === this.component
                ? [...acc, ...exp.getChildComponentHandles(component)]
                : acc, []);
    }

    constructor({component, segments, expressions}) {
        this.segments = segments;
        this.expressions = expressions;
        this.component = component;
    }
    
    async render() {
        const { component, expressions, segments} = this;

        var transformExpression = exp =>
            (exp instanceof Slot || exp instanceof RenderResult || exp instanceof ComponentRenderHandle)
                ? exp.render()
                : Array.isArray(exp)
                    ? Promise.all(exp.map(transformExpression))
                    : exp

        return new RenderResult({
            component,
            segments,
            expressions: await Promise.all(expressions.map(transformExpression))
        })
    }

    serializeExpression(exp) {
        //@TODO escape html in expressions without an override
        if (typeof exp === 'function') return `resolveWeddellComponentState('${this.id}').then(state => (${exp})(event))`;
        if (Array.isArray(exp)) return exp.map(this.serializeExpression.bind(this)).join('')
        return exp || ''
    }

    toString() {
        return this.segments.reduce((acc, curr, ii) => 
            `${acc}${curr}${this.serializeExpression(this.expressions[ii])}`, '');
    }
}




