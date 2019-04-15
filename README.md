## Modules

<dl>
<dt><a href="#module_weddell/app">weddell/app</a></dt>
<dd><p>WeddellApp module.</p>
</dd>
<dt><a href="#module_weddell/component">weddell/component</a></dt>
<dd><p>WeddellComponent module.</p>
</dd>
<dt><a href="#module_weddell">weddell</a></dt>
<dd><p>Base Weddell module.</p>
</dd>
</dl>

<a name="module_weddell/app"></a>

## weddell/app
WeddellApp module.


* [weddell/app](#module_weddell/app)
    * [WeddellApp](#exp_module_weddell/app--WeddellApp) ⏏
        * [new WeddellApp(opts)](#new_module_weddell/app--WeddellApp_new)
        * _instance_
            * [.onPatch()](#module_weddell/app--WeddellApp+onPatch) ⇒ <code>Promise</code>
            * [.awaitComponentMount(id)](#module_weddell/app--WeddellApp+awaitComponentMount) ⇒ <code>Promise.&lt;WeddellComponent&gt;</code>
            * [.awaitPatch()](#module_weddell/app--WeddellApp+awaitPatch) ⇒ <code>Promise</code>
            * [.awaitNextPatch()](#module_weddell/app--WeddellApp+awaitNextPatch) ⇒ <code>Promise</code>
            * [.renderSnapshot()](#module_weddell/app--WeddellApp+renderSnapshot) ⇒ <code>WeddellAppStateSnapshot</code>
            * [.init(initObj)](#module_weddell/app--WeddellApp+init) ⇒ <code>Promise</code>
        * _inner_
            * [~CssString](#module_weddell/app--WeddellApp..CssString) : <code>String</code>
            * [~HtmlString](#module_weddell/app--WeddellApp..HtmlString) : <code>String</code>
            * [~WeddellAppStateSnapshot](#module_weddell/app--WeddellApp..WeddellAppStateSnapshot) : <code>Object</code>

<a name="exp_module_weddell/app--WeddellApp"></a>

### WeddellApp ⏏
An app, which owns and manages a root component in the DOM. The Weddell app object is the main entrypoint to your application.

**Kind**: Exported class  
<a name="new_module_weddell/app--WeddellApp_new"></a>

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
    <td>[opts.styles]</td><td><code>CssString</code></td><td></td><td><p>App styles that will be rendered to the DOM once the app initializes.</p>
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
<a name="module_weddell/app--WeddellApp+onPatch"></a>

#### weddellApp.onPatch() ⇒ <code>Promise</code>
Hook method that may be overridden and will be executed at the end of every DOM patch.

**Kind**: instance method of [<code>WeddellApp</code>](#exp_module_weddell/app--WeddellApp)  
**Returns**: <code>Promise</code> - Subsequent patches may be deferred by returning a Promise in this method.  
<a name="module_weddell/app--WeddellApp+awaitComponentMount"></a>

#### weddellApp.awaitComponentMount(id) ⇒ <code>Promise.&lt;WeddellComponent&gt;</code>
Returns a promise the resolves with a weddell component once the component with the specified id has been rendered and mounted (not necessarily patched to DOM yet). Note that if the component id does not match any current or future components, the returned promise will never resolve.

**Kind**: instance method of [<code>WeddellApp</code>](#exp_module_weddell/app--WeddellApp)  
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

<a name="module_weddell/app--WeddellApp+awaitPatch"></a>

#### weddellApp.awaitPatch() ⇒ <code>Promise</code>
Returns a promise that will resolve after pending patch completes, or immediately if no patch is currently queued or in progress.

**Kind**: instance method of [<code>WeddellApp</code>](#exp_module_weddell/app--WeddellApp)  
<a name="module_weddell/app--WeddellApp+awaitNextPatch"></a>

#### weddellApp.awaitNextPatch() ⇒ <code>Promise</code>
Returns a promise that will resolve after current pending patch or the next patch completes.

**Kind**: instance method of [<code>WeddellApp</code>](#exp_module_weddell/app--WeddellApp)  
<a name="module_weddell/app--WeddellApp+renderSnapshot"></a>

#### weddellApp.renderSnapshot() ⇒ <code>WeddellAppStateSnapshot</code>
Dumps the current application state to a snapshot object.

**Kind**: instance method of [<code>WeddellApp</code>](#exp_module_weddell/app--WeddellApp)  
<a name="module_weddell/app--WeddellApp+init"></a>

#### weddellApp.init(initObj) ⇒ <code>Promise</code>
Initializes the app, rendering the root component and mounting it into the specified DOM element.

**Kind**: instance method of [<code>WeddellApp</code>](#exp_module_weddell/app--WeddellApp)  
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

<a name="module_weddell/app--WeddellApp..CssString"></a>

#### WeddellApp~CssString : <code>String</code>
A string of valid CSS style declarations.

**Kind**: inner typedef of [<code>WeddellApp</code>](#exp_module_weddell/app--WeddellApp)  
**See**: https://developer.mozilla.org/en-US/docs/Web/CSS  
<a name="module_weddell/app--WeddellApp..HtmlString"></a>

#### WeddellApp~HtmlString : <code>String</code>
A string of valid HTML.

**Kind**: inner typedef of [<code>WeddellApp</code>](#exp_module_weddell/app--WeddellApp)  
**See**: https://developer.mozilla.org/en-US/docs/Web/HTML  
<a name="module_weddell/app--WeddellApp..WeddellAppStateSnapshot"></a>

#### WeddellApp~WeddellAppStateSnapshot : <code>Object</code>
A snapshot of a Weddell app. This value is ready for serialization, allowing for later rehydration of application state.

**Kind**: inner typedef of [<code>WeddellApp</code>](#exp_module_weddell/app--WeddellApp)  
**Properties**

<table>
  <thead>
    <tr>
      <th>Name</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>stateHtml</td><td><code>HtmlString</code></td><td><p>Application state, serialized to JSON with an event binding it to application init, all wrapped with a script tag, ready to be inserted into HTML files to allow for application restore.</p>
</td>
    </tr><tr>
    <td>stylesHtml</td><td><code>HtmlString</code></td><td><p>All Weddell style tags grouped together in an HTML string, and ready to be inserted into HTML head.</p>
</td>
    </tr><tr>
    <td>fullResponse</td><td><code>HtmlString</code></td><td><p>All HTML in document.</p>
</td>
    </tr><tr>
    <td>appHtml</td><td><code>HtmlString</code></td><td><p>All HTML currently rendered into application mount point.</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_weddell/component"></a>

## weddell/component
WeddellComponent module.

<a name="exp_module_weddell/component--WeddellComponent"></a>

### WeddellComponent ⏏
Class representing a Weddell component. A component represents encapsulates some combination of scripts, markup and/or styles into a instanceable custom tag.

**Kind**: Exported class  
<a name="module_weddell"></a>

## weddell
Base Weddell module.


* [weddell](#module_weddell)
    * [~Weddell](#module_weddell..Weddell)
        * [.plugin(pluginObj)](#module_weddell..Weddell.plugin)
    * [~WeddellPlugin](#module_weddell..WeddellPlugin) : <code>object</code>

<a name="module_weddell..Weddell"></a>

### weddell~Weddell
**Kind**: inner class of [<code>weddell</code>](#module_weddell)  
**Requires**: [<code>weddell/app</code>](#module_weddell/app), [<code>weddell/component</code>](#module_weddell/component), <code>module:weddell/store</code>  
**Properties**

<table>
  <thead>
    <tr>
      <th>Name</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>App</td><td><code><a href="#module_weddell/app">weddell/app</a></code></td>
    </tr><tr>
    <td>Component</td><td><code><a href="#module_weddell/component">weddell/component</a></code></td>
    </tr><tr>
    <td>Store</td><td><code>module:weddell/store</code></td>
    </tr>  </tbody>
</table>

<a name="module_weddell..Weddell.plugin"></a>

#### Weddell.plugin(pluginObj)
Extends the base Weddell class with additional functionality, as defined in a plugin object.

**Kind**: static method of [<code>Weddell</code>](#module_weddell..Weddell)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>pluginObj</td><td><code>WeddellPlugin</code></td><td><p>A plugin object to apply to the base Weddell class.</p>
</td>
    </tr>  </tbody>
</table>

<a name="module_weddell..WeddellPlugin"></a>

### weddell~WeddellPlugin : <code>object</code>
**Kind**: inner typedef of [<code>weddell</code>](#module_weddell)  
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

