## Classes

<dl>
<dt><a href="#WeddellApp">WeddellApp</a></dt>
<dd></dd>
<dt><a href="#WeddellStore">WeddellStore</a></dt>
<dd></dd>
<dt><a href="#Weddell">Weddell</a></dt>
<dd><p>Weddell class</p>
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

<a name="WeddellApp"></a>

## WeddellApp
**Kind**: global class  

* [WeddellApp](#WeddellApp)
    * [new WeddellApp(opts)](#new_WeddellApp_new)
    * [.onPatch()](#WeddellApp+onPatch) ⇒ <code>Promise</code>
    * [.awaitComponentMount(id)](#WeddellApp+awaitComponentMount) ⇒ <code>Promise.&lt;WeddellComponent&gt;</code>
    * [.awaitPatch()](#WeddellApp+awaitPatch) ⇒ <code>Promise</code>
    * [.awaitNextPatch()](#WeddellApp+awaitNextPatch) ⇒ <code>Promise</code>
    * [.renderSnapshot()](#WeddellApp+renderSnapshot) ⇒ [<code>WeddellAppStateSnapshot</code>](#WeddellAppStateSnapshot)
    * [.init(initObj)](#WeddellApp+init) ⇒ <code>Promise</code>
    * ["createcomponent"](#WeddellApp+event_createcomponent)
    * ["createrootcomponent"](#WeddellApp+event_createrootcomponent)
    * ["patch"](#WeddellApp+event_patch)

<a name="new_WeddellApp_new"></a>

### new WeddellApp(opts)
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
<a name="WeddellApp+onPatch"></a>

### weddellApp.onPatch() ⇒ <code>Promise</code>
Hook method that may be overridden and will be executed at the end of every DOM patch.

**Kind**: instance method of [<code>WeddellApp</code>](#WeddellApp)  
**Returns**: <code>Promise</code> - Subsequent patches may be deferred by returning a Promise in this method.  
<a name="WeddellApp+awaitComponentMount"></a>

### weddellApp.awaitComponentMount(id) ⇒ <code>Promise.&lt;WeddellComponent&gt;</code>
Returns a promise the resolves with a weddell component once the component with the specified id has been rendered and mounted (not necessarily patched to DOM yet). Note that if the component id does not match any current or future components, the returned promise will never resolve.

**Kind**: instance method of [<code>WeddellApp</code>](#WeddellApp)  
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

<a name="WeddellApp+awaitPatch"></a>

### weddellApp.awaitPatch() ⇒ <code>Promise</code>
Returns a promise that will resolve after pending patch completes, or immediately if no patch is currently queued or in progress.

**Kind**: instance method of [<code>WeddellApp</code>](#WeddellApp)  
<a name="WeddellApp+awaitNextPatch"></a>

### weddellApp.awaitNextPatch() ⇒ <code>Promise</code>
Returns a promise that will resolve after current pending patch or the next patch completes.

**Kind**: instance method of [<code>WeddellApp</code>](#WeddellApp)  
<a name="WeddellApp+renderSnapshot"></a>

### weddellApp.renderSnapshot() ⇒ [<code>WeddellAppStateSnapshot</code>](#WeddellAppStateSnapshot)
Dumps the current application state to a snapshot object.

**Kind**: instance method of [<code>WeddellApp</code>](#WeddellApp)  
<a name="WeddellApp+init"></a>

### weddellApp.init(initObj) ⇒ <code>Promise</code>
Initializes the app, rendering the root component and mounting it into the specified DOM element.

**Kind**: instance method of [<code>WeddellApp</code>](#WeddellApp)  
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

<a name="WeddellApp+event_createcomponent"></a>

### "createcomponent"
**Kind**: event emitted by [<code>WeddellApp</code>](#WeddellApp)  
**Properties**

<table>
  <thead>
    <tr>
      <th>Name</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>component</td><td><code>WeddellComponent</code></td>
    </tr>  </tbody>
</table>

<a name="WeddellApp+event_createrootcomponent"></a>

### "createrootcomponent"
**Kind**: event emitted by [<code>WeddellApp</code>](#WeddellApp)  
**Properties**

<table>
  <thead>
    <tr>
      <th>Name</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>component</td><td><code>WeddellComponent</code></td>
    </tr>  </tbody>
</table>

<a name="WeddellApp+event_patch"></a>

### "patch"
**Kind**: event emitted by [<code>WeddellApp</code>](#WeddellApp)  
<a name="WeddellStore"></a>

## WeddellStore
**Kind**: global class  
<a name="new_WeddellStore_new"></a>

### new WeddellStore(data, opts)
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
    <td>[opts.overrides]</td><td><code><a href="#WeddellStore">Array.&lt;WeddellStore&gt;</a></code></td><td></td><td></td>
    </tr><tr>
    <td>[opts.proxies]</td><td><code><a href="#WeddellStore">Array.&lt;WeddellStore&gt;</a></code></td><td></td><td></td>
    </tr><tr>
    <td>[opts.extends]</td><td><code><a href="#WeddellStore">Array.&lt;WeddellStore&gt;</a></code></td><td></td><td></td>
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

<a name="Weddell"></a>

## *Weddell*
Weddell class

**Kind**: global abstract class  

* *[Weddell](#Weddell)*
    * *[.Component](#Weddell.Component)*
        * [new WeddellComponent(opts)](#new_Weddell.Component_new)
        * [.onFirstRender()](#Weddell.Component+onFirstRender) ⇒ <code>Promise</code>
    * *[.App](#Weddell.App) : <code>object</code>*
    * *[.Store](#Weddell.Store) : <code>object</code>*
    * *[.plugin(pluginObj)](#Weddell.plugin)*

<a name="Weddell.Component"></a>

### *Weddell.Component*
Class representing a Weddell component. A component represents encapsulates some combination of scripts, markup and/or styles into a instanceable custom tag.

**Kind**: static class of [<code>Weddell</code>](#Weddell)  

* *[.Component](#Weddell.Component)*
    * [new WeddellComponent(opts)](#new_Weddell.Component_new)
    * [.onFirstRender()](#Weddell.Component+onFirstRender) ⇒ <code>Promise</code>

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
<a name="Weddell.App"></a>

### *Weddell.App : <code>object</code>*
An app, which owns and manages a root component in the DOM. The Weddell app object is the main entrypoint to your application.

**Kind**: static namespace of [<code>Weddell</code>](#Weddell)  
<a name="Weddell.Store"></a>

### *Weddell.Store : <code>object</code>*
**Kind**: static namespace of [<code>Weddell</code>](#Weddell)  
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

