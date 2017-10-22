# Weddell
A modular, nonopinionated Javascript framework.

# Statement of Purpose
Because every new web framework needs one! The front-end framework landscape is overcrowded, with a lot of great products out there. Many of the big problems of front-end web development have been solved in myriad ways, and every good framework has its strengths. Ultimately, it's up to API preference which framework you adopt. This framework was created due to a certain set of API preferences that other frameworks were not meeting.

This framework was written with the core assumptions in mind:

* A framework should be incrementally adoptable. The larger the framework, the more important it is that you can only use the parts you need.
* A framework should not reinvent the wheel nor proxy native APIs with proprietary ones. If there is a standard (W3C, ideally) way of doing something, it should be done that way.
* A framework should be small. Yes, modern bandwidth is fast _if_ you assume all your users live in the first world and only use desktop computers. In reality, users are paying by the gigabyte for sometimes less-than-ideal bandwidth.
* A framework should be extensible. The easier it is to make the framework do what you need it to, the better. Everyone hates black boxes.
* A framework should make no assumptions about the environment it is developed in. Sure, Typescript has some nice features, but nobody should be forced to use it.

# Usage

## Installation

```
npm install weddell
```

Weddell uses CommonJS and is compatible with NodeJS and bundlers like Browserify. Standalone builds are also available in the `dist` folder, revealing `Weddell` to the global namespace.

## Gearing up
Weddell is customizable, with a plugin system and _many_ preset configurations of those plugins available. You can either choose a preset and run with it, or roll your own implementation, including whatever plugins you want (or writing your own!)

Presets follow a two-character naming convention to indicate included plugins and other features:

* ro - Router.
* fe - Module for fetching assets at runtime.
* do - Bundled with doT, a small templating language.
* vd - Bundled with Virtual DOM, an excellent virtual DOM implementation.
* cv - Transforms CSS assets at runtime to allow for state vars to be used in stylesheets using CSS4 var syntax.
* hv - Transforms HTML to VDOM, necessary if you want to use HTML syntax (or systems that output it) in combination with the VDOM module.
* e5 - Compiles to ES5 syntax and includes necessary polyfills. Note: if you are using a JS bundler and not a standalone build, ES5 transpiling is up to you. Polyfills will be included though.
* ad - Exposes an action dispatcher to components, allowing for Flux-like architecture.

## Getting started
A very basic CommonJS implementation would look like:

`bundle.js`
```javascript
var App = require('weddell').classes.App;

var app = new App({
    el: '#app',
    component: {}
});

app.init();
```
`index.html`
```html
<!doctype html>
<html>
    <head><title>My App</title></head>
    <body>
        <div id='#app'></div>
        <script src='bundle.js'></script>
    </body>
</html>
```

Replace the `require('weddell')` with `Weddell` if you're using a standalone build.

## Component interface

Weddell uses a component-based, declarative plain object API that is similar in some ways to Vue.js. App objects have a single root component, while all other components can have any number of components held inside an object, with the key being the components identifier within the app.

Full docs coming soon

# API Documentation
Coming soon
