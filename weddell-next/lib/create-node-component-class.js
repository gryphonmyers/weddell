import { createComponentRenderHandle, createComponentClass } from "./create-component-class.js";   
import ComponentRenderHandle from "./component-render-handle.js";

export function createNodeComponentClass(opts={}) {
    const { ComponentRenderHandle } = opts;

    return class extends createComponentClass({
        ...opts, 
        ComponentRenderHandle: class extends ComponentRenderHandle {
            toString() {
                if (!this.didRender) {
                    throw new Error(ERR_COMP_HANDLE_UNRENDERED);
                }
                return `<template id="${this.component[ID]}">${this.renderResult}</template>`
            }
        } 
    }) {
        
    }
}