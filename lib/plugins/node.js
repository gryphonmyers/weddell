import { EventTarget, CustomEvent } from '../node-event-target';

import domAttributes from '../event-attributes.json';

export default function(weddell) {
    Object.assign(weddell, { EventTarget, CustomEvent, domAttributes });
}