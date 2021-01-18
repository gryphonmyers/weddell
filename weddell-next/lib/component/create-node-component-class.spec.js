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




import { createStoreClass } from "../store/create-store-class.js";
// import { EventTarget, CustomEvent } from '../../lib/node-event-target';
// import createEventEmitterClass from '../../lib/create-event-emitter-class';
import { IS_DIRTY } from "./create-component-class.js";
import { createNodeComponentClass } from "./create-node-component-class.js";
// const EventEmitter = createEventEmitterClass({ EventTarget, CustomEvent });

// const Component = createComponentClass({Store, EventEmitter});
import EventEmitter from "isomitter";
import test from "ava";
import { createNodeRenderResultClass } from "../render-result/create-node-render-result-class.js";
import { createObservableClass } from "../observable/create-observable-class.js";
import { createPushableObservableClass } from "../observable/create-pushable-observable-class.js";
import { createComputedStateClass } from "../store/create-computed-state-class.js";
import { createReactiveStateClass } from "../store/create-reactive-state-class.js";

const Observable = createObservableClass();
const PushableObservable = createPushableObservableClass({ Observable });
const RenderResult = createNodeRenderResultClass({});
const ReactiveState = createReactiveStateClass({Error, PushableObservable });
const ComputedState = createComputedStateClass({ ReactiveState });
const Store = createStoreClass({ PushableObservable, Error, ReactiveState, ComputedState });
const Component = createNodeComponentClass({Store, PushableObservable, Error, RenderResult});

function trimHtmlWhitespace(html) {
    return html.replace(/\s\s+/g, ' ').trim()
}

test('Component renders', async t => {

    class MyComponent extends Component {
        static fetchStuff() {
            this.fug = thing;
        }

        static state = ({reactive, computed}) => ({
            fug: reactive(4),
            dug: reactive('worry'),
            wug: computed(store => `${store.dug} ${store.fug} times`)
        })      

        static template = ({html, state}) =>
             html`
                <div class="gar">${state.wug}</div>
            `
    }

    const comp = new MyComponent();
    const evts = [];

    comp
        .filter(evt => evt.eventName === 'htmlchange')
        .subscribe({
            next(evt) {
                evts.push(evt)
            }
        });

    await comp.init();

    t.deepEqual(evts.map(({html, prevHtml}) => ({
        html: trimHtmlWhitespace(html), 
        prevHtml: prevHtml && trimHtmlWhitespace(prevHtml) 
    })), [
        {
            prevHtml: null,
            html: `<div class="gar">worry 4 times</div>`
        }
    ]);
});

test('Component rerenders when state changes', async t => {

    class MyComponent extends Component {
        static state = ({reactive, computed}) => ({
            fug: reactive(4),
            dug: reactive('worry'),
            wug: computed(store => `${store.dug} ${store.fug} times`)
        })

        static template = ({html, state}) =>
             html`
                <div class="gar">${state.wug}</div>
            `
    }

    const comp = new MyComponent();
    const evts = [];

    comp
        .filter(evt => evt.eventName === 'htmlchange')
        .subscribe({
            next(evt) {
                evts.push(evt)
            }
        });

    await comp.init();

    
    t.false(comp[IS_DIRTY]);
    t.falsy(comp.renderPromise);

    comp.state.fug = 5;
    comp.state.fug = 6;
    comp.state.fug = 7;

    t.true(comp[IS_DIRTY]);

    t.truthy(comp.renderPromise);

    await comp.renderPromise

    comp.state.fug = 2;

    await comp.renderPromise

    t.deepEqual(evts.map(({html, prevHtml, eventName}) => ({
        eventName,
        html: trimHtmlWhitespace(html), 
        prevHtml: prevHtml && trimHtmlWhitespace(prevHtml) 
    })), [
        {
            eventName: 'htmlchange',
            prevHtml: null,
            html: `<div class="gar">worry 4 times</div>`
        },
        {
            eventName: 'htmlchange',
            prevHtml: '<div class="gar">worry 4 times</div>',
            html: `<div class="gar">worry 7 times</div>`
        },
        {
            eventName: 'htmlchange',
            prevHtml: '<div class="gar">worry 7 times</div>',
            html: `<div class="gar">worry 2 times</div>`
        }
    ]);
});

