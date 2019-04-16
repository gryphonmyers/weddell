## Classes

<dl>
<dt><a href="#Weddell">Weddell</a></dt>
<dd><p>Top-level Weddell class serving as an entrypoint to various APIs.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#CssString">CssString</a> : <code>String</code></dt>
<dd><p>A string of valid CSS style declarations.</p>
</dd>
<dt><a href="#HtmlString">HtmlString</a> : <code>String</code></dt>
<dd><p>A string of valid HTML.</p>
</dd>
<dt><a href="#WeddellAppStateSnapshot">WeddellAppStateSnapshot</a> : <code>Object</code></dt>
<dd><p>A snapshot of a Weddell app. This value is ready for serialization, allowing for later rehydration of application state.</p>
</dd>
<dt><a href="#WeddellComponentMixin">WeddellComponentMixin</a> ⇒ <code>function</code></dt>
<dd></dd>
<dt><a href="#StylesCallback">StylesCallback</a> ⇒ <code>String</code></dt>
<dd></dd>
<dt><a href="#DomCreateEvtObj">DomCreateEvtObj</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#DomDestroyEvtObj">DomDestroyEvtObj</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#DomChangeEvtObj">DomChangeEvtObj</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#VirtualDomTemplate">VirtualDomTemplate</a> ⇒ <code><a href="#VirtualNode">VirtualNode</a></code></dt>
<dd></dd>
<dt><a href="#VirtualNode">VirtualNode</a> : <code>object</code></dt>
<dd><p>A virtual node object, as implemented by the virtual-dom library.</p>
</dd>
<dt><a href="#WeddellPlugin">WeddellPlugin</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="Weddell"></a>

## *Weddell*
Top-level Weddell class serving as an entrypoint to various APIs.

**Kind**: global abstract class  

