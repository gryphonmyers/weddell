// import weddell from "weddell";
// import { Router, route } from "weddell/router";

// const { App, Component } = weddell.use(Router);


// class MyApp extends App {
//     router(router) {
//         return router
//             .use(route`news/${{name: 'slug'}}`, function() {
//                 return 'news'
//             })
//     }

//     async generatePaths({state, routes}) {
//         return [
//             ...routes.map(route => {
//                 switch (route.name) {
//                     case 'news':
//                         return [
//                             ...state.allNewsEntries.map(entry => ({
//                                 path: routes.newsRoute.path({slug: entry.slug}),
//                                 inject: {
//                                     newsEntry: entry
//                                 }
//                             }))
//                         ]
//                     default:
//                         return route.path()
//                 }                
//             })   
//         ]
//     }

//     get Root() {
//         return class extends Component {

//             onMount() {

//             }

//             setupDomElementBindings(element, {state, memory}) {
//                 observer.observe(element)

//                 memory.set('observer', new IntersectionObserver((entries) => {
//                     state.isIntersecting = entries[0].isIntersecting
//                 }, { threshold: [0,1] }))
//             }

//             cleanupDomElementBindings(element, {memory}) {
//                 memory.get('observer').unobserve(element);
//             }

//             setupWindowBindings(window, {state, memory}) {
//                 window.addEventListener('scroll', memory.set('scrollHandler', () => {
//                     state.fooBar = window.pageYOffset
//                 }).get('scrollHandler'))
//             }

//             cleanupWindowBindings(window, {memory}) {
//                 window.removeEventListener('scroll', memory.get('scrollHandler'))
//             }

//             store({reactive, computed, constant, prop, global: { fetch, Date }}, appStore) {
//                 return {
//                     newsEntries: computed(async data =>
//                         fetch(`http://api.com/news`)
//                             .then(res => res.json())
//                     , ({timestamp, value}) => timestamp - Date.now() < 2000),
//                     myThing: reactive('foo'),
//                     otherThing: computed('default', state => 
//                         state.myThing + state.stuff
//                     , ({changedKeys}) => changedKeys),
//                     appThing: constant(12),
//                     forego: appStore.newsPreviews,
//                     wingo: prop('wish', {
//                         validate: val => ['wish', 'you'].includes(val)
//                     })
//                 }
//             }
    
//             template({html, state, slot, component, inputAttrs, id, routes, router, params }) {
//                 return html`
//                     <div ${inputAttrs}>${state.myThing}</div>
//                     <section my-attr="${state.myAttr}">
//                         ${state.newsEntries.map(entry => html`
//                             <article>${component('news-article', { 
//                                 name: entry.name, 
//                                 class: 'foobar', 
//                                 onclick: () => state.myState++,
//                                 oncustomevent: () => state.wingle = 'wumpa'
//                             }, html`<div class="child">${state.weird}</div>`)}</article>
//                         `)}
//                     </section>
//                     ${slot('foobar', html`
//                         ${component('my-component', {
//                             thing: state.myThing
//                         })}
//                         <div class="wongo"></div>
//                     `)}
//                     ${component('my-other-coponent', 
//                         html`
//                         <span slot="wingo" onclick="${() => state.foo++}">
//                             ${state.foo}
//                         </span>
//                         <a href="${routes.news.path({ localeCode: state.localeCode })}"></a>
//                         <h2>${params.item}</h2>
//                         <select onchange="${({target: { value }}) => router.push(routes.foo({ item: value }))}">
//                             <option value="path-1">Path 1</option>
//                         </select>
//                         <div class="worgow">hi</div>
//                         <span class="worthless">wonky</span>
//                         `
//                     )}
//                 `
//             }
            
//             static styles({css, namespace}) {
//                 return css`
//                     ${namespace} {
//                         color: white;
//                     }
//                 `
//             }

//             styles({namespace, state}) {
//                 return [
//                     css`
//                         ${namespace} {
//                             background-image: url(${state.backgroundImage});
//                         }
//                     `,
//                     css`
                        
//                     `
//                 ]
//             }

//             static get components() {
//                 return {
//                     'my-component': class extends Component {

//                         template({state, html}) {
//                             return html`
//                             <div class="dwindle">${state.thing}</div>
//                             `
//                         }

//                         store({prop}) {
//                             return {
//                                 thing: prop({
//                                     validate: val => val == null || val === 'hi'
//                                 })
//                             }
//                         }
//                     }
//                 }
//             }
//         }
//     }

//     store({computed, global: {fetch, Date}}) {
//         return {
//             appThing: 'foobar',
//             newsPreviews: computed(async data =>
//                 fetch(`http://api.com/news`)
//                     .then(res => res.json())
//             , ({timestamp, value, accessed}) => timestamp - Date.now() < 2000),
//             allNewsEntries: computed(async data => 
//                 fetch(`http://api.com/news`)
//                     .then(res => res.json())
//             , ({env}) => env === 'generate')
//         }
//     }
// }

// new MyApp()
//     .init(document.querySelector())
//     .then(() => console.log('hi baby'));




const ava = require('ava');
import createStoreClass from "../../lib/new/store";
import { EventTarget, CustomEvent } from '../../lib/node-event-target';
import createEventEmitterClass from '../../lib/create-event-emitter-class';
import createComponentClass from "../../lib/new/component";
const EventEmitter = createEventEmitterClass({ EventTarget, CustomEvent });
const Store = createStoreClass({EventEmitter, Error});
const Component = createComponentClass({Store, EventEmitter});

ava('Component renders', async test => {
    class MyComponent extends Component {
        store() {
            return {
                foo: 1,
                bar: 2
            }
        }

        template({html, state}) {
            return html`
                <div class="fi">${state.foo}</div>
                <div class="win">${state.bar}</div>
            `
        }
    }

    const comp = new MyComponent();
    const evts = [];
    comp.on('htmlchange', evt => evts.push(evt))

    await comp.init();

    test.is(comp.html.replace(/\s\s+/g, ' ').trim(), `<div class="fi">1</div> <div class="win">2</div>`);
})

ava('Component without store renders', async test => {
    class MyComponent extends Component {

        template({html, state}) {
            return html`
                <div class="fi">${state.foo}</div>
                <div class="win">${state.bar}</div>
            `
        }
    }

    const comp = new MyComponent();
    const evts = [];
    comp.on('htmlchange', evt => evts.push(evt))

    await comp.init();

    test.is(comp.html.replace(/\s\s+/g, ' ').trim(), `<div class="fi"></div> <div class="win"></div>`)
})


ava('Component renders sub component', async test => {
    class MyComponent extends Component {
        store() {
            return {
                foo: 1,
                bar: 2
            }
        }

        template({html, state, component}) {
            return html`
                <div class="fi">${state.foo}</div>
                <div class="win">${state.bar}</div>
                ${component('my-sub-component', {id: "08i6u3"})}
            `
        }

        static get components() {
            return {
                'my-sub-component': class extends Component {
                    store({reactive}) {
                        return {
                            bus: reactive('sho')
                        }
                    }

                    template({html, state}){
                        return html`
                            <div class="fickle">${state.bus}</div>
                        `
                    }
                }
            }
        }
    }

    const comp = new MyComponent();
    const evts = [];
    comp.on('htmlchange', evt => evts.push(evt))

    await comp.init();

    test.is(comp.html.replace(/\s\s+/g, ' ').trim(), `<div class="fi">1</div> <div class="win">2</div> <template id="08i6u3"> <div class="fickle">sho</div> </template>`)
})