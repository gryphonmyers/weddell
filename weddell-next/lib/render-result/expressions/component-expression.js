import { RESOLVE_COMPONENT, RENDER } from "../../component-symbols.js";

export default class ComponentExpression {
    
    constructor({ componentName, parentComponent, props={}, content=null, key=null, depth=null }) {
        this.key = props.key || key;
        this.componentName = componentName;
        this.props = props;
        this.content = content;
        this.depth = depth;
        this.parentComponent = parentComponent;
    }

    // async resolveComponent() {
    //     return this.parentComponent[RESOLVE_COMPONENT](this);   
    // }

    get id() {
        return `component-${this.componentName}-${this.depth}-${this.key}`;
    }

    toString() {
        return `<template id="${this.id}"></template>`
    }
}