export class ComponentExpression {
    
    constructor({ componentName, props={}, content=null, key=null, depth=null }) {
        this.key = props.key || key;
        this.componentName = componentName;
        this.props = props;
        this.content = content;
        this.depth = depth;
    }

    get id() {
        return `component-${this.componentName}-${this.depth}-${this.key}`;
    }

    toString() {
        return `<template id="${this.id}"></template>`
    }
}