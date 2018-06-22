const Mixin = require('mixwith-es5').Mixin;
const defaults = require('defaults-es6/deep-merge');
const svg = require('virtual-dom/virtual-hyperscript/svg');
const VdomThunk = require('../../core/vdom-thunk');

class SvgVdomThunk extends VdomThunk {
    constructor(opts) {
        super(opts);
        this.id = opts.id;
    }

    render() {
        var href = this.component.getSvgHref(this.id);
        return href ? svg('svg.weddell-svg', [
            svg('use', {
                'xlink:href': '#' + href
            })
        ]) : null;
    }
}

const defaultComponentOpts = {
    SVGFormat: '(locals)=>SVGString',
    SVGTransforms: [],
    targetSVGRenderFormat: 'SVGString'
};

function parseSvg(svg, id) {
    //taken from http://stackoverflow.com/questions/3642035/jquerys-append-not-working-with-svg-element
    var div= document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
    div.innerHTML= '<svg xmlns="http://www.w3.org/2000/svg">'+svg+'</svg>';
    var frag= document.createDocumentFragment();
    while (div.firstChild.firstChild) {
        div.firstChild.firstChild.id = id;
        frag.appendChild(div.firstChild.firstChild);
    }
    return frag;
};

module.exports = function(_Weddell){
    return _Weddell.plugin({
        id: 'svg',
        classes:  {
            App: Mixin(function(App){
                return class extends App {

                    static get patchMethods() {
                        return ['patchSVG'].concat(super.patchMethods);
                    }

                    initPatchers() {
                        super.initPatchers()
                        this.svgEl = document.createElementNS('http://www.w3.org/1999/xhtml', 'svg');
                        document.body.appendChild(this.svgEl);
                        this.svgEl.style.display = 'none';
                    }

                    static processSvg() {
                        //@TODO be more consistent about what we expect svg to look like
                        // else if (Array.isArray(output)) {
                        //     return output.map(this.processSvgOutput);
                        // } else if (output && typeof output === 'object') {
                        //     if (output.ID || output.SVG) {
                        //         console.warn('You are using deprecated syntax. svg assets should be strings with ids inline.')
                        //     }
                        //     return output;
                        // } else {
                        //     return () => {
                        //         return [] || null;
                        //     }
                        // }  
                    }

                    patchSVG(patchRequests) {
                        var results = patchRequests.reduceRight((acc, item) => {
                            if (!(item.classId in acc)) {
                                acc[item.classId] = item;
                            }
                            return acc;
                        }, {});

                        var cachedSVG = {};
                        var toWalk = Object.values(this.component.reduceComponents((acc, curr, depth) => {
                            if (!(curr.constructor.id in acc)) {
                                acc[curr.constructor.id] = {
                                    classId: curr.constructor.id
                                };   
                            }
                            cachedSVG[curr.constructor.id] = curr._renderCache.renderSvg;
                            return acc;
                        }, results));

                        var mountedSvgs = {};

                        var leftovers = toWalk.reduce((acc, curr) => {
                            var cachedSvg = cachedSVG[curr.classId];
                            if (curr.results) {
                                if (curr.results.renderSvg) {
                                    curr.results.renderSvg.forEach(svgObj => {
                                        var svgId = `svg-sprite-${curr.classId}-${svgObj.ID}`;
                                        var svgIndex = acc.findIndex(svgEl => svgEl.id === svgId);
                                        
                                        var el = parseSvg(svgObj.SVG, svgId);
                                        if (svgIndex !== -1) {
                                            //element exists. we need to replace it with the new version.
                                            this.svgEl.removeChild(final.splice(svgIndex, 1));   
                                        }
                                        this.svgEl.appendChild(el);
                                        mountedSvgs[svgId] = 1;
                                    })
                                } else {
                                    //our patch is null, so let's wipe out any previously mounted svgs
                                    if (cachedSvg) {
                                        cachedSvg.forEach(svgObj => {
                                            var svgId = `svg-sprite-${curr.classId}-${svgObj.ID}`;
                                            var svgIndex = acc.findIndex(svgEl => svgEl.id === svgId);

                                            if (svgIndex > -1) {
                                                //an element does exist. Let's leave it and it will get removed later.
                                            }
                                        })
                                    } else {
                                        //we didn't previously mount anything so no action needed.
                                    }
                                }                                
                            } else {
                                //no patch needed, we just need to make sure we don't remove the existing element
                                if (cachedSvg) {
                                    
                                    cachedSvg.forEach(svgObj =>{
                                        var svgId = `svg-sprite-${curr.classId}-${svgObj.ID}`;
                                        mountedSvgs[svgId] = 1;
                                        var svgIndex = acc.findIndex(svgEl => svgEl.id === svgId);
                                        if (svgIndex === -1) {
                                            //this component doesn't have any svg elements. It probably just hasn't requested a patch yet.
                                        } else {
                                            el = final.splice(svgIndex, 1);
                                        }
                                    });
                                } else {
                                    //this component didn't have svgs anyway
                                }
                            }
                            return acc;                            
                        }, Array.from(this.svgEl.querySelectorAll('svg.weddell-svg')));

                        leftovers.forEach(svgEl => {
                            delete mountedSvgs[svgEl.id];
                            this.svgEl.removeChild(svgEl);
                        });

                        this.component._mountedSvgs = mountedSvgs;
                    }
                }
            }),
            Component: Mixin(function(Component){
                var SvgComponent = class extends Component {
                    
                    static get renderMethods() {
                        return super.renderMethods.concat('renderSvg');
                    }

                    static get tagDirectives() {
                        return Object.assign({}, super.tagDirectives, {
                            'svgsprite': function(vNode, content, attrs={}) {
                                if (attrs.SVGID) {
                                    console.warn("You are using deprecated syntax. 'SVGID' property of svgsprite has been changed to 'svgId'")
                                }
                                return new SvgVdomThunk({id: attrs.svgId || attrs.SVGID, component: this});
                            }
                        });
                    }

                    onRenderSvg() {
                        //noop
                    }

                    static get svg() {
                        return null
                    }

                    getSvgHref(ID) {
                        return this.reduceParents((acc, component, stopRecursion) => {
                            var href = `svg-sprite-${component.constructor.id}-${ID}`;
                            if (href in this.root._mountedSvgs) {
                                stopRecursion()
                            }
                            return href || acc;                            
                        }, null);
                    }

                    renderSvg() {
                        return this.svgTemplate();
                    }

                    static processSvgOutput(output) {
                        if (typeof output === 'function') {
                            return this.processSvgOutput(output.call(this));
                        } else {
                            return () => {
                                return output || null;
                            }
                        }                        
                    }

                    constructor(opts) {
                        opts = defaults(opts, defaultComponentOpts);

                        super(opts);

                        if (opts.isRoot) {
                            Object.defineProperty(this, '_mountedSvgs', { value: null, writable: true });
                        }

                        if (this.SVG) {
                            console.warn('You are using deprecated syntax. Please make use a static getter method "svg"')
                        }
                        var template = this.constructor.processSvgOutput(this.constructor.svg || this.constructor.SVG || this.SVG);
                        
                        this.svgTemplate = this.wrapTemplate(template, 'renderSvg');
                    }
                }

                return SvgComponent;
            })
        }
    });
}
