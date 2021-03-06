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
<dt><a href="#StoreWatchArgs">StoreWatchArgs</a> : <code>Array</code></dt>
<dd><p>Arguments as passed into <a href="https://github.com/gryphonmyers/weddell/tree/ft-new-render#storewatchkey-func-validator-invokeimmediately-onlyfireonce--removeeventlistenercallback">Store#watch</a> (in the most basic use case, this will be an array with two items: a key and a callback function).</p>
</dd>
<dt><a href="#StateTransform">StateTransform</a> ⇒ <code>*</code></dt>
<dd></dd>
<dt><a href="#WeddellComponentMixin">WeddellComponentMixin</a> ⇒ <code>function</code></dt>
<dd></dd>
<dt><a href="#CssTemplate">CssTemplate</a> ⇒ <code><a href="#CssString">CssString</a></code></dt>
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
<dt><a href="#StoreWatchCallback">StoreWatchCallback</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#StoreWatchValidator">StoreWatchValidator</a> ⇒ <code>boolean</code></dt>
<dd></dd>
<dt><a href="#RemoveEventListenerCallback">RemoveEventListenerCallback</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#WeddellPlugin">WeddellPlugin</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="Weddell"></a>

## *Weddell*
Top-level Weddell class serving as an entrypoint to various APIs.

**Kind**: global abstract class  

