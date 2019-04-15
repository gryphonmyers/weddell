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
            * [.onFirstRender()](#Weddell.Component+onFirstRender) ⇒ <code>Promise</code>
            * [.bindEvent(funcText, opts)](#Weddell.Component+bindEvent)
            * [.bindEventValue(propName, opts)](#Weddell.Component+bindEventValue)
            * [.getMountedChildComponents()](#Weddell.Component+getMountedChildComponents) ⇒ <code>Array.&lt;WeddellComponent&gt;</code>
        * _static_
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
Class representing a Weddell component. A component encapsulates some combination of scripts, markup and/or styles into a instanceable custom tag.

**Kind**: static class of [<code>Weddell</code>](#Weddell)  

* *[.Component](#Weddell.Component)*
    * [new WeddellComponent(opts)](#new_Weddell.Component_new)
    * _instance_
        * [.onFirstRender()](#Weddell.Component+onFirstRender) ⇒ <code>Promise</code>
        * [.bindEvent(funcText, opts)](#Weddell.Component+bindEvent)
        * [.bindEventValue(propName, opts)](#Weddell.Component+bindEventValue)
        * [.getMountedChildComponents()](#Weddell.Component+getMountedChildComponents) ⇒ <code>Array.&lt;WeddellComponent&gt;</code>
    * _static_
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
<a name="Weddell.Component+onFirstRender"></a>

#### component.onFirstRender() ⇒ <code>Promise</code>
Component lifecycle hook method that can be overridden. onFirstRender is called the first time the component is ever rendered, but not on subsequent rerenders. Returning a promise will defer rendering (not advised unless you know what you are doing).

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
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
Syntax sugar method very similar to bindEvent, but slightly less verbose for DOM elements with a value (inputs, etc) that you will like to bind to component state.

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
<a name="Weddell.Component+getMountedChildComponents"></a>

#### component.getMountedChildComponents() ⇒ <code>Array.&lt;WeddellComponent&gt;</code>
Queries the component tree for components that are currently mounted (rendered and typically in DOM or soon-to-be in DOM).

**Kind**: instance method of [<code>Component</code>](#Weddell.Component)  
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

