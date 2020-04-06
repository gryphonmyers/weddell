const STORE = Symbol();
const RENDER_INTERVAL = 0.1667;
const RENDER_STATE = Symbol();
const IDLE = Symbol();
const RENDER_QUEUED = Symbol();
const RENDERING = Symbol();
const MARK_DIRTY = Symbol();
const QUEUE_RENDER = Symbol();
const IS_DIRTY = Symbol();
const KEY_DEPS = Symbol();
const RENDER = Symbol();
const HTML = Symbol();

function htmlTemplateTag(segments, ...interps) {
    return segments.reduce((acc, curr, ii) => `${acc}${curr}${interps[ii] || ''}`, '');
}

export const createComponentClass = ({EventEmitter, Error, Store, renderInterval=RENDER_INTERVAL}) => class Component extends EventEmitter {

    [QUEUE_RENDER]() {
        if (this[RENDER_STATE] !== RENDER_QUEUED) {
            this[RENDER_STATE] = RENDER_QUEUED;
            setTimeout(() => {
                this[RENDER]()
            }, renderInterval);
        }
    }

    [RENDER]() {
        this[RENDER_STATE] = RENDERING;
        this[KEY_DEPS].clear();
        const onGetState = ({key, store}) => {
            if (!this[KEY_DEPS].has(store)) {
                this[KEY_DEPS].set(store, {});
            }
            this[KEY_DEPS].get(store)[key] = 1;
        }
        this[STORE].internal.on('getstate', onGetState);
        this[HTML] = this.template({ html: htmlTemplateTag, state: this[STORE].readOnly});
        this[STORE].internal.off('getstate', onGetState);
        this[RENDER_STATE] = IDLE;
    }

    constructor() {
        super();
        this[STORE] = new Store(({ReactiveState, ComputedState}) => this.store({
            reactive: val => new ReactiveState(val),
            computed: func => new ComputedState(func)
        }));
        this[KEY_DEPS] = new Map();
        this[STORE].internal.on('statechange', ({key, store}) => {
            const deps = this[KEY_DEPS].get(store) 
            if (deps && key in deps) {
                this[QUEUE_RENDER]()
            }
        });
        var html;

        Object.defineProperties(this, {
            [HTML]: {
                set: (val) => {
                    html = val;
                    this.trigger('htmlchange', {html});
                },
                get: () => html
            },
            html: {
                get: () => html
            }
        })
        this[RENDER]()
    }
}

export default createComponentClass