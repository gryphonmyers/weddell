const EVENT_PROXIES = Symbol('eventProxies');

export default ({EventTarget, CustomEvent}) => {
    class EventObject extends CustomEvent {
        constructor(evtName, evtObj) {
            super(evtName, evtObj)
            this.eventName = this.type
            Object.assign(this, evtObj.detail || null);
        }
    }
    
    class EventEmitter extends EventTarget {
        constructor() {
            super(...arguments);
            this[EVENT_PROXIES] = [];
        }
        once(evtName, callback) {
            this.on(evtName, () => this.off(evtName, callback));
            return this.on(evtName, callback);
        }
        
        dispatchEvent(evtName, detail) {
            var res = super.dispatchEvent(new EventObject(evtName, {detail}));
            this[EVENT_PROXIES].forEach(proxy => proxy.dispatchEvent(evtName, {detail}))
            return res;
        }

        proxyEvents(emitter) {
            this[EVENT_PROXIES].push(emitter);
        }
    }
    var p = EventEmitter.prototype;
    [['dispatchEvent',['trigger', 'emit']], ['removeEventListener',['off', 'removeListener']], ['addEventListener', ['on', 'addListener']]]
        .forEach(([k, als]) => als.forEach(al => p[al] = p[k]));

    return EventEmitter;
}