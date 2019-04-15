## Modules

<dl>
<dt><a href="#module_weddell/app">weddell/app</a></dt>
<dd></dd>
<dt><a href="#module_weddell/component">weddell/component</a></dt>
<dd></dd>
<dt><a href="#module_weddell/store">weddell/store</a></dt>
<dd></dd>
<dt><a href="#module_weddell">weddell</a></dt>
<dd><p>Base Weddell module.</p>
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
</dl>

<a name="module_weddell/app"></a>

## weddell/app
<a name="module_weddell/component"></a>

## weddell/component
<a name="module_weddell/store"></a>

## weddell/store
<a name="module_weddell"></a>

## weddell
Base Weddell module.

**Requires**: [<code>weddell/app</code>](#module_weddell/app), [<code>weddell/component</code>](#module_weddell/component), [<code>weddell/store</code>](#module_weddell/store)  

* [weddell](#module_weddell)
    * *[Weddell](#exp_module_weddell--Weddell) ⏏*
        * _static_
            * *[.App](#module_weddell--Weddell.App)*
                * [new App()](#new_module_weddell--Weddell.App_new)
            * *[.Store](#module_weddell--Weddell.Store)*
            * *[.plugin(pluginObj)](#module_weddell--Weddell.plugin)*
        * _inner_
            * *[~Component](#module_weddell--Weddell..Component)*
                * [new Component()](#new_module_weddell--Weddell..Component_new)
            * *[~WeddellPlugin](#module_weddell--Weddell..WeddellPlugin) : <code>object</code>*

<a name="exp_module_weddell--Weddell"></a>

### *Weddell ⏏*
**Kind**: Exported class  
**Requires**: [<code>weddell/app</code>](#module_weddell/app), [<code>weddell/component</code>](#module_weddell/component), [<code>weddell/store</code>](#module_weddell/store)  
<a name="module_weddell--Weddell.App"></a>

#### *Weddell.App*
**Kind**: static class of [<code>Weddell</code>](#exp_module_weddell--Weddell)  
<a name="new_module_weddell--Weddell.App_new"></a>

##### new App()
An app, which owns and manages a root component in the DOM. The Weddell app object is the main entrypoint to your application.

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
<a name="module_weddell--Weddell.Store"></a>

#### *Weddell.Store*
**Kind**: static class of [<code>Weddell</code>](#exp_module_weddell--Weddell)  
<a name="module_weddell--Weddell.plugin"></a>

#### *Weddell.plugin(pluginObj)*
Extends the base Weddell class with additional functionality, as defined in a plugin object.

**Kind**: static method of [<code>Weddell</code>](#exp_module_weddell--Weddell)  
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

<a name="module_weddell--Weddell..Component"></a>

#### *Weddell~Component*
**Kind**: inner class of [<code>Weddell</code>](#exp_module_weddell--Weddell)  
<a name="new_module_weddell--Weddell..Component_new"></a>

##### new Component()
Class representing a Weddell component. A component represents encapsulates some combination of scripts, markup and/or styles into a instanceable custom tag.

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
<a name="module_weddell--Weddell..WeddellPlugin"></a>

#### *Weddell~WeddellPlugin : <code>object</code>*
**Kind**: inner typedef of [<code>Weddell</code>](#exp_module_weddell--Weddell)  
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

