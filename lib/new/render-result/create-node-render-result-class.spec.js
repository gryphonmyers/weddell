import test from "ava";
import { createNodeRenderResultClass } from "./create-node-render-result-class";
import createHtmlTemplateTag from "../create-html-template-tag";
import unescape from "./directives/unescape";

const RenderResult = createNodeRenderResultClass();
const html = createHtmlTemplateTag({RenderResult});

test('Render result compiles to HTML string', t => {
    const stuff = [];

    const renderResult = html`
        <div onclick="${(evt) => stuff.push(evt)}">
            ${"<div>hi</div>"}
            <div class="foo">
                ${[
                    html`<div class="win">No</div>`,
                    html`<div class="grab">Fob</div>`
                ]}
            </div>
            ${unescape(
                "<div class='baby'>Nana</div>"
            )}
        </div>
    `;

    const artifact = renderResult.toArtifact();
    renderResult.invokeHandler(0, {foo:'bar'});

    t.is(artifact, `
        <div onclick="this.dispatchEvent(new CustomEvent("eventproxy",{detail:{event,token:"0"},bubbles:true}))">
            &lt;div&gt;hi&lt;/div&gt;
            <div class="foo">
                <div class="win">No</div><div class="grab">Fob</div>
            </div>
            <div class='baby'>Nana</div>
        </div>
    `);

    t.deepEqual(stuff, [{foo: 'bar'}])
});


// test('Render result patches', t => {
//     const stuff = [];

//     const renderResult = html`
//         <div onclick="${(evt) => stuff.push(evt.target)}">
//             ${"<div>hi</div>"}
//             <div class="foo">
//                 ${[
//                     html('win')`<div class="win">No</div>`,
//                     html('grab')`<div class="grab">Fob</div>`
//                 ]}
//             </div>
//             ${unescape(
//                 "<div class='baby'>Nana</div>"
//             )}
//         </div>
//     `;

//     t.is(renderResult.getPatchedArtifact(), `
//         <div onclick="this.dispatchEvent(new CustomEvent("eventproxy",{detail:{event,token:"0"},bubbles:true}))">
//             &lt;div&gt;hi&lt;/div&gt;
//             <div class="foo">
//                 <div class="win">No</div><div class="grab">Fob</div>
//             </div>
//             <div class='baby'>Nana</div>
//         </div>
//     `);    
// });

// test('Patch against', t => {
//     const stuff = [];

//     const renderResult = html`
//         <div onclick="${(evt) => stuff.push(evt.target)}">
//             ${"<div>hi</div>"}
//             <div class="foo">
//                 ${[
//                     html('win')`<div class="win">No</div>`,
//                     html('grab')`<div class="grab">Fob</div>`
//                 ]}
//             </div>
//             ${unescape(
//                 "<div class='baby'>Nana</div>"
//             )}
//         </div>
//     `;

//     const renderResult2 = html`
//         <div onclick="${(evt) => stuff.push(evt.target)}">
//             ${"<div>hi</div>"}
//             <div class="foo">
//                 ${[
//                     html('win')`<div class="win">Bo</div>`,
//                     html`<div class="grab">Fob</div>`
//                 ]}
//             </div>
//             ${unescape(
//                 "<div class='baby'>Nana</div>"
//             )}
//         </div>
//     `;

//     renderResult.getPatchedArtifact();
    
//     renderResult2.ingestUnchangedArtifacts(renderResult);
    
//     t.is(renderResult2.getPatchedArtifact(), `
//         <div onclick="this.dispatchEvent(new CustomEvent("eventproxy",{detail:{event,token:"0"},bubbles:true}))">
//             &lt;div&gt;hi&lt;/div&gt;
//             <div class="foo">
//                 <div class="win">Bo</div><div class="grab">Fob</div>
//             </div>
//             <div class='baby'>Nana</div>
//         </div>
//     `);
    
// });


// test('Deep', t => {
//     const stuff = [];

//     const renderResult = html`
//         <div onclick="${(evt) => stuff.push(evt.target)}">
//             ${"<div>hi</div>"}
//             <div class="foo">
//                 ${[
//                     html('win')`<div class="win">No</div>`,
//                     html('grab')`<div class="grab">${html`<div class="gravy">ok</div>`}</div>`
//                 ]}
//             </div>
//             ${unescape(
//                 "<div class='baby'>Nana</div>"
//             )}
//         </div>
//     `;

//     t.is(renderResult.getPatchedArtifact(), `
//         <div onclick="this.dispatchEvent(new CustomEvent("eventproxy",{detail:{event,token:"0"},bubbles:true}))">
//             &lt;div&gt;hi&lt;/div&gt;
//             <div class="foo">
//                 <div class="win">No</div><div class="grab"><div class="gravy">ok</div></div>
//             </div>
//             <div class='baby'>Nana</div>
//         </div>
//     `);
    
// });