test('Component without store renders', async t => {
    class MyComponent extends Component {

        static template({html}) {
            return html`
                <div class="fi"></div>
                <div class="win"></div>
            `
        }
    }

    const comp = new MyComponent();
    const evts = [];
    comp
        .filter(evt => evt.eventName === 'htmlchange')
        .map(({prevHtml, html}) => ({prevHtml: prevHtml && trimHtmlWhitespace(prevHtml), html: trimHtmlWhitespace(html) }))
        .subscribe({
            next(evt) {
                evts.push(evt)
            }
        });

    await comp.init();
    
    t.deepEqual(evts, [
        {
            html: '<div class="fi"></div> <div class="win"></div>',
            prevHtml: null
        }
    ])
    // test.is(comp.html, `<div class="fi"></div> <div class="win"></div>`)
});

test('Component renders sub component', async t => {

    class SubComponent extends Component {
        static template = ({html}) => 
            html`
                <div class="gordi"></div>
            `
    }

    class MyComponent extends Component {

        static template = ({html, component}) => 
            html`
                <div class="fi"></div>
                <div class="win">
                    ${component('SubComponent')}
                </div>
            `

        static components = {
            SubComponent
        }
    }

    const comp = new MyComponent();
    const evts = [];
    comp
        .filter(evt => ['htmlchange', 'renderfinish'].includes(evt.eventName))
        .map(({eventName, renderResult, prevHtml, html}) => 
            eventName === 'htmlchange'
                ? ({prevHtml: prevHtml && trimHtmlWhitespace(prevHtml), html: trimHtmlWhitespace(html) })
                : ({renderResult: { html: trimHtmlWhitespace(renderResult.html) } })
        )
        .subscribe({
            next(evt) {
                evts.push(evt)
            }
        });

    await comp.init();
    
    t.deepEqual(evts, [
        {
            html: '<div class="fi"></div> <div class="win"> <div class="gordi"></div> </div>',
            prevHtml: null
        },
        {
            renderResult: { html: '<div class="fi"></div> <div class="win"> <template id="component-SubComponent-0-0"></template> </div>' }
        }
    ]);
})


test('Component resolves and renders async component', async t => {
    class MyComponent extends Component {
        static state() {
            return {
                foo: 1,
                bar: 2
            }
        }

        static template({html, state, component}) {
            return html`
                <div class="fi">${state.foo}</div>
                <div class="win">${state.bar}</div>
                ${component('my-sub-component')}
            `
        }

        static components = {
            'my-sub-component': () => new Promise(resolve => setTimeout(() => {
                resolve(class extends Component {
                    static state({reactive}) {
                        return {
                            bus: reactive('sho')
                        }
                    }

                    static template({html, state}){
                        return html`
                            <div class="fickle">${state.bus}</div>
                        `
                    }
                })
            }, 1000))
        }
    }

    const comp = new MyComponent();
    const evts = [];
    comp
        .filter(evt => ['htmlchange', 'renderfinish'].includes(evt.eventName))
        .map(({eventName, renderResult, prevHtml, html}) => 
            eventName === 'htmlchange'
                ? ({prevHtml: prevHtml && trimHtmlWhitespace(prevHtml), html: trimHtmlWhitespace(html) })
                : ({renderResult: { html: trimHtmlWhitespace(renderResult.html) } })
        )
        .subscribe({
            next(evt) {
                evts.push(evt)
            }
        });

    await comp.init();
    
    t.deepEqual(evts, [
        {
            html: '<div class="fi">1</div> <div class="win">2</div> <div class="fickle">sho</div>',
            prevHtml: null
        },
        {
            renderResult: { 
                html: '<div class="fi">1</div> <div class="win">2</div> <template id="component-my-sub-component-0-0"></template>' 
            }
        }
    ]);
})

test('Component rerenders on state change', async t => {
    class MyComponent extends Component {
        static state({reactive}) {
            return {
                foo: reactive(1),
                bar: reactive(2)
            }
        }

        static template({html, state}) {
            return html`
                <div class="fi">${state.foo}</div>
                <div class="win">${state.bar}</div>
            `
        }
    }

    const comp = new MyComponent();
    const evts = [];
    comp
        .filter(evt => ['htmlchange', 'renderfinish'].includes(evt.eventName))
        .map(({eventName, renderResult, prevHtml, html}) => 
            eventName === 'htmlchange'
                ? ({prevHtml: prevHtml && trimHtmlWhitespace(prevHtml), html: trimHtmlWhitespace(html) })
                : ({renderResult: { html: trimHtmlWhitespace(renderResult.html) } })
        )
        .subscribe({
            next(evt) {
                evts.push(evt)
            }
        });

    await comp.init();
    t.deepEqual(evts, [
        {
            html: '<div class="fi">1</div> <div class="win">2</div>',
            prevHtml: null
        },
        {
            renderResult: { 
                html: '<div class="fi">1</div> <div class="win">2</div>' 
            }
        }
    ]);

    comp.state.foo++
    comp.state.bar--

    await comp.renderPromise

    t.deepEqual(evts, [
        {
            html: '<div class="fi">1</div> <div class="win">2</div>',
            prevHtml: null
        },
        {
            renderResult: { 
                html: '<div class="fi">1</div> <div class="win">2</div>' 
            }
        },
        {
            html: '<div class="fi">2</div> <div class="win">1</div>',
            prevHtml: '<div class="fi">1</div> <div class="win">2</div>'
        },
        {
            renderResult: { 
                html: '<div class="fi">2</div> <div class="win">1</div>' 
            }
        }
    ]);
})

