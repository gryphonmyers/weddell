export default ({EventEmitter}) => class Renderer extends EventEmitter {
    request(request) {
        this.renderRequests.push(request);
        if (!this.renderPromise) {
            this.renderPromise = this.queueRender();
        }
        return this.renderPromise;
    }

    queueRender(rerenders=0) {
        if (rerenders > 100) throw new Error('Too many rerenders');

        return new Promise(resolve => setTimeout(async () => {
            var result;
            result = await this.render(this.renderRequests.splice(0, this.renderRequests.length));
            result = (this.onRender ? await this.onRender(result) : result);
            if (this.renderRequests.length > 0) {
                result = await this.queueRender(rerenders + 1);
            }
            this.renderPromise = null;
            this.emit('renderfinish', {result});
            resolve(this.lastResult = result);
        }, this.renderInterval));
    }

    render() {}

    constructor({
        onRender,
        renderInterval=0
    }={}) {
        super(...arguments);
        Object.defineProperties(this, {
            onRender: { value: onRender },
            renderInterval: {value: renderInterval},
            renderPromise: {value: null, writable: true },
            renderRequests: { value: [] },
            lastResult: { value: null, writable: true }
        });
    }
}