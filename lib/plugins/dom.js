export default function(weddell) {
    Object.assign(weddell, { 
        EventTarget: window.EventTarget, 
        CustomEvent: window.CustomEvent, 
        domAttributes: document 
    });
}