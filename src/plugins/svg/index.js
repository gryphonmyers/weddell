var Mixin = require('mixwith-es5').Mixin;
var mix = require('mixwith-es5').mix;
var defaults = require('defaults-es6/deep-merge');
var parseSVG = require('./parse-svg');
var svg = require('virtual-dom/virtual-hyperscript/svg');

var defaultComponentOpts = {
    SVGFormat: '(locals)=>SVGString',
    SVGTransforms: [],
    targetSVGRenderFormat: 'SVGString'
};

module.exports = function(_Weddell){
    return _Weddell.plugin({
        id: 'svg',
        classes:  {
            App: Mixin(function(App){
                return class extends App {
                    constructor(opts) {
                        super(opts);

                        this.renderOrder.push('svg');
                        this.pipelines.svg = {
                            init: 'initSVG',
                            render: 'renderSVG',
                            componentEvent: 'rendersvg'
                        };
                        this.mountedSVGs = {};
                    }

                    initSVG() {
                        this.SVGEl = document.createElementNS('http://www.w3.org/1999/xhtml', 'svg');
                        document.body.appendChild(this.SVGEl);
                        this.SVGEl.style.display = 'none';
                    }

                    renderSVG(evt) {
                        var processOwner = (input, owner, ID, unmountedSVGs) => {
                            if (Array.isArray(input)) {
                                input.forEach(item => processOwner(item, owner, ID, unmountedSVGs))
                            } else {

                                if (!(ID in this.mountedSVGs)) {
                                    this.mountedSVGs[ID] = {};
                                }

                                if (!(input.ID in owner.availableSVGs)) {
                                    owner.availableSVGs[input.ID] = 1;
                                }

                                if (!(input.ID in this.mountedSVGs[ID])) {
                                    if (!owner.makeSVGHREF(input.ID)) debugger;
                                    var el = parseSVG(input.SVG, owner.makeSVGHREF(input.ID));
                                    this.SVGEl.appendChild(el);
                                    this.mountedSVGs[ID][input.ID] = {
                                        ID: input.ID,
                                        el,
                                        availableTo: []
                                    };
                                }

                                if (!(input.ID in owner.availableSVGs)) {
                                    this.mountedSVGs[ID][input.ID].availableTo.push(owner);
                                }

                                delete unmountedSVGs[ID];
                            }
                        }

                        var processSVG = (unmountedSVGs, obj) => {
                            [
                                obj.component.constructor.SVG ? [obj.component.constructor.SVG, obj.component.constructor, obj.component.constructor._BaseClass._id, unmountedSVGs] : null, 
                                obj.output ? [obj.output, obj.component, obj.component._id, unmountedSVGs] : null
                            ].forEach(argsArr => {
                                if (argsArr) {
                                    processOwner.apply(this, argsArr)
                                }
                            })

                            if (obj.components) {
                                obj.components.forEach(processSVG.bind(this, unmountedSVGs));
                            }

                            return unmountedSVGs;
                        };

                        var unmountedSVGs = processSVG(Object.assign({}, this.mountedSVGs), evt);

                        for (var ownerID in unmountedSVGs) {
                            for (var SVGID in this.mountedSVGs[ownerID]) {
                                var obj = this.mountedSVGs[ownerID][SVGID];

                                obj.el.parentNode && obj.el.parentNode.removeChild(obj.el);

                                obj.availableTo.forEach(owner => owner.availableSVGs = {})
                            }
                            delete this.mountedSVGs[ownerID];
                        }
                    }
                }
            }),
            Component: Mixin(function(Component){
                var SVGComponent = class extends Component {

                    onRenderSVG() {
                        //noop
                    }

                    SVG() {
                        return null
                    }

                    get SVGPrefix() {
                        return 'svg-sprite-' + this._id;
                    }

                    static get SVGPrefix() {
                        return 'svg-sprite-' + (this._BaseClass && this._BaseClass._id) || '';
                    }

                    makeSVGHREF(ID) {
                        return ID in this.availableSVGs ? this.SVGPrefix + '-' + ID : null;
                    }

                    static makeSVGHREF(ID) {
                        return ID in this.availableSVGs ? this.SVGPrefix + '-' + ID : null;
                    }

                    static getSVGHREF(ID) {
                        return this.makeSVGHREF(ID);
                    }

                    renderSVGSprite(content, attrs) {
                        var href = this.getSVGHREF(attrs.SVGID);
                        return href ? svg('svg', [
                            svg('use', {
                                'xlink:href': '#' + href
                            })
                        ]) : null;
                    }

                    renderSVG() {
                        return this._pipelines.svg.render()
                            .then(output => {
                                return Promise.all(this.getMountedChildComponents().map(instance => instance.renderSVG()))
                                    .then(components => {

                                        var evtObj = {
                                            components,
                                            component: this,
                                            output: output
                                        };

                                        this.trigger('rendersvg', evtObj);

                                        return  evtObj;
                                    })                                
                            })
                    }

                    makeComponentClass() {
                        var newClass = super.makeComponentClass.apply(this, arguments);
                        newClass.availableSVGs = {};
                        return newClass;
                    }

                    constructor(opts) {
                        opts = defaults(opts, defaultComponentOpts);

                        super(opts);

                        var Pipeline = this.constructor.Weddell.classes.Pipeline;
                        var Sig = this.constructor.Weddell.classes.Sig;

                        this._pipelines.svg = new Pipeline({
                            name: 'svg',
                            store: this._locals,
                            onRender: this.onRenderSVG.bind(this),
                            isDynamic: true,
                            inputFormat: new Sig(opts.SVGFormat),
                            transforms: opts.SVGTransforms,
                            targetRenderFormat: opts.targetSVGRenderFormat,
                            input: this.SVG.bind(this)
                        })

                        Object.defineProperty(this, 'getSVGHREF', {
                            value: function(ID){
                                return this.makeSVGHREF(ID) || this.constructor.makeSVGHREF(ID) || (opts.parentComponent ? opts.parentComponent.getSVGHREF(ID) : null)
                            }.bind(this)
                        });

                        this.availableSVGs = {};
                        this._renderMethods.svg = 'renderSVG';

                        this.addTagDirective('SVGSprite', this.renderSVGSprite.bind(this));
                    }
                }

                SVGComponent.availableSVGs = {};

                return SVGComponent;
            })
        }
    });
}
