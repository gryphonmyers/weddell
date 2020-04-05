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
        }
        once(evtName, callback) {
            this.on(evtName, () => this.off(evtName, callback));
            return this.on(evtName, callback);
        }
        
        dispatchEvent(evtName, detail) {
            return super.dispatchEvent(new EventObject(evtName, {detail}));
        }
    }
    var p = EventEmitter.prototype;
    [['dispatchEvent',['trigger', 'emit']], ['removeEventListener',['off', 'removeListener']], ['addEventListener', ['on', 'addListener']]]
        .forEach(([k, als]) => als.forEach(al => p[al] = p[k]));

    return EventEmitter;
}