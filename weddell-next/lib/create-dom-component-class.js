class ComponentDomRenderHandle extends ComponentRenderHandle {
    toString() {
        return `<template id="${this.component[ID]}"></template>`
    }


    mount(parent) {
        const newTemplate = document.createElement('template');
        newTemplate.innerHTML = this.result;
        this.component[DOM] = newTemplate;

        const templateMountPoint = parent[DOM].getElementByID(this.component[ID]);
        templateMountPoint.parentNode.insertBefore(newTemplate.content.cloneNode(true), templateMountPoint);
    }
}