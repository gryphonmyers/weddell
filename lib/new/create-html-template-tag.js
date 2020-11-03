export default ({RenderResult, parent=null}) => 
    (segments, ...expressions) => {
        //Support creating new tag with all RR keyed to first argument
        if (typeof segments === 'string') {
            const key = segments;
            return (segments, ...expressions) => new RenderResult({ segments, parent, expressions, key });
        }
        return new RenderResult({ segments, expressions, parent });
    }