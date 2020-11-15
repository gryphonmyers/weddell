

export default RenderResult => class extends RenderResult {
    transformExpression(exp) {
        if (Array.isArray(exp)) {
            return ArrayExpression(exp);
        }
        return super.transformExpression(exp);
    }

    new ComponentExpression()
}