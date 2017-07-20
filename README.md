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

#Usage
##Installation

```
npm install weddell
```

Weddell uses CommonJS and is compatible with NodeJS and bundlers like Browserify. Standalone builds are also available in the `dist` folder, revealing `Weddell` to the global namespace.

##Gearing up
Weddell is customizable, with a plugin system and _many_ preset configurations of those plugins available. You can either choose a preset and run with it, or roll your own implementation, including whatever plugins you want (or writing your own!)

Presets follow a two-character naming convention to indicate included plugins and other features:

* ro - Router.
* fe - Module for fetching assets at runtime.
* do - Bundled with doT, a small templating language.
* vd - Bundled with Virtual DOM, an excellent virtual DOM implementation.
* cv - Transforms CSS assets at runtime to allow for state vars to be used in stylesheets using CSS4 var syntax.
* hv - Transforms HTML to VDOM, necessary if you want to use HTML syntax (or systems that output it) in combination with the VDOM module.
* e5 - Compiles to ES5 syntax and includes necessary polyfills. Note: if you are using a JS bundler and not a standalone build, ES5 transpiling is up to you. Polyfills will be included though.

##Getting started
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

##Component interface

Weddell uses a component-based, declarative plain object API that is similar in some ways to Vue.js. App objects have a single root component, while all other components can have any number of components held inside an object, with the key being the components identifier within the app:

```javascript
var app = new App({
    el: '#app',
    component: {
        state: {},
        components: {
            myHeader: {
                state: {}
            },
            myBody: {

            }
            myFooter: {
                state: {}
            }
        }
    }
});
```
Note that all component definitions have a `state` member. This is just a key/value pair store. Put whatever you want in here.

```javascript
var app = new App({
    el: '#app',
    component: {
        state: {
            myAppTitle: 'A compendium of frog species'
        },
        components: {
            myHeader: {
                state: {
                    headerText: 'Who doesn\'t love frogs?'
                }
            },
            myFooter: {
                state: {
                    footerText: 'Copyright 2016, David Attenborough'
                }
            }
        }
    }
});
```
Cool, we have some text, but nothing is showing up on the page yet. You need to pass in some markup, obvs! You have a lot of options here, depending on which plugins you're using (this is the main reason Weddell exists). For now, we're going to go with the most basic option: some static markup:

```javascript
var app = new App({
    el: '#app',
    component: {
        markup: "<div>Cool, I can see this text</div>",
        state: {
            myAppTitle: 'A compendium of frog species'
        },
        components: {
            myHeader: {
                markup: "<header>Hey wait a sec</header>",
                state: {
                    headerText: 'Who doesn\'t love frogs?'
                }
            },
            myFooter: {
                markup: "<footer>But how do I use that other text</footer>"
                state: {
                    footerText: 'Copyright 2016, David Attenborough'
                }
            }
        }
    }
});
```
This will in fact render some static HTML to the page. Not super impressive. We can instead use the `markupTemplate` option and pass in a function that returns some html.

```javascript
var app = new App({
    el: '#app',
    component: {
        markupTemplate: function(locals){
            return '<div>' + locals.myAppTitle + '</div>';
        },
        state: {
            myAppTitle: 'A compendium of frog species'
        },
        components: {
            myHeader: {
                markupTemplate: function(locals){
                    return '<header>' + locals.headerText + '</header>';
                },
                state: {
                    headerText: 'Who doesn\'t love frogs?'
                }
            },
            myBody: {
                state: {

                }
            },
            myFooter: {
                markupTemplate: function(locals){
                    '<footer>' + locals.footerText + '</footer>'
                },
                state: {
                    footerText: 'Copyright 2016, David Attenborough'
                }
            }
        }
    }
});
```
Cool! Now the text from our component state is being rendered to the page. That's nice, but still not incredibly impressive. Let's try something fancy:

```javascript
var app = new App({
    el: '#app',
    component: {
        markupTemplate: function(locals){
            return '<div>' + locals.myAppTitle + '</div>';
        },
        state: {
            myAppTitle: 'A compendium of frog species'
        },
        components: {
            myHeader: {
                markupTemplate: function(locals){
                    return '<header>' + locals.headerText + '</header>';
                },
                state: {
                    headerText: 'Who doesn\'t love frogs?'
                }
            },
            myBody: {
                state: {

                }
            },
            myFooter: {
                markupTemplate: function(locals){
                    '<footer>' + locals.footerText + '</footer>'
                },
                state: {
                    footerText: 'Copyright 2016, David Attenborough'
                },
                onInit: function(){
                    setTimeout(function(){
                        this.state.footerText = 'Just kidding, copyright 2017, some other guy';
                    }.bind(this), 3000);
                }
            }
        }
    }
});
```
There is something new here: we are assigning an `onInit` callback to the myFooter component to change the footerText 3 seconds after the component inits. Weddell is reactive, so every time you alter app state, the DOM will update itself.

To be continued...

# API Documentation
Coming soon
