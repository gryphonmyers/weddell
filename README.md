## Modules

<dl>
<dt><a href="#module_weddell/app">weddell/app</a></dt>
<dd><p>WeddellApp module.</p>
</dd>
<dt><a href="#module_weddell/component">weddell/component</a></dt>
<dd><p>WeddellComponent module.</p>
</dd>
<dt><a href="#module_weddell/store">weddell/store</a></dt>
<dd></dd>
<dt><a href="#module_weddell">weddell</a></dt>
<dd><p>Base Weddell module.</p>
</dd>
</dl>

<a name="module_weddell/app"></a>

## weddell/app
WeddellApp module.

<a name="exp_module_weddell/app--WeddellApp"></a>

### WeddellApp ⏏
An app, which owns and manages a root component in the DOM. The Weddell app object is the main entrypoint to your application.

**Kind**: Exported class  
<a name="module_weddell/component"></a>

## weddell/component
WeddellComponent module.

<a name="exp_module_weddell/component--WeddellComponent"></a>

### WeddellComponent ⏏
Class representing a Weddell component. A component represents encapsulates some combination of scripts, markup and/or styles into a instanceable custom tag.

**Kind**: Exported class  
<a name="module_weddell/store"></a>

## weddell/store
<a name="exp_module_weddell/store--WeddellStore"></a>

### WeddellStore ⏏
Class representing a store of key/value pairs. The store class is primarily used to model application state.

**Kind**: Exported class  
<a name="module_weddell"></a>

## weddell
Base Weddell module.

**Requires**: [<code>weddell/app</code>](#module_weddell/app), [<code>weddell/component</code>](#module_weddell/component), [<code>weddell/store</code>](#module_weddell/store)  

* [weddell](#module_weddell)
    * *[Weddell](#exp_module_weddell--Weddell) ⏏*
        * _static_
            * *[.App](#module_weddell--Weddell.App) : <code>WeddellApp</code>*
            * *[.Store](#module_weddell--Weddell.Store) : <code>WeddellStore</code>*
            * *[.Component](#module_weddell--Weddell.Component) : <code>WeddellComponent</code>*
            * *[.plugin(pluginObj)](#module_weddell--Weddell.plugin)*
        * _inner_
            * *[~WeddellPlugin](#module_weddell--Weddell..WeddellPlugin) : <code>object</code>*

<a name="exp_module_weddell--Weddell"></a>

### *Weddell ⏏*
**Kind**: Exported class  
**Requires**: [<code>weddell/app</code>](#module_weddell/app), [<code>weddell/component</code>](#module_weddell/component), [<code>weddell/store</code>](#module_weddell/store)  
<a name="module_weddell--Weddell.App"></a>

#### *Weddell.App : <code>WeddellApp</code>*
**Kind**: static property of [<code>Weddell</code>](#exp_module_weddell--Weddell)  
<a name="module_weddell--Weddell.Store"></a>

#### *Weddell.Store : <code>WeddellStore</code>*
**Kind**: static property of [<code>Weddell</code>](#exp_module_weddell--Weddell)  
<a name="module_weddell--Weddell.Component"></a>

#### *Weddell.Component : <code>WeddellComponent</code>*
**Kind**: static property of [<code>Weddell</code>](#exp_module_weddell--Weddell)  
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

