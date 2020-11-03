import { RESOLVE_COMPONENT, RENDER } from "../../component-symbols";

export default class ComponentExpression {
    
    constructor({ componentName, parentComponent, attrs={}, content=null, key=null, depth=null }) {
        this.key = attrs.key || key;
        this.componentName = componentName;
        this.attrs = attrs;
        this.content = content;
        this.depth = depth;
        this.parentComponent = parentComponent;
    }

    async renderArtifact() {
        const component = await this.parentComponent[RESOLVE_COMPONENT](this);
                
        return component[RENDER]();
    }

    get id() {
        return `component-${this.componentName}-${this.depth}-${this.key}`;
    }

    toString() {
        return `<template id="${this.id}"></template>`
    }
}