* *[Weddell](#Weddell)*
    * *[.App](#Weddell.App)*
        * [new WeddellApp(opts)](#new_Weddell.App_new)
        * [.init(initObj)](#Weddell.App+init) ⇒ <code>Promise</code>
        * [.onPatch()](#Weddell.App+onPatch) ⇒ <code>Promise</code>
        * [.awaitComponentMount(id)](#Weddell.App+awaitComponentMount) ⇒ <code>Promise.&lt;WeddellComponent&gt;</code>
        * [.awaitPatch()](#Weddell.App+awaitPatch) ⇒ <code>Promise</code>
        * [.awaitNextPatch()](#Weddell.App+awaitNextPatch) ⇒ <code>Promise</code>
        * [.renderSnapshot()](#Weddell.App+renderSnapshot) ⇒ [<code>WeddellAppStateSnapshot</code>](#WeddellAppStateSnapshot)
    * *[.Component](#Weddell.Component)*
        * [new WeddellComponent(opts)](#new_Weddell.Component_new)
        * _instance_
            * [.onInit()](#Weddell.Component+onInit) ⇒ <code>Promise</code> \| <code>void</code>
            * [.onFirstRender()](#Weddell.Component+onFirstRender) ⇒ <code>Promise</code> \| <code>void</code>
            * [.onRender()](#Weddell.Component+onRender) ⇒ <code>Promise</code> \| <code>void</code>
            * [.onRenderMarkup()](#Weddell.Component+onRenderMarkup) ⇒ <code>Promise</code> \| <code>void</code>
            * [.onRenderStyles()](#Weddell.Component+onRenderStyles) ⇒ <code>Promise</code> \| <code>void</code>
            * [.onDOMCreate(evt)](#Weddell.Component+onDOMCreate) ⇒ <code>void</code>
            * [.onDOMMove(evt)](#Weddell.Component+onDOMMove) ⇒ <code>void</code>
            * [.onDOMChange(evt)](#Weddell.Component+onDOMChange) ⇒ <code>void</code>
            * [.onDOMCreateOrChange(evt)](#Weddell.Component+onDOMCreateOrChange) ⇒ <code>void</code>
            * [.onDOMDestroy(evt)](#Weddell.Component+onDOMDestroy) ⇒ <code>void</code>
            * [.bindEvent(funcText, opts)](#Weddell.Component+bindEvent)
            * [.bindEventValue(propName, opts)](#Weddell.Component+bindEventValue)
            * [.walkComponents(callback, [filterFunc])](#Weddell.Component+walkComponents)
            * [.reduceComponents(callback, initialVal, [filterFunc])](#Weddell.Component+reduceComponents) ⇒ <code>\*</code>
            * [.reduceParents(callback, initialVal)](#Weddell.Component+reduceParents) ⇒ <code>\*</code>
            * [.collectComponentTree()](#Weddell.Component+collectComponentTree) ⇒ <code>object</code>
            * [.getMountedChildComponents()](#Weddell.Component+getMountedChildComponents) ⇒ <code>Array.&lt;WeddellComponent&gt;</code>
            * [.queryDOM(query)](#Weddell.Component+queryDOM) ⇒ <code>Promise.&lt;(Element\|null)&gt;</code>
            * [.queryDOMAll(query)](#Weddell.Component+queryDOMAll) ⇒ <code>Promise.&lt;NodeListOf.&lt;Element&gt;&gt;</code>
            * [.awaitEvent(eventName)](#Weddell.Component+awaitEvent) ⇒ <code>Promise</code>
            * [.awaitPatch()](#Weddell.Component+awaitPatch) ⇒ <code>Promise</code>
            * [.awaitMount()](#Weddell.Component+awaitMount) ⇒ <code>Promise</code>
            * [.awaitDom()](#Weddell.Component+awaitDom) ⇒ <code>Promise.&lt;Element&gt;</code>
            * [.awaitRender()](#Weddell.Component+awaitRender) ⇒ <code>Promise</code>
        * _static_
            * [.state](#Weddell.Component.state) : <code>object</code>
            * [.consts](#Weddell.Component.consts) : <code>object</code>
            * [.styles](#Weddell.Component.styles) ⇒ <code>Array.&lt;(StylesCallback\|String)&gt;</code> \| <code>String</code>
            * [.components](#Weddell.Component.components) : <code>Object.&lt;string, WeddellComponentMixin&gt;</code>
            * [.markup](#Weddell.Component.markup) : [<code>VirtualDomTemplate</code>](#VirtualDomTemplate)
            * [.isWeddellComponent](#Weddell.Component.isWeddellComponent)
    * *[.Store](#Weddell.Store)*
        * [new WeddellStore(data, opts)](#new_Weddell.Store_new)
    * *[.plugin(pluginObj)](#Weddell.plugin)*

<a name="Weddell.App"></a>

### *Weddell.App*
An app, which owns and manages a root component in the DOM. The Weddell app object is the main entrypoint to your application.

**Kind**: static class of [<code>Weddell</code>](#Weddell)  

* *[.App](#Weddell.App)*
    * [new WeddellApp(opts)](#new_Weddell.App_new)
    * [.init(initObj)](#Weddell.App+init) ⇒ <code>Promise</code>
    * [.onPatch()](#Weddell.App+onPatch) ⇒ <code>Promise</code>
    * [.awaitComponentMount(id)](#Weddell.App+awaitComponentMount) ⇒ <code>Promise.&lt;WeddellComponent&gt;</code>
    * [.awaitPatch()](#Weddell.App+awaitPatch) ⇒ <code>Promise</code>
    * [.awaitNextPatch()](#Weddell.App+awaitNextPatch) ⇒ <code>Promise</code>
    * [.renderSnapshot()](#Weddell.App+renderSnapshot) ⇒ [<code>WeddellAppStateSnapshot</code>](#WeddellAppStateSnapshot)

<a name="new_Weddell.App_new"></a>

#### new WeddellApp(opts)
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>opts</td><td><code>object</code></td><td></td><td></td>
    </tr><tr>
    <td>opts.el</td><td><code>String</code> | <code>Element</code></td><td></td><td><p>Element to mount app into, or a DOM query string that should resolve to a single element.</p>
</td>
    </tr><tr>
    <td>opts.Component</td><td><code>function</code></td><td></td><td><p>A Weddell component class factory. This component will be mounted as the root into the mount point specified in the</p>
</td>
    </tr><tr>
    <td>[opts.quietInterval]</td><td><code>number</code></td><td><code>100</code></td><td><p>Delay between DOM patches to wait before firing the &quot;quiet&quot; event.</p>
</td>
    </tr><tr>
    <td>[opts.styles]</td><td><code><a href="#CssString">CssString</a></code></td><td></td><td><p>App styles that will be rendered to the DOM once the app initializes.</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
const App = require('weddell').classes.App;

var app = new App({
    routes,
    el: '#app',
    Component: class MyWeddellComponent {},
    styles: `
      .my-weddell-component {
        color: red;
      }
    `
});

app.init();
```
<a name="Weddell.App+init"></a>

#### app.init(initObj) ⇒ <code>Promise</code>
Initializes the app, rendering the root component and mounting it into the specified DOM element.

**Kind**: instance method of [<code>App</code>](#Weddell.App)  
**Returns**: <code>Promise</code> - Promise that resolves once the app has fully initialized and rendered into the DOM.  
**Emits**: <code>Window#event:weddellinit Event fired on window object once initialization completes.</code>, <code>WeddellApp#event:createcomponent Event fired on app object whenever its root component or any child components are created.</code>, <code>WeddellApp#event:createrootcomponent Event fired on app object whenever its root component is created.</code>  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>initObj</td><td><code>Object</code></td><td><p>Object with initialization options.</p>
</td>
    </tr>  </tbody>
</table>

<a name="Weddell.App+onPatch"></a>

#### app.onPatch() ⇒ <code>Promise</code>
Hook method that may be overridden and will be executed at the end of every DOM patch.

**Kind**: instance method of [<code>App</code>](#Weddell.App)  
**Returns**: <code>Promise</code> - Subsequent patches may be deferred by returning a Promise in this method.  
<a name="Weddell.App+awaitComponentMount"></a>

#### app.awaitComponentMount(id) ⇒ <code>Promise.&lt;WeddellComponent&gt;</code>
Returns a promise the resolves with a weddell component once the component with the specified id has been rendered and mounted (not necessarily patched to DOM yet). Note that if the component id does not match any current or future components, the returned promise will never resolve.

**Kind**: instance method of [<code>App</code>](#Weddell.App)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>id</td><td><code>string</code></td><td><p>Component id to wait for</p>
</td>
    </tr>  </tbody>
</table>

<a name="Weddell.App+awaitPatch"></a>

#### app.awaitPatch() ⇒ <code>Promise</code>
Returns a promise that will resolve after pending patch completes, or immediately if no patch is currently queued or in progress.

**Kind**: instance method of [<code>App</code>](#Weddell.App)  
<a name="Weddell.App+awaitNextPatch"></a>

#### app.awaitNextPatch() ⇒ <code>Promise</code>
Returns a promise that will resolve after current pending patch or the next patch completes.

**Kind**: instance method of [<code>App</code>](#Weddell.App)  
<a name="Weddell.App+renderSnapshot"></a>

#### app.renderSnapshot() ⇒ [<code>WeddellAppStateSnapshot</code>](#WeddellAppStateSnapshot)
Dumps the current application state to a snapshot object, typically used for server-side rendering setups.

**Kind**: instance method of [<code>App</code>](#Weddell.App)  
<a name="Weddell.Component"></a>

### *Weddell.Component*
Class representing a Weddell component. A component encapsulates some combination of scripts, markup and/or styles into an instantiable custom tag.

**Kind**: static class of [<code>Weddell</code>](#Weddell)  

* *[.Component](#Weddell.Component)*
    * [new WeddellComponent(opts)](#new_Weddell.Component_new)
    * _instance_
        * [.onInit()](#Weddell.Component+onInit) ⇒ <code>Promise</code> \| <code>void</code>
        * [.onFirstRender()](#Weddell.Component+onFirstRender) ⇒ <code>Promise</code> \| <code>void</code>
        * [.onRender()](#Weddell.Component+onRender) ⇒ <code>Promise</code> \| <code>void</code>
        * [.onRenderMarkup()](#Weddell.Component+onRenderMarkup) ⇒ <code>Promise</code> \| <code>void</code>
        * [.onRenderStyles()](#Weddell.Component+onRenderStyles) ⇒ <code>Promise</code> \| <code>void</code>
        * [.onDOMCreate(evt)](#Weddell.Component+onDOMCreate) ⇒ <code>void</code>
        * [.onDOMMove(evt)](#Weddell.Component+onDOMMove) ⇒ <code>void</code>
        * [.onDOMChange(evt)](#Weddell.Component+onDOMChange) ⇒ <code>void</code>
        * [.onDOMCreateOrChange(evt)](#Weddell.Component+onDOMCreateOrChange) ⇒ <code>void</code>
        * [.onDOMDestroy(evt)](#Weddell.Component+onDOMDestroy) ⇒ <code>void</code>
        * [.bindEvent(funcText, opts)](#Weddell.Component+bindEvent)
        * [.bindEventValue(propName, opts)](#Weddell.Component+bindEventValue)
        * [.walkComponents(callback, [filterFunc])](#Weddell.Component+walkComponents)
        * [.reduceComponents(callback, initialVal, [filterFunc])](#Weddell.Component+reduceComponents) ⇒ <code>\*</code>
        * [.reduceParents(callback, initialVal)](#Weddell.Component+reduceParents) ⇒ <code>\*</code>
        * [.collectComponentTree()](#Weddell.Component+collectComponentTree) ⇒ <code>object</code>
        * [.getMountedChildComponents()](#Weddell.Component+getMountedChildComponents) ⇒ <code>Array.&lt;WeddellComponent&gt;</code>
        * [.queryDOM(query)](#Weddell.Component+queryDOM) ⇒ <code>Promise.&lt;(Element\|null)&gt;</code>
        * [.queryDOMAll(query)](#Weddell.Component+queryDOMAll) ⇒ <code>Promise.&lt;NodeListOf.&lt;Element&gt;&gt;</code>
        * [.awaitEvent(eventName)](#Weddell.Component+awaitEvent) ⇒ <code>Promise</code>
        * [.awaitPatch()](#Weddell.Component+awaitPatch) ⇒ <code>Promise</code>
        * [.awaitMount()](#Weddell.Component+awaitMount) ⇒ <code>Promise</code>
        * [.awaitDom()](#Weddell.Component+awaitDom) ⇒ <code>Promise.&lt;Element&gt;</code>
        * [.awaitRender()](#Weddell.Component+awaitRender) ⇒ <code>Promise</code>
    * _static_
        * [.state](#Weddell.Component.state) : <code>object</code>
        * [.consts](#Weddell.Component.consts) : <code>object</code>
        * [.styles](#Weddell.Component.styles) ⇒ <code>Array.&lt;(StylesCallback\|String)&gt;</code> \| <code>String</code>
        * [.components](#Weddell.Component.components) : <code>Object.&lt;string, WeddellComponentMixin&gt;</code>
        * [.markup](#Weddell.Component.markup) : [<code>VirtualDomTemplate</code>](#VirtualDomTemplate)
        * [.isWeddellComponent](#Weddell.Component.isWeddellComponent)

<a name="new_Weddell.Component_new"></a>

#### new WeddellComponent(opts)
Constructs a Weddell Component. One does not generally instantiate components directly, but rather through the use of markup tags. This information is available primarily for the purposes of plugin authorship.

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>opts</td><td><code>object</code></td><td></td>
    </tr><tr>
    <td>opts.consts</td><td><code>object</code></td><td><p>Base consts object that will be merged into static store declaration.</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
WeddellComponent => class MyComponent extends WeddellComponent {

 static get styles() {
     return `
         .my-component-class {
             color: red;
         }
     `
 }
 static get markup() {
     return (locals, h) =>
         h('div.my-component-class', [
             h('h1', [
                 locals.myContent
             ])
         ])
 }

 static get state() {
     return {
         myContent: 'foobar'
     }
 }

}

// Note that in most cases, what you are supplying in your app and / or child components is a component reference itself, but a factory function that will receive the base WeddellComponent class. The WeddellComponent class should never be required directly. 
```
<a name="Weddell.Component+onInit"></a>

#### component.onInit() ⇒ <code>Promise</code> \| <code>void</code>
Component lifecycle hook method that may be overridden. Called whenever a component instance finishes initializing. Returning a promise will defer completion of the init process.

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
<a name="Weddell.Component+onFirstRender"></a>

#### component.onFirstRender() ⇒ <code>Promise</code> \| <code>void</code>
Component lifecycle hook method that may be overridden. Called the first time the component is ever rendered, but not on subsequent rerenders. Returning a promise will defer rendering (not advised unless you know what you are doing).

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
<a name="Weddell.Component+onRender"></a>

#### component.onRender() ⇒ <code>Promise</code> \| <code>void</code>
Component lifecycle hook method that may be overridden. Called after the component finishes rendering. Returning a promise will defer completion of the render process (not advised unless you know what you are doing).

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
<a name="Weddell.Component+onRenderMarkup"></a>

#### component.onRenderMarkup() ⇒ <code>Promise</code> \| <code>void</code>
Component lifecycle hook method that may be overridden. Called after the component finishes rendering markup as part of its rendering process. Returning a promise will defer completion of the markup render process, and thus the render process as a whole (not advised unless you know what you are doing).

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
<a name="Weddell.Component+onRenderStyles"></a>

#### component.onRenderStyles() ⇒ <code>Promise</code> \| <code>void</code>
Component lifecycle hook method that may be overridden. Called after the component finishes rendering styles as part of its rendering process. Returning a promise will defer completion of the styles render process, and thus the render process as a whole (not advised unless you know what you are doing).

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
<a name="Weddell.Component+onDOMCreate"></a>

#### component.onDOMCreate(evt) ⇒ <code>void</code>
Component lifecycle hook method that may be overridden. Called when a DOM element is created and set to this component's 'el' property.

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>evt</td><td><code><a href="#DomCreateEvtObj">DomCreateEvtObj</a></code></td>
    </tr>  </tbody>
</table>

<a name="Weddell.Component+onDOMMove"></a>

#### component.onDOMMove(evt) ⇒ <code>void</code>
Component lifecycle hook method that may be overridden. Called when the DOM element associated with this component moves to a new location in the DOM.

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>evt</td><td><code><a href="#DomChangeEvtObj">DomChangeEvtObj</a></code></td>
    </tr>  </tbody>
</table>

<a name="Weddell.Component+onDOMChange"></a>

#### component.onDOMChange(evt) ⇒ <code>void</code>
Component lifecycle hook method that may be overridden. Called when the DOM element associated with this component changes.

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>evt</td><td><code><a href="#DomChangeEvtObj">DomChangeEvtObj</a></code></td>
    </tr>  </tbody>
</table>

<a name="Weddell.Component+onDOMCreateOrChange"></a>

#### component.onDOMCreateOrChange(evt) ⇒ <code>void</code>
Component lifecycle hook method that may be overridden. Called either when a new DOM element is created for this component, or when the DOM element associated with it changes.

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>evt</td><td><code><a href="#DomChangeEvtObj">DomChangeEvtObj</a></code></td>
    </tr>  </tbody>
</table>

<a name="Weddell.Component+onDOMDestroy"></a>

#### component.onDOMDestroy(evt) ⇒ <code>void</code>
Component lifecycle hook method that may be overridden. Called when a DOM element that was previously associated with this component is destroyed.

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>evt</td><td><code><a href="#DomDestroyEvtObj">DomDestroyEvtObj</a></code></td>
    </tr>  </tbody>
</table>

<a name="Weddell.Component+bindEvent"></a>

#### component.bindEvent(funcText, opts)
Binds a function body string to the scope of this component. This string will then typically be used in a native DOM event handler attribute.

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>funcText</td><td><code>String</code></td><td></td><td></td>
    </tr><tr>
    <td>opts</td><td><code>object</code></td><td></td><td></td>
    </tr><tr>
    <td>[opts.preventDefault]</td><td><code>object</code></td><td><code>false</code></td><td><p>If true, resulting event handler will invoke event.preventDefault before executing function code.</p>
</td>
    </tr><tr>
    <td>[opts.stopPropagation]</td><td><code>object</code></td><td><code>false</code></td><td><p>If true, resulting event handler will invoke event.stopPropagation before executing function code.</p>
</td>
    </tr>  </tbody>
</table>

**Example** *(Not a standard use case)*  
```js

component.el.onclick = component.bindEvent('console.log(this.id)');
component.el.click();
console.log(component.id)

// myId
// myId
```
**Example** *(This function is also proxied onto component state as &#x27;$bind&#x27;)*  
```js

class MyComponentClass {
 static get markup(locals, h) {
     return h('div', {
         attributes: {
             onclick: locals.$bind('console.log(this.id)')
         }
     });
 }
}

//Once a component instance has been mounted, assuming we have an reference to it...

myComponentInstance.el.click();

// myId
```
<a name="Weddell.Component+bindEventValue"></a>

#### component.bindEventValue(propName, opts)
Syntax sugar method very similar to bindEvent, but slightly less verbose for DOM elements with a value (inputs, etc) that you would like to bind to component state.

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>propName</td><td><code>String</code></td><td><p>Property name in component state to bind to.</p>
</td>
    </tr><tr>
    <td>opts</td><td><code>object</code></td><td><p>See bindEvent opts.</p>
</td>
    </tr>  </tbody>
</table>

**Example** *(As with bindEvent, bindEventValue is also proxied into component state object as &#x27;$bindValue&#x27;.)*  
```js

class MyComponentClass {

 static get state() {
     return {
         myInputValue: null
     }
 }

 static get markup(locals, h) {
     return h('input', {
         attributes: {
             onchange: locals.$bindValue('myInputValue')
         }
     });
 }
}

//Once a component instance has been mounted, assuming we have an reference to it...

console.log(myComponentInstance.state.myInputValue);

// null

// The user enters the text 'Tiny Tigers' into the input field in browser...

console.log(myComponentInstance.state.myInputValue);

// Tiny Tigers
```
<a name="Weddell.Component+walkComponents"></a>

#### component.walkComponents(callback, [filterFunc])
Calls the specified callback for this component and all child components.

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
**Todo**

- Document callback param structure

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>callback</td><td><code>function</code></td><td><p>Reducer function to use.</p>
</td>
    </tr><tr>
    <td>[filterFunc]</td><td><code>function</code></td><td><p>Filter function to exclude some components</p>
</td>
    </tr>  </tbody>
</table>

<a name="Weddell.Component+reduceComponents"></a>

#### component.reduceComponents(callback, initialVal, [filterFunc]) ⇒ <code>\*</code>
Calls the specified reducer for this component and all child components.

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
**Todo**

- Document callback param structure

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>callback</td><td><code>function</code></td><td><p>Reducer function to use.</p>
</td>
    </tr><tr>
    <td>initialVal</td><td><code>*</code></td><td><p>The initial value to use for the reduce function.</p>
</td>
    </tr><tr>
    <td>[filterFunc]</td><td><code>function</code></td><td><p>Filter function to exclude some components</p>
</td>
    </tr>  </tbody>
</table>

<a name="Weddell.Component+reduceParents"></a>

#### component.reduceParents(callback, initialVal) ⇒ <code>\*</code>
Calls the specified reducer recursively for all parent components upward from this one.

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>callback</td><td><code>function</code></td><td><p>Reducer function to use.</p>
</td>
    </tr><tr>
    <td>initialVal</td><td><code>*</code></td><td><p>The initial value to use for the reduce function.</p>
</td>
    </tr>  </tbody>
</table>

<a name="Weddell.Component+collectComponentTree"></a>

#### component.collectComponentTree() ⇒ <code>object</code>
Performs a recursive scan upward from this component, to the application's root component.

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
**Todo**

- Document this more thoroughly

<a name="Weddell.Component+getMountedChildComponents"></a>

#### component.getMountedChildComponents() ⇒ <code>Array.&lt;WeddellComponent&gt;</code>
Queries the component tree for components that are currently mounted (rendered and typically in DOM or soon-to-be in DOM).

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
<a name="Weddell.Component+queryDOM"></a>

#### component.queryDOM(query) ⇒ <code>Promise.&lt;(Element\|null)&gt;</code>
Returns a promise that will resolve with the result of querying this component's DOM element using querySelector, once the component has a DOM element to query.

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>query</td><td><code>string</code></td><td><p>A DOM query, as expected by Element#querySelector.</p>
</td>
    </tr>  </tbody>
</table>

<a name="Weddell.Component+queryDOMAll"></a>

#### component.queryDOMAll(query) ⇒ <code>Promise.&lt;NodeListOf.&lt;Element&gt;&gt;</code>
Returns a promise that will resolve with the result of querying this component's DOM element using querySelectorAll, once the component has a DOM element to query.

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>query</td><td><code>string</code></td><td><p>A DOM query, as expected by Element#querySelectorAll.</p>
</td>
    </tr>  </tbody>
</table>

<a name="Weddell.Component+awaitEvent"></a>

#### component.awaitEvent(eventName) ⇒ <code>Promise</code>
Returns a promise that will resolve once this component fires a specific event.

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>eventName</td><td><code>string</code></td><td><p>The name of the event to wait for.</p>
</td>
    </tr>  </tbody>
</table>

<a name="Weddell.Component+awaitPatch"></a>

#### component.awaitPatch() ⇒ <code>Promise</code>
Returns a promise that will resolve once this component has finished rendering, and the next application patch has completed (which should mean all state changes have been propagated to the DOM).

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
<a name="Weddell.Component+awaitMount"></a>

#### component.awaitMount() ⇒ <code>Promise</code>
Returns a promise that will resolve once this component mounts (or immediately, if it is already mounted). Note that mounting does not necessarily mean that application changes have been propagated to the DOM.

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
<a name="Weddell.Component+awaitDom"></a>

#### component.awaitDom() ⇒ <code>Promise.&lt;Element&gt;</code>
Returns a promise that will resolve once a DOM element has been created for this component (or immediately, if it already has one). The promise is resolved with this component's DOM element.

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
<a name="Weddell.Component+awaitRender"></a>

#### component.awaitRender() ⇒ <code>Promise</code>
Returns a promise that will resolve once the pending render promise has completed (or immediately, if there is no pending render promise).

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
<a name="Weddell.Component.state"></a>

#### Component.state : <code>object</code>
Stub property. Typically, components override this property, returning the keys and default state values. When a component is initialized, it will use this object when creating its own local transient state object. Once initialized, subsequent changes to any key in the WeddellComponent#state object will trigger component rerenders -> DOM patches.

**Kind**: static property of [<code>Component</code>](#Weddell.Component)  
**Todo**

- Example showing merging values with super
- Example showing computed functions
- Example demonstrating serializability constraints.

<a name="Weddell.Component.consts"></a>

#### Component.consts : <code>object</code>
Stub property. Typically, components with constant helper values will override this property. These values will be proxied onto the component instance's 'state' property.

**Kind**: static property of [<code>Component</code>](#Weddell.Component)  
**Todo**

- Example showing const availability on state object.

<a name="Weddell.Component.styles"></a>

#### Component.styles ⇒ <code>Array.&lt;(StylesCallback\|String)&gt;</code> \| <code>String</code>
Stub property. Typically, components with custom CSS styles will override this property. Styles returned here will be dynamically inserted into style elements in the DOM's head element when needed. Strings will be applied on a per-class basis (one copy for all component instances), while functions will be executed as a style template on a per-instance basis.

**Kind**: static property of [<code>Component</code>](#Weddell.Component)  
<a name="Weddell.Component.components"></a>

#### Component.components : <code>Object.&lt;string, WeddellComponentMixin&gt;</code>
Stub property. Typically, components with child components will override this property, supplying component mixins that can then be included in the component's markup template by the entry key.

**Kind**: static property of [<code>Component</code>](#Weddell.Component)  
**Todo**

- supply example utilizing content tag directive
- supply example demonstrating nested child tag scoping
- example showing static parent -> child state binding
- example showing custom event handlers

**Example**  
```js
class MyComponent extends WeddellComponent {
 static get markup(locals, h) {
     return h('.foo', [
         h('my-child-component')
     ]);
 }

 static get components() {
     return {
         'my-child-component': Component => class extends Component {
             static get markup(locals, h) {
                 return h('.bar', ['bar']);
             }
         }
     }
 }
}

// will render '<div class="foo"><div class="bar">bar</div></div>' into the DOM.
```
<a name="Weddell.Component.markup"></a>

#### Component.markup : [<code>VirtualDomTemplate</code>](#VirtualDomTemplate)
Stub property. Typically, components will override the markup property to provide their application's virtual dom template function.

**Kind**: static property of [<code>Component</code>](#Weddell.Component)  
<a name="Weddell.Component.isWeddellComponent"></a>

#### Component.isWeddellComponent
**Kind**: static property of [<code>Component</code>](#Weddell.Component)  
**Example**  
```js
console.log(MyWeddellComponentClass.isWeddellComponent)
// true
```
<a name="Weddell.Store"></a>

### *Weddell.Store*
Class representing a store of key/value pairs. The store class is primarily used to model application state.

**Kind**: static class of [<code>Weddell</code>](#Weddell)  
<a name="new_Weddell.Store_new"></a>

#### new WeddellStore(data, opts)
Constructs a store object. One does not generally require or implement the store module directly, but rather implicitly via the various store properties available on components.

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>data</td><td><code>object</code></td><td></td><td><p>Data to write to store.</p>
</td>
    </tr><tr>
    <td>opts</td><td><code>object</code></td><td></td><td></td>
    </tr><tr>
    <td>[opts.shouldEvalFunctions]</td><td><code>boolean</code></td><td><code>true</code></td><td></td>
    </tr><tr>
    <td>[opts.shouldMonitorChanges]</td><td><code>boolean</code></td><td><code>true</code></td><td></td>
    </tr><tr>
    <td>[opts.requireSerializable]</td><td><code>boolean</code></td><td><code>true</code></td><td></td>
    </tr><tr>
    <td>[opts.overrides]</td><td><code>Array.&lt;WeddellStore&gt;</code></td><td></td><td></td>
    </tr><tr>
    <td>[opts.proxies]</td><td><code>Array.&lt;WeddellStore&gt;</code></td><td></td><td></td>
    </tr><tr>
    <td>[opts.extends]</td><td><code>Array.&lt;WeddellStore&gt;</code></td><td></td><td></td>
    </tr><tr>
    <td>[opts.propertySets]</td><td><code>object</code></td><td></td><td></td>
    </tr><tr>
    <td>[opts.getTransform]</td><td><code>function</code></td><td></td><td></td>
    </tr><tr>
    <td>[opts.setTransform]</td><td><code>function</code></td><td></td><td></td>
    </tr><tr>
    <td>[opts.validators]</td><td><code>object</code></td><td></td><td></td>
    </tr><tr>
    <td>[opts.initialState]</td><td><code>object</code></td><td></td><td></td>
    </tr><tr>
    <td>[opts.inputMappings]</td><td><code>object</code></td><td></td><td></td>
    </tr>  </tbody>
</table>

<a name="Weddell.plugin"></a>

### *Weddell.plugin(pluginObj)*
Extends the base Weddell class with additional functionality, as defined in a plugin object.

**Kind**: static method of [<code>Weddell</code>](#Weddell)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>pluginObj</td><td><code><a href="#WeddellPlugin">WeddellPlugin</a></code></td><td><p>A plugin object to apply to the base Weddell class.</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
const Weddell = require('weddell');

const WeddellWithPluginApplied = Weddell.plugin({
 id: 'my-plugin',
 require: ['my-other-plugin'], // will error if app is initialized without 'my-other-plugin' also applied
 classes: {
     Component: Component => class extends Component {

         onMount() {
             console.log(this.myNewComponentMethod());
         }

         myNewComponentMethod() {
             this.foo = 'bar';
         }
     }
 },

 // Every component mounted by this app will print 'bar' to logs.
 
})
```
<a name="CssString"></a>

## CssString : <code>String</code>
A string of valid CSS style declarations.

**Kind**: global typedef  
**See**: https://developer.mozilla.org/en-US/docs/Web/CSS  
<a name="HtmlString"></a>

## HtmlString : <code>String</code>
A string of valid HTML.

**Kind**: global typedef  
**See**: https://developer.mozilla.org/en-US/docs/Web/HTML  
<a name="WeddellAppStateSnapshot"></a>

## WeddellAppStateSnapshot : <code>Object</code>
A snapshot of a Weddell app. This value is ready for serialization, allowing for later rehydration of application state.

**Kind**: global typedef  
**Properties**

<table>
  <thead>
    <tr>
      <th>Name</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>stateHtml</td><td><code><a href="#HtmlString">HtmlString</a></code></td><td><p>Application state, serialized to JSON with an event binding it to application init, all wrapped with a script tag, ready to be inserted into HTML files to allow for application restore.</p>
</td>
    </tr><tr>
    <td>stylesHtml</td><td><code><a href="#HtmlString">HtmlString</a></code></td><td><p>All Weddell style tags grouped together in an HTML string, and ready to be inserted into HTML head.</p>
</td>
    </tr><tr>
    <td>fullResponse</td><td><code><a href="#HtmlString">HtmlString</a></code></td><td><p>All HTML in document.</p>
</td>
    </tr><tr>
    <td>appHtml</td><td><code><a href="#HtmlString">HtmlString</a></code></td><td><p>All HTML currently rendered into application mount point.</p>
</td>
    </tr>  </tbody>
</table>

<a name="WeddellComponentMixin"></a>

## WeddellComponentMixin ⇒ <code>function</code>
**Kind**: global typedef  
**Returns**: <code>function</code> - Extended class (typically the base class with extensions applied).  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>Component</td><td><code>function</code></td><td><p>Base WeddellComponent class.</p>
</td>
    </tr>  </tbody>
</table>

<a name="StylesCallback"></a>

## StylesCallback ⇒ <code>String</code>
**Kind**: global typedef  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>locals</td><td><code>object</code></td>
    </tr>  </tbody>
</table>

<a name="DomCreateEvtObj"></a>

## DomCreateEvtObj : <code>object</code>
**Kind**: global typedef  
**Properties**

<table>
  <thead>
    <tr>
      <th>Name</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>el</td><td><code>Element</code> | <code>null</code></td><td><p>The DOM element that was created</p>
</td>
    </tr>  </tbody>
</table>

<a name="DomDestroyEvtObj"></a>

## DomDestroyEvtObj : <code>object</code>
**Kind**: global typedef  
**Properties**

<table>
  <thead>
    <tr>
      <th>Name</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>el</td><td><code>Element</code> | <code>null</code></td><td><p>The DOM element that was destroyed</p>
</td>
    </tr>  </tbody>
</table>

<a name="DomChangeEvtObj"></a>

## DomChangeEvtObj : <code>object</code>
**Kind**: global typedef  
**Properties**

<table>
  <thead>
    <tr>
      <th>Name</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>newEl</td><td><code>Element</code> | <code>null</code></td><td><p>The new DOM element that was created</p>
</td>
    </tr><tr>
    <td>prevEl</td><td><code>Element</code> | <code>null</code></td><td><p>The DOM element that was previously associated with this component</p>
</td>
    </tr>  </tbody>
</table>

<a name="VirtualDomTemplate"></a>

## VirtualDomTemplate ⇒ [<code>VirtualNode</code>](#VirtualNode)
**Kind**: global typedef  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>locals</td><td><code>object</code></td><td><p>Component state + helpers</p>
</td>
    </tr><tr>
    <td>h</td><td><code>function</code></td><td><p>hyperscript implementation</p>
</td>
    </tr>  </tbody>
</table>

<a name="VirtualNode"></a>

## VirtualNode : <code>object</code>
A virtual node object, as implemented by the virtual-dom library.

**Kind**: global typedef  
**See**: [https://github.com/Matt-Esch/virtual-dom](https://github.com/Matt-Esch/virtual-dom)  
<a name="WeddellPlugin"></a>

## WeddellPlugin : <code>object</code>
**Kind**: global typedef  
**Properties**

<table>
  <thead>
    <tr>
      <th>Name</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>id</td><td><code>string</code></td><td><p>Plugin id (for deduplication and dependency purposes).</p>
</td>
    </tr><tr>
    <td>requires</td><td><code>Array.&lt;string&gt;</code></td><td><p>Ids of other plugins that are required for this plugin to function.</p>
</td>
    </tr><tr>
    <td>classes</td><td><code>Array.&lt;object&gt;</code></td><td><p>Classes to override on the base Weddell module (keys as class names, values as classes).</p>
</td>
    </tr>  </tbody>
</table>