* *[Weddell](#Weddell)*
    * _static_
        * *[.plugin(pluginObj)](#Weddell.plugin)*
    * _inner_
        * *[~WeddellApp](#Weddell.App)*
            * [new WeddellApp(opts)](#new_Weddell.App_new)
            * [.init(initObj)](#Weddell.App+init) ⇒ <code>Promise</code>
            * [.onPatch()](#Weddell.App+onPatch) ⇒ <code>Promise</code>
            * [.awaitComponentMount(id)](#Weddell.App+awaitComponentMount) ⇒ <code>Promise.&lt;WeddellComponent&gt;</code>
            * [.awaitPatch()](#Weddell.App+awaitPatch) ⇒ <code>Promise</code>
            * [.awaitNextPatch()](#Weddell.App+awaitNextPatch) ⇒ <code>Promise</code>
            * [.renderSnapshot()](#Weddell.App+renderSnapshot) ⇒ [<code>WeddellAppStateSnapshot</code>](#WeddellAppStateSnapshot)
        * *[~WeddellComponent](#Weddell.Component)*
            * [new WeddellComponent(opts)](#new_Weddell.Component_new)
            * _instance_
                * [.onMount()](#Weddell.Component+onMount) ⇒ <code>Promise</code> \| <code>void</code>
                * [.onFirstMount()](#Weddell.Component+onFirstMount) ⇒ <code>Promise</code> \| <code>void</code>
                * [.onUnmount()](#Weddell.Component+onUnmount) ⇒ <code>Promise</code> \| <code>void</code>
                * [.onInit()](#Weddell.Component+onInit) ⇒ <code>Promise</code> \| <code>void</code>
                * [.onRender()](#Weddell.Component+onRender) ⇒ <code>Promise</code> \| <code>void</code>
                * [.onFirstRender()](#Weddell.Component+onFirstRender) ⇒ <code>Promise</code> \| <code>void</code>
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
                * [.markup](#Weddell.Component.markup) : [<code>VirtualDomTemplate</code>](#VirtualDomTemplate)
                * [.state](#Weddell.Component.state) : <code>object</code>
                * [.styles](#Weddell.Component.styles) ⇒ <code>Array.&lt;(CssTemplate\|CssString)&gt;</code> \| [<code>CssString</code>](#CssString) \| [<code>CssTemplate</code>](#CssTemplate)
                * [.components](#Weddell.Component.components) : <code>Object.&lt;string, WeddellComponentMixin&gt;</code>
                * [.inputs](#Weddell.Component.inputs) : <code>Array.&lt;String&gt;</code>
                * [.consts](#Weddell.Component.consts) : <code>object</code>
                * [.propertySets](#Weddell.Component.propertySets) : <code>Object.&lt;string, (Object.&lt;string, string&gt;\|Array.&lt;String&gt;)&gt;</code>
                * [.deserializers](#Weddell.Component.deserializers) : <code>Object.&lt;string, StateTransform&gt;</code>
                * [.serializers](#Weddell.Component.serializers) : <code>Object.&lt;string, StateTransform&gt;</code>
                * [.watchers](#Weddell.Component.watchers) : [<code>Array.&lt;StoreWatchArgs&gt;</code>](#StoreWatchArgs)
                * [.isWeddellComponent](#Weddell.Component.isWeddellComponent)
        * *[~WeddellStore](#Weddell.Store)*
            * [new WeddellStore(data, opts)](#new_Weddell.Store_new)
            * [.watch(key, func, [validator], [invokeImmediately], [onlyFireOnce])](#Weddell.Store+watch) ⇒ [<code>RemoveEventListenerCallback</code>](#RemoveEventListenerCallback)

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
<a name="Weddell.App"></a>

### *Weddell~WeddellApp*
An app, which owns and manages a root component in the DOM. The Weddell app object is the main entrypoint to your application.

**Kind**: inner class of [<code>Weddell</code>](#Weddell)  

* *[~WeddellApp](#Weddell.App)*
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
    <td>opts.Component</td><td><code><a href="#WeddellComponentMixin">WeddellComponentMixin</a></code></td><td></td><td><p>A Weddell component class factory. This component will be mounted as the root into the mount point specified in the</p>
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
const { App } = require('weddell');

var app = new App({
    el: '#app',
    Component: Component => class MyRootComponent extends Component {
        static get markup(locals, h) {
            return h('.foo', 'bar');
        }
    },
    styles: `
      #app {
        color: red;
      }
    `
});

app.init();

// Given HTML '<div id="app"></div>', after init finishes, 
// '<div id="app"><div class="foo">bar</div></div>' will be 
// rendered into the DOM
```
<a name="Weddell.App+init"></a>

#### weddellApp.init(initObj) ⇒ <code>Promise</code>
Initializes the app, rendering the root component and mounting it into the specified DOM element.

**Kind**: instance method of [<code>WeddellApp</code>](#Weddell.App)  
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

#### weddellApp.onPatch() ⇒ <code>Promise</code>
Hook method that may be overridden and will be executed at the end of every DOM patch.

**Kind**: instance method of [<code>WeddellApp</code>](#Weddell.App)  
**Returns**: <code>Promise</code> - Subsequent patches may be deferred by returning a Promise in this method.  
<a name="Weddell.App+awaitComponentMount"></a>

#### weddellApp.awaitComponentMount(id) ⇒ <code>Promise.&lt;WeddellComponent&gt;</code>
Returns a promise the resolves with a weddell component once the component with the specified id has been rendered and mounted (not necessarily patched to DOM yet). Note that if the component id does not match any current or future components, the returned promise will never resolve.

**Kind**: instance method of [<code>WeddellApp</code>](#Weddell.App)  
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

#### weddellApp.awaitPatch() ⇒ <code>Promise</code>
Returns a promise that will resolve after pending patch completes, or immediately if no patch is currently queued or in progress.

**Kind**: instance method of [<code>WeddellApp</code>](#Weddell.App)  
<a name="Weddell.App+awaitNextPatch"></a>

#### weddellApp.awaitNextPatch() ⇒ <code>Promise</code>
Returns a promise that will resolve after current pending patch or the next patch completes.

**Kind**: instance method of [<code>WeddellApp</code>](#Weddell.App)  
<a name="Weddell.App+renderSnapshot"></a>

#### weddellApp.renderSnapshot() ⇒ [<code>WeddellAppStateSnapshot</code>](#WeddellAppStateSnapshot)
Dumps the current application state to a snapshot object, typically used for server-side rendering setups.

**Kind**: instance method of [<code>WeddellApp</code>](#Weddell.App)  
<a name="Weddell.Component"></a>

### *Weddell~WeddellComponent*
Class representing a Weddell component. A component encapsulates some combination of scripts, markup and/or styles into an instantiable custom tag.

**Kind**: inner class of [<code>Weddell</code>](#Weddell)  

* *[~WeddellComponent](#Weddell.Component)*
    * [new WeddellComponent(opts)](#new_Weddell.Component_new)
    * _instance_
        * [.onMount()](#Weddell.Component+onMount) ⇒ <code>Promise</code> \| <code>void</code>
        * [.onFirstMount()](#Weddell.Component+onFirstMount) ⇒ <code>Promise</code> \| <code>void</code>
        * [.onUnmount()](#Weddell.Component+onUnmount) ⇒ <code>Promise</code> \| <code>void</code>
        * [.onInit()](#Weddell.Component+onInit) ⇒ <code>Promise</code> \| <code>void</code>
        * [.onRender()](#Weddell.Component+onRender) ⇒ <code>Promise</code> \| <code>void</code>
        * [.onFirstRender()](#Weddell.Component+onFirstRender) ⇒ <code>Promise</code> \| <code>void</code>
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
        * [.markup](#Weddell.Component.markup) : [<code>VirtualDomTemplate</code>](#VirtualDomTemplate)
        * [.state](#Weddell.Component.state) : <code>object</code>
        * [.styles](#Weddell.Component.styles) ⇒ <code>Array.&lt;(CssTemplate\|CssString)&gt;</code> \| [<code>CssString</code>](#CssString) \| [<code>CssTemplate</code>](#CssTemplate)
        * [.components](#Weddell.Component.components) : <code>Object.&lt;string, WeddellComponentMixin&gt;</code>
        * [.inputs](#Weddell.Component.inputs) : <code>Array.&lt;String&gt;</code>
        * [.consts](#Weddell.Component.consts) : <code>object</code>
        * [.propertySets](#Weddell.Component.propertySets) : <code>Object.&lt;string, (Object.&lt;string, string&gt;\|Array.&lt;String&gt;)&gt;</code>
        * [.deserializers](#Weddell.Component.deserializers) : <code>Object.&lt;string, StateTransform&gt;</code>
        * [.serializers](#Weddell.Component.serializers) : <code>Object.&lt;string, StateTransform&gt;</code>
        * [.watchers](#Weddell.Component.watchers) : [<code>Array.&lt;StoreWatchArgs&gt;</code>](#StoreWatchArgs)
        * [.isWeddellComponent](#Weddell.Component.isWeddellComponent)

<a name="new_Weddell.Component_new"></a>

#### new WeddellComponent(opts)
Constructs a Weddell Component. One does not generally instantiate components directly, but rather includes them declaratively via markup tags. This information is available primarily for the purposes of plugin authorship. See the static [markup](#Weddell.Component.markup), [state](#Weddell.Component.state), and [styles](#Weddell.Component.styles) properties for more typical component development entrypoints.

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
    </tr><tr>
    <td>opts.state</td><td><code>object</code></td><td><p>Base state object that will be merged into static store declaration.</p>
</td>
    </tr><tr>
    <td>opts.components</td><td><code>object</code></td><td></td>
    </tr><tr>
    <td>[opts.initialState]</td><td><code>object</code></td><td><p>Initial state of the component.</p>
</td>
    </tr>  </tbody>
</table>

<a name="Weddell.Component+onMount"></a>

#### weddellComponent.onMount() ⇒ <code>Promise</code> \| <code>void</code>
Component lifecycle hook method that may be overridden. Called whenever a component instance finishes rendering and mounting into a parent component.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
**Returns**: <code>Promise</code> \| <code>void</code> - Returning a promise will defer completion of the mount process.  
<a name="Weddell.Component+onFirstMount"></a>

#### weddellComponent.onFirstMount() ⇒ <code>Promise</code> \| <code>void</code>
Component lifecycle hook method that may be overridden. Called whenever a component instance finishes rendering and mounting into a parent component, but only the first time it mounts. Subsequent unmounts and mounts will not call this method again.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
**Returns**: <code>Promise</code> \| <code>void</code> - Returning a promise will defer completion of the mount process.  
<a name="Weddell.Component+onUnmount"></a>

#### weddellComponent.onUnmount() ⇒ <code>Promise</code> \| <code>void</code>
Component lifecycle hook method that may be overridden. Called whenever a component instance is unmounted from its parent component.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
**Returns**: <code>Promise</code> \| <code>void</code> - Returning a promise will defer completion of the unmount process.  
<a name="Weddell.Component+onInit"></a>

#### weddellComponent.onInit() ⇒ <code>Promise</code> \| <code>void</code>
Component lifecycle hook method that may be overridden. Called whenever a component instance finishes initializing.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
**Returns**: <code>Promise</code> \| <code>void</code> - Returning a promise will defer completion of the init process.  
<a name="Weddell.Component+onRender"></a>

#### weddellComponent.onRender() ⇒ <code>Promise</code> \| <code>void</code>
Component lifecycle hook method that may be overridden. Called after the component finishes rendering.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
**Returns**: <code>Promise</code> \| <code>void</code> - Returning a promise will defer completion of the render process (not advised unless you know what you are doing).  
<a name="Weddell.Component+onFirstRender"></a>

#### weddellComponent.onFirstRender() ⇒ <code>Promise</code> \| <code>void</code>
Component lifecycle hook method that may be overridden. Called the first time the component is ever rendered, but not on subsequent rerenders.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
**Returns**: <code>Promise</code> \| <code>void</code> - Returning a promise will defer rendering (not advised unless you know what you are doing).  
<a name="Weddell.Component+onRenderMarkup"></a>

#### weddellComponent.onRenderMarkup() ⇒ <code>Promise</code> \| <code>void</code>
Component lifecycle hook method that may be overridden. Called after the component finishes rendering markup as part of its rendering process.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
**Returns**: <code>Promise</code> \| <code>void</code> - Returning a promise will defer completion of the markup render process, and thus the render process as a whole (not advised unless you know what you are doing).  
<a name="Weddell.Component+onRenderStyles"></a>

#### weddellComponent.onRenderStyles() ⇒ <code>Promise</code> \| <code>void</code>
Component lifecycle hook method that may be overridden. Called after the component finishes rendering styles as part of its rendering process.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
**Returns**: <code>Promise</code> \| <code>void</code> - Returning a promise will defer completion of the styles render process, and thus the render process as a whole (not advised unless you know what you are doing).  
<a name="Weddell.Component+onDOMCreate"></a>

#### weddellComponent.onDOMCreate(evt) ⇒ <code>void</code>
Component lifecycle hook method that may be overridden. Called when a DOM element is created and set to this component's 'el' property.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
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

#### weddellComponent.onDOMMove(evt) ⇒ <code>void</code>
Component lifecycle hook method that may be overridden. Called when the DOM element associated with this component moves to a new location in the DOM.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
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

#### weddellComponent.onDOMChange(evt) ⇒ <code>void</code>
Component lifecycle hook method that may be overridden. Called when the DOM element associated with this component changes.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
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

#### weddellComponent.onDOMCreateOrChange(evt) ⇒ <code>void</code>
Component lifecycle hook method that may be overridden. Called either when a new DOM element is created for this component, or when the DOM element associated with it changes.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
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

#### weddellComponent.onDOMDestroy(evt) ⇒ <code>void</code>
Component lifecycle hook method that may be overridden. Called when a DOM element that was previously associated with this component is destroyed.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
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

#### weddellComponent.bindEvent(funcText, opts)
Binds a function body string to the scope of this component. This string will then typically be used in a native DOM event handler attribute.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
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

#### weddellComponent.bindEventValue(propName, opts)
Syntax sugar method very similar to bindEvent, but slightly less verbose for DOM elements with a value (inputs, etc) that you would like to bind to component state.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
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

#### weddellComponent.walkComponents(callback, [filterFunc])
Calls the specified callback for this component and all child components.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
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

#### weddellComponent.reduceComponents(callback, initialVal, [filterFunc]) ⇒ <code>\*</code>
Calls the specified reducer for this component and all child components.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
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

#### weddellComponent.reduceParents(callback, initialVal) ⇒ <code>\*</code>
Calls the specified reducer recursively for all parent components upward from this one.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
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

#### weddellComponent.collectComponentTree() ⇒ <code>object</code>
Performs a recursive scan upward from this component, to the application's root component.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
**Todo**

- Document this more thoroughly

<a name="Weddell.Component+getMountedChildComponents"></a>

#### weddellComponent.getMountedChildComponents() ⇒ <code>Array.&lt;WeddellComponent&gt;</code>
Queries the component tree for components that are currently mounted (rendered and typically in DOM or soon-to-be in DOM).

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
<a name="Weddell.Component+queryDOM"></a>

#### weddellComponent.queryDOM(query) ⇒ <code>Promise.&lt;(Element\|null)&gt;</code>
Returns a promise that will resolve with the result of querying this component's DOM element using querySelector, once the component has a DOM element to query.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
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

#### weddellComponent.queryDOMAll(query) ⇒ <code>Promise.&lt;NodeListOf.&lt;Element&gt;&gt;</code>
Returns a promise that will resolve with the result of querying this component's DOM element using querySelectorAll, once the component has a DOM element to query.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
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

#### weddellComponent.awaitEvent(eventName) ⇒ <code>Promise</code>
Returns a promise that will resolve once this component fires a specific event.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
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

#### weddellComponent.awaitPatch() ⇒ <code>Promise</code>
Returns a promise that will resolve once this component has finished rendering, and the next application patch has completed (which should mean all state changes have been propagated to the DOM).

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
<a name="Weddell.Component+awaitMount"></a>

#### weddellComponent.awaitMount() ⇒ <code>Promise</code>
Returns a promise that will resolve once this component mounts (or immediately, if it is already mounted). Note that mounting does not necessarily mean that application changes have been propagated to the DOM.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
<a name="Weddell.Component+awaitDom"></a>

#### weddellComponent.awaitDom() ⇒ <code>Promise.&lt;Element&gt;</code>
Returns a promise that will resolve once a DOM element has been created for this component (or immediately, if it already has one). The promise is resolved with this component's DOM element.

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
<a name="Weddell.Component+awaitRender"></a>

#### weddellComponent.awaitRender() ⇒ <code>Promise</code>
Returns a promise that will resolve once the pending render promise has completed (or immediately, if there is no pending render promise).

**Kind**: instance method of [<code>WeddellComponent</code>](#Weddell.Component)  
<a name="Weddell.Component.markup"></a>

#### WeddellComponent.markup : [<code>VirtualDomTemplate</code>](#VirtualDomTemplate)
Stub property. Typically, components will override the markup property to provide their components's virtual DOM template function. The template function is passed both component state and the application's hyperscript implementation ('h'). See the [virtual-dom](https://github.com/Matt-Esch/virtual-dom) docs for more info about this syntax.

**Kind**: static property of [<code>WeddellComponent</code>](#Weddell.Component)  
**Example**  
```js
Component => class MyComponent extends Component {
 static get markup() {
     return (locals, h) =>
         h('.my-component', [
            h('div', {
             attributes: {
                 onclick: 'console.log("hello");'
             }
            }, 'Click Me')
         ])
 }
}

// Will render '<div class="my-component" onclick='console.log("hello");'>Click Me</div>' to DOM
```
**Example** *(Hscript can be a bit clunky to work with when your display logic gets more complex. Development tools like pug-vdom can port other, perhaps more succinct syntaxes to return virtual-dom nodes.)*  
```js

Component => class MyComponent extends Component {
 static get markup() {
     return require('./my-component.pug');
 }
}

// in './my-component.pug':
//
// .my-component
//   div(onclick="console.log('hello')") Click Me

// This example would require the use of the pug-vdom dev tool. weddell-dev-tools includes pug support 
// out of the box. Or you can write your own require hook to adapt your favorite template syntax to 
// return virtual dom nodes.
```
<a name="Weddell.Component.state"></a>

#### WeddellComponent.state : <code>object</code>
Stub property. Typically, components override this property, returning the keys and default state values. When a component is initialized, it will use this object when creating its own local transient state object. Once initialized, subsequent changes to any key in the WeddellComponent#state object will trigger component rerenders -> DOM patches.

**Kind**: static property of [<code>WeddellComponent</code>](#Weddell.Component)  
**Example**  
```js
Component => class MyComponent extends Component {
 static get state() {
     return {
         myContent: 'Foobar'
     }
 }
 static get markup() {
     return (locals, h) =>
         h('.my-component', [locals.myContent])
 }
}

// Will render '<div class="my-component">Foobar</div>' to DOM
```
**Example** *(Values saved to state must be serializable (strings, numbers, plain objects, arrays, bools). Trying to save a complete data type to state will cause an error to be thrown. If you really need to save non-serializable objects to state, look at the Component.serializers and Component.deserializers properties.)*  
```js

Component => class MyComponent extends Component {
 static get state() {
     return {
         myContent: new Foobar() //Don't do this!
     }
 }

 static get markup() {
     return (locals, h) =>
         h('.my-component', [locals.myContent])
 }
}

// Will throw an error. Instances of the Foobar class are not plain objects, and 
// thus are not serializable.
```
**Example** *(There is, however, an exception allowing serializable data in state: state values declared as functions will be interpreted as &#x27;computed values&#x27;. These functions are executed in the context of the component state object, and will be recomputed when referenced state values change. Note: functions may only be specified in the initial declaration - you can NOT set a state value to a new function at runtime (that will result in an error being thrown).)*  
```js

Component => class MyComponent extends Component {
 static get state() {
     return {
         numbers: [1, 2],
         numbersDoubled: function(){
             return this.numbers.map(num => num * 2);
         }
     }
 }

 static get markup() {
     return (locals, h) =>
         h('.my-component', { attributes: { 
             onclick: locals.$bind('this.state.numbers = this.state.numbers.map(num => num + 1)') }
         }, locals.numbersDoubled)
 }
}

// '<div class="my-component">2 4</div>'
// * User clicks *
// '<div class="my-component">4 6</div>'
```
**Example** *(When inheriting from a parent component class, the ES6 class spec&#x27;s super keyword makes it easy to merge with parent state.)*  
```js

Component => class MyComponent extends MyParentComponentMixin(Component) {
 static get state() {
     return Object.assign({}, super.state, { //Note argument order - we default to super state, override with our state.
         numbersDoubledMinus1: function(){
             return this.numbersDoubled.map(num => num - 1);
         }
     });
 }

 static get markup() {
     return (locals, h) =>
         h('.my-component', locals.numbersDoubledMinus1)
 }
}

// Assuming 'MyParentComponentMixin' is the mixin from the previous example...
// '<div class="my-component">1 3</div>'
// * User clicks *
// '<div class="my-component">3 5</div>'
```
**Example** *(When working with objects and arrays in component state, be cognizant of the fact that you must set the state value itself in order for the necessary change events to fire, triggering DOM refresh. Getting this wrong can lead to hard-to-track-down bugs.)*  
```js

Component => class MyComponent extends Component {
 static get state() {
     return {
         myObject: {
             myValue: 1
         }
     }
 }

 static get markup() {
     return (locals, h) =>
         h('.my-component', {
             attributes: {
                 onclick: locals.$bind('this.state.myObject.myValue += 1')
             }
         }, locals.myObject.myValue)
 }
}

// '<div class="my-component">1/div>'
// * User clicks *
// '<div class="my-component">1</div>'
// Even though our event handler was fired, the DOM did not get refreshed! Let's try this again...

Component => class MyComponent extends Component {
 static get state() {
     return {
         myObject: {
             myValue: 1
         }
     }
 }

 static get markup() {
     return (locals, h) =>
         h('.my-component', {
             attributes: {
                 onclick: locals.$bind('this.state.myObject = { ...this.state.myObject, myValue: this.state.myObject.myValue + 1 }')
             }
         }, locals.myObject.myValue)
 }
}
// '<div class="my-component">1/div>'
// * User clicks *
// '<div class="my-component">2</div>'
// There we go! Because we set this.state.myObject itself to a new value instead of just setting 
// a property on the existing value, the appropriate events got fired, and the DOM refreshed.
```
<a name="Weddell.Component.styles"></a>

#### WeddellComponent.styles ⇒ <code>Array.&lt;(CssTemplate\|CssString)&gt;</code> \| [<code>CssString</code>](#CssString) \| [<code>CssTemplate</code>](#CssTemplate)
Stub property. Typically, components with custom CSS styles will override this property. Styles returned here will be dynamically inserted into style elements in the DOM's head when needed. Strings will be applied on a per-class basis (one copy for all component instances), while functions will be executed as a style template on a per-instance basis.

**Kind**: static property of [<code>WeddellComponent</code>](#Weddell.Component)  
**Example**  
```js
Component => class MyComponent extends Component {
 static get styles() {
     return `
         .my-component {
             color: red;
         }
     `
 }

 static get markup() {
     return (locals, h) =>
         h('.my-component', 'Foo bar')
 }
}

// Once mounted and patched, the element will be rendered in DOM with red text.
```
**Example** *(You can also return a function instead of a string, in which case current component state is available for dynamic styling.)*  
```js

Component => class MyComponent extends Component {
 static get state() {
     return {
         myImg: 'https://mywebsite.com/myimage.jpg'
     }
 }

 static get styles() {
     return (locals) => `
         .my-component {
             background-image: url(${locals.myImg});
         }
     `
 }

 static get markup() {
     return (locals, h) =>
         h('.my-component', 'Foo bar')
 }
}

// Once mounted and patched, the element will be rendered with 'myimage.jpg' in the background.
```
**Example** *(Be careful with CSS template functions though! Unlike string values, template functions will be executed and rendered to DOM for every component instance, which can lead to performance issues. Ideally, static, class-level styles should be returned as strings, while styles making use of component instance state, if needed, should be returned as template functions. You can mix and match by returning an array of style values.)*  
```js

Component => class MyComponent extends Component {
 static get state() {
     return {
         myImg: 'https://mywebsite.com/myimage.jpg'
     }
 }

 static get styles() {
     return [
     (locals) => `
           .my-component {
               background-image: url(${locals.myImg});
           }
       `,
       `
           .my-component {
               color: red;
           }
       `
     ]
 }

 static get markup() {
     return (locals, h) =>
         h('.my-component', 'Foo bar')
 }
}

// Once mounted and patched, the element will be rendered with 'myimage.jpg' in the background and 
// red text. Since the red text does not need component state, we return it as a string, separately 
// from the background-image style - it will be more performant that way.
```
**Example** *(When inheriting from a parent component class, the ES6 class spec&#x27;s super keyword makes it easy to extend the parent styles.)*  
```js

Component => class MyChildComponent extends MyParentComponentMixin(MyComponent) {

 static get styles() {
     return [
        `
             .my-component {
                 border: 2px solid red;
            }
         `
     ].concat(super.styles);
 }
}

// Assuming 'MyParentComponentMixin' is the mixin from the previous example, we would get an element
// rendered to DOM with 'myimage.jpg' in the background, red text, and a 2px solid red border
```
<a name="Weddell.Component.components"></a>

#### WeddellComponent.components : <code>Object.&lt;string, WeddellComponentMixin&gt;</code>
Stub property. Typically, components with child components will override this property, supplying component mixins that can then be included in the component's markup template by the entry key.

**Kind**: static property of [<code>WeddellComponent</code>](#Weddell.Component)  
**Todo**

- supply example demonstrating nested child tag scoping
- example showing static parent -> child state binding
- example showing custom event handlers

**Example**  
```js
Component => class MyComponent extends Component {
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
**Example** *(You can pass markup down from the parent component to the child by placing the &#x27;content&#x27; tag in the child.)*  
```js

Component => class MyComponent extends Component {
 static get markup(locals, h) {
     return h('.foo', [
         h('my-child-component', [
             'This is my content'
         ])
     ]);
 }

 static get components() {
     return {
         'my-child-component': Component => class extends Component {
             static get markup(locals, h) {
                 return h('.bar', [
                     h('content')
                 ]);
             }
         }
     }
 }
}

// Will render as '<div class="foo"><div class="my-child-component">This is my content</div></div>'
```
<a name="Weddell.Component.inputs"></a>

#### WeddellComponent.inputs : <code>Array.&lt;String&gt;</code>
Stub property. Typically, components with inputs will override this property. The inputs property flags particular keys as being expected as input data from parent components.

**Kind**: static property of [<code>WeddellComponent</code>](#Weddell.Component)  
**Todo**

- Clean up / fix object form of inputs, then document.

**Example**  
```js
Component => class MyComponent extends Component {
 static get state() {
     return {
         myParentData: 'foo'
     }
 }
 static get markup(locals, h) {
     return h('.foo', [
         h('my-child-component', {
             attributes: {
                 myChildData: locals.myParentData
             }
         }, [
             'This is my content'
         ])
     ]);
 }

 static get components() {
     return {
         'my-child-component': Component => class extends Component {
             static get inputs() {
                 return ['myChildData']
             }

             static get state() {
                 return {
                     myChildData: 'bar'
                 }
             }

             static get markup(locals, h) {
                 return h('.bar', [
                     locals.myChildData
                 ]);
             }
         }
     }
 }
}

// Component will render as '<div class="foo"><div class="my-child-component">foo</div></div>'
// But note that not that if the inputs property did not include 'myChildData', or if the parent
// component did not pass 'locals.myParentData' into the child component, then it would render
// '<div class="foo"><div class="my-child-component">bar</div></div>'
```
<a name="Weddell.Component.consts"></a>

#### WeddellComponent.consts : <code>object</code>
Stub property. Typically, components with constant helper values will override this property. These values will be proxied onto the component instance's 'state' property.

**Kind**: static property of [<code>WeddellComponent</code>](#Weddell.Component)  
**Todo**

- Example showing const availability on state object.

<a name="Weddell.Component.propertySets"></a>

#### WeddellComponent.propertySets : <code>Object.&lt;string, (Object.&lt;string, string&gt;\|Array.&lt;String&gt;)&gt;</code>
Stub property. Typically, components with property sets will override this property. Property sets group other state keys together into objects, making them more portable for passing down to components in a way that avoids unnecessary duplication.

**Kind**: static property of [<code>WeddellComponent</code>](#Weddell.Component)  
**Example**  
```js
Component => class MyComponent extends Component {

 static get state() {
     return {
         myProperty1: 'foo',
         myProperty2: 'bar',
         myUnrelatedProperty: 'whoosh'
     }
 }

 static get propertySets() {
     return {
         propertiesForChild: [
             'myProperty1',
             'myProperty2'
         ]
     }
 }

 static get markup(locals, h) {
     return h('.foo', [
         h('my-child-component', {
             attributes: locals.propertiesForChild
         })
     ]);
 }

 static get components() {
     return {
         'my-child-component': Component => class extends Component {
             static get inputs() {
                 return [
                     'myProperty1',
                     'myProperty2'
                 ]   
             }

             static get state() {
                 return {
                     myProperty1: 'whizz',
                     myProperty2: 'bang'
                 }
             }

             static get markup(locals, h) {
                 return h('.bar', [
                     locals.myProperty1,
                     locals.myProperty2
                 ]);
             }
         }
     }
 }
}

// Will render as '<div class="foo"><div class="my-child-component">foo bar</div></div>'
```
**Example** *(You can also specify property sets as objects, if you need to proxy the value to a different key on the set object.)*  
```js

Component => class MyComponent extends Component {

 static get state() {
     return {
         myProperty1: 'foo',
         myProperty2: 'bar',
         myUnrelatedProperty: 'whoosh'
     }
 }

 static get propertySets() {
     return {
         propertiesForChild: {
             myProperty1: 'myChildProperty1',
             myProperty2: 'myChildProperty2'
         }
     }
 }

 static get markup(locals, h) {
     return h('.foo', [
         h('my-child-component', {
             attributes: locals.propertiesForChild
         })
     ]);
 }

 static get components() {
     return {
         'my-child-component': Component => class extends Component {
             static get inputs() {
                 return [
                     'myChildProperty1',
                     'myChildProperty2'
                 ]   
             }

             static get state() {
                 return {
                     myChildProperty1: 'whizz',
                     myChildProperty2: 'bang'
                 }
             }

             static get markup(locals, h) {
                 return h('.bar', [
                     locals.myChildProperty1,
                     locals.myChildProperty2
                 ]);
             }
         }
     }
 }
}

// Will render as '<div class="foo"><div class="my-child-component">foo bar</div></div>'
```
<a name="Weddell.Component.deserializers"></a>

#### WeddellComponent.deserializers : <code>Object.&lt;string, StateTransform&gt;</code>
Stub property. Typically, components needing non-serializable data in state will declare functions here for transforming specific keys from serialized data to complex data types at runtime.

**Kind**: static property of [<code>WeddellComponent</code>](#Weddell.Component)  
**Example**  
```js
class MyThing {
 constructor(num) {
     this.num = num;
 }
 repeat3() {
     return `${this.num}${this.num}${this.num}`
 }
}

Component => class MyComponent extends Component {

 static get deserializers() {
     return {
         myThing: function(key, value) {
             return new MyThing(value);
         }
     }
 }

 static get state() {
     return {
         myThing: 4
     }
 }

 static get markup(locals, h) {
     return h('.foo', [this.myThing.repeat3()]);
 }

// Will render as '<div class="foo">444</div>'
```
<a name="Weddell.Component.serializers"></a>

#### WeddellComponent.serializers : <code>Object.&lt;string, StateTransform&gt;</code>
Stub property. A companion property to deserializers - serialized values will be used when a value set directly to state is a complex data type, and will need to be serialized before committing it to state.

**Kind**: static property of [<code>WeddellComponent</code>](#Weddell.Component)  
**Example**  
```js
class MyThing {
 constructor(num) {
     this.num = num;
 }
 repeat3() {
     return `${this.num}${this.num}${this.num}`
 }
}

Component => class MyComponent extends Component {

 static get deserializers() {
     return {
         myThing: function(key, value) {
             return new MyThing(value);
         }
     }
 }
 static get serializers() {
     return {
         myThing: function(key, value) {
             return value.num
         }
     }
 }

 static get state() {
     return {
         myThing: new MyThing(4)
     }
 }

 static get markup(locals, h) {
     return h('.foo', [this.myThing.repeat3()]);
 }

// Will render as '<div class="foo">444</div>'. Note that with the serializer defined, the complex
// MyThing data type may be set directly to state.
```
<a name="Weddell.Component.watchers"></a>

#### WeddellComponent.watchers : [<code>Array.&lt;StoreWatchArgs&gt;</code>](#StoreWatchArgs)
Stub property. Watch functions may be defined here, allowing for complex actions to be kicked off when component state changes. Watchers will be executed in component scope. Tip: if your watch function is really only setting other component state keys, you may be able to use a computed state propery instead (see example 3 [here](https://github.com/gryphonmyers/weddell/tree/ft-new-render#componentstate--object)).

**Kind**: static property of [<code>WeddellComponent</code>](#Weddell.Component)  
**Example**  
```js
Component => class MyComponent extends Component {

 static get watchers() {
     return [
         ['watchedUrl', function (watchedUrl) {
             if (watchedUrl) {
                 this.fetchData(watchedUrl)
             }
         }]
     ]
 }

 async fetchData(url){
     return fetch(url)
         .then(res => res.json())
         .then(data => this.state.fetchedData = data)
 }

 static get state() {
     return {
         fetchedData: null,
         watchedUrl: null
     }
 }

 static get markup(locals, h) {
     return h('.foo', {
         attributes: {
             onclick: locals.$bind('this.state.watchedUrl = "https://mydataendpoint"')
         }
     }, locals.fetchedData ? 'Got data!' : 'No data yet.');
 }

// Will render as '<div class="foo">No data yet.</div>' initially.
// * User click *
// After the resource fetches, markup will rerender as 
// '<div class="foo">Got data!</div>'
```
**Example** *(For finer-grained control over when the watcher fires, supply a validator function as well.)*  
```js

Component => class MyComponent extends Component {

 static get watchers() {
     return [
         ['watchedUrl', function (watchedUrl) {
             fetch(watchedUrl)
                .then(res => res.json())
                .then(data => this.fetchedData = data)
         }, (watchedUrl) => watchedUrl && watchedUrl.match(/https:\/\//)]
     ]
 }

 static get state() {
     return {
         fetchedData: null,
         watchedUrl: null
     }
 }

 static get markup(locals, h) {
     return h('.foo', {
         attributes: {
             onclick: locals.$bind('this.state.watchedUrl = Math.random() ? "hey mom" : "https://mydataendpoint"')
         }
     }, locals.fetchedData ? 'Got data!' : 'No data yet.');
 }

// Will render as '<div class="foo">No data yet.</div>' initially.
// * User click *
// Depending on result of die roll, it may or may not fetch data, then render as:
// '<div class="foo">Got data!</div>' But the fetch call won't error!
```
<a name="Weddell.Component.isWeddellComponent"></a>

#### WeddellComponent.isWeddellComponent
**Kind**: static property of [<code>WeddellComponent</code>](#Weddell.Component)  
**Example**  
```js
console.log(MyWeddellComponentClass.isWeddellComponent)
// true
```
<a name="Weddell.Store"></a>

### *Weddell~WeddellStore*
Class representing a store of key/value pairs. The store class is primarily used to model application state.

**Kind**: inner class of [<code>Weddell</code>](#Weddell)  

* *[~WeddellStore](#Weddell.Store)*
    * [new WeddellStore(data, opts)](#new_Weddell.Store_new)
    * [.watch(key, func, [validator], [invokeImmediately], [onlyFireOnce])](#Weddell.Store+watch) ⇒ [<code>RemoveEventListenerCallback</code>](#RemoveEventListenerCallback)

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

<a name="Weddell.Store+watch"></a>

#### weddellStore.watch(key, func, [validator], [invokeImmediately], [onlyFireOnce]) ⇒ [<code>RemoveEventListenerCallback</code>](#RemoveEventListenerCallback)
Watches a key or keys in the store, triggering a callback when values change.

**Kind**: instance method of [<code>WeddellStore</code>](#Weddell.Store)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>key</td><td><code>Array.&lt;String&gt;</code> | <code>String</code></td><td></td><td><p>Key(s) to watch. When multiple keys are supplied, the watch event will trigger when any of their values change.</p>
</td>
    </tr><tr>
    <td>func</td><td><code><a href="#StoreWatchCallback">StoreWatchCallback</a></code></td><td></td><td><p>Will be called whenever any value assigned to one of watched keys changes.</p>
</td>
    </tr><tr>
    <td>[validator]</td><td><code><a href="#StoreWatchValidator">StoreWatchValidator</a></code> | <code>boolean</code></td><td><code>true</code></td><td><p>Validates the changed value(s). If a boolean is supplied instead of a callback, &#39;true&#39; is interpreted as meaning all watched keys should be defined, while &#39;false&#39; means no validation should be applied.</p>
</td>
    </tr><tr>
    <td>[invokeImmediately]</td><td><code>boolean</code></td><td><code>false</code></td><td><p>Whether the callback should called immediately, or wait for the next change event.</p>
</td>
    </tr><tr>
    <td>[onlyFireOnce]</td><td><code>boolean</code></td><td><code>false</code></td><td><p>Whether the callback should persist, or call once then expire.</p>
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

<a name="StoreWatchArgs"></a>

## StoreWatchArgs : <code>Array</code>
Arguments as passed into [Store#watch](https://github.com/gryphonmyers/weddell/tree/ft-new-render#storewatchkey-func-validator-invokeimmediately-onlyfireonce--removeeventlistenercallback) (in the most basic use case, this will be an array with two items: a key and a callback function).

**Kind**: global typedef  
<a name="StateTransform"></a>

## StateTransform ⇒ <code>\*</code>
**Kind**: global typedef  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>key</td><td><code>String</code></td>
    </tr><tr>
    <td>value</td><td><code>*</code></td>
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

<a name="CssTemplate"></a>

## CssTemplate ⇒ [<code>CssString</code>](#CssString)
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
<a name="StoreWatchCallback"></a>

## StoreWatchCallback : <code>function</code>
**Kind**: global typedef  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>...value</td><td><code>*</code></td><td><p>A value from a watched key.</p>
</td>
    </tr>  </tbody>
</table>

<a name="StoreWatchValidator"></a>

## StoreWatchValidator ⇒ <code>boolean</code>
**Kind**: global typedef  
**Returns**: <code>boolean</code> - Returning true indicates that validation was successful and the watch callback should be executed.  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>value</td><td><code>Array</code> | <code>*</code></td><td><p>If a single key was watched, a single value will be passed in. If multiple keys were watched, an array with all watched values will be passed in as the first argument.</p>
</td>
    </tr>  </tbody>
</table>

<a name="RemoveEventListenerCallback"></a>

## RemoveEventListenerCallback : <code>function</code>
**Kind**: global typedef  
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