test.todo('Child component state change causes render');


test.skip('Component renders content into slot', async test => {
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
                ${component('my-sub-component', {id: "08i6u3"}, html`
                    <div class="wigga">${state.bar}</div>
                `)}
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

                    template({html, state, slot}){
                        return html`
                            <div class="fickle">${state.bus}</div>
                            ${slot()}
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

    test.is(comp.html.replace(/\s\s+/g, ' ').trim(), `<div class="fi">1</div> <div class="win">2</div> <template id="08i6u3"> <div class="fickle">sho</div> <div class="wigga">2</div> </template>`)
})

test.skip('State change used by slot content causes rerender', async test => {
    class MyComponent extends Component {
        store({reactive}) {
            return {
                foo: 1,
                bar: reactive(2)
            }
        }

        template({html, state, component}) {
            return html`
                <div class="fi">${state.foo}</div>
                ${component('my-sub-component', {id: "08i6u3"}, html`
                    <div class="wigga">${state.bar}</div>
                `)}
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

                    template({html, state, slot}){
                        return html`
                            <div class="fickle">${state.bus}</div>
                            ${slot()}
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

    test.is(comp.html.replace(/\s\s+/g, ' ').trim(), `<div class="fi">1</div> <template id="08i6u3"> <div class="fickle">sho</div> <div class="wigga">2</div> </template>`)

    comp.state.bar++

    await comp.renderPromise

    test.is(comp.html.replace(/\s\s+/g, ' ').trim(), `<div class="fi">1</div> <template id="08i6u3"> <div class="fickle">sho</div> <div class="wigga">3</div> </template>`)

})

test('Renders prop values into child', async t => {
    class MyComponent extends Component {
        static state({reactive}) {
            return {
                foo: reactive(1),
                bar: reactive(2)
            }
        }

        static template({html, state, component}) {
            return html`
                <div class="fi">${state.foo}</div>
                ${component('SubComponent', { fog: state.bar })}
            `
        }

        static components = {
            SubComponent: class extends Component {
                static state({prop}) {
                    return {
                        fog: prop(17)
                    }
                }
        
                static template({html, state}) {
                    return html`
                        <div class="bip">${state.fog}</div>
                    `
                }
            }
        }
    }

    const comp = new MyComponent();
    const evts = [];
    comp
        .filter(evt => ['htmlchange', 'renderfinish'].includes(evt.eventName))
        .map(({eventName, renderResult, prevHtml, html}) => 
            eventName === 'htmlchange'
                ? ({prevHtml: prevHtml && trimHtmlWhitespace(prevHtml), html: trimHtmlWhitespace(html) })
                : ({renderResult: { html: trimHtmlWhitespace(renderResult.html) } })
        )
        .subscribe({
            next(evt) {
                evts.push(evt)
            }
        });

    await comp.init();
    t.deepEqual(evts, [
        {
            html: '<div class="fi">1</div> <div class="bip">2</div>',
            prevHtml: null
        },
        {
            renderResult: { 
                html: '<div class="fi">1</div> <template id="component-SubComponent-0-0"></template>' 
            }
        }
    ]);

    comp.state.bar--

    await comp.renderPromise

    t.deepEqual(evts, [
        {
            html: '<div class="fi">1</div> <div class="bip">2</div>',
            prevHtml: null
        },
        {
            renderResult: { 
                html: '<div class="fi">1</div> <template id="component-SubComponent-0-0"></template>' 
            }
        },
        {
            html: '<div class="fi">1</div> <div class="bip">1</div>',
            prevHtml: '<div class="fi">1</div> <div class="bip">2</div>'
        },
        {
            renderResult: { 
                html: '<div class="fi">1</div> <template id="component-SubComponent-0-0"></template>' 
            }
        }
    ]);
});

test.todo('Validates prop values');

test.todo('Uses default prop value when nullish value is passed in');
test.todo('Re-renders when prop values from parent change');
test.todo('Unsupported props default to attrs');
test.todo('Errors when infinite render loop is detected');