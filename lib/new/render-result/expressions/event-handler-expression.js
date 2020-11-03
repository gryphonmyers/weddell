export class EventHandlerExpression {
    constructor(token) {
        this.token = token;
    }

    toString() {
        return `this.dispatchEvent(new CustomEvent("eventproxy",{detail:{event,token:"${this.token}"},bubbles:true}))`
    }
}