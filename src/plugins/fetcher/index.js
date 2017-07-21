var Mixin = require('mixwith-es5').Mixin;
var defaults = require('object.defaults/immutable');
var defaultOpts = {};

module.exports = function(_Weddell, opts){
    return _Weddell.plugin({
        id: 'fetcher',
        classes:  {
            Component: Mixin(function(Component){
                var Component = class extends Component {
                    constructor(opts) {
                        opts = defaults(opts, defaultOpts);
                        super(opts);
                        if (opts.markupTemplateURL) {
                            this.markupTemplateURL = opts.markupTemplateURL;
                            this._pipelines.markup._isDynamic = true;
                        } else if (opts.markupURL) {
                            this.markupURL = opts.markupURL;
                        }
                        if (opts.stylesTemplateURL) {
                            this.stylesTemplateURL = opts.stylesTemplateURL;
                            this._pipelines.styles._isDynamic = true;
                        } else if (this.stylesURL = opts.stylesURL) {
                            this.stylesURL = opts.stylesURL;
                        }
                        //TODO add data fetch for component state
                        //TODO arbitrary asset loading (html and CSS partials, posisbly images etc)
                        //TODO caching
                        //TODO component assets?
                    }

                    init(opts) {
                        //TODO lazy fetch on demand
                        var superInit = super.init;
                        return Promise.all([
                                this.fetchAsset('markup'),
                                this.fetchAsset('styles')
                            ])
                            .then(() => superInit.call(this,opts));
                    }

                    fetchAsset(pipelineName) {
                        var promise = Promise.resolve();
                        var pipeline = this._pipelines[pipelineName]
                        var assetURLName = pipeline._isDynamic ? pipelineName + 'TemplateURL': pipelineName + 'URL';
                        var assetName = pipeline._isDynamic ? 'template' : 'static';
                        if (!(pipeline[assetName]) && this[assetURLName]) {
                            promise = fetch(this[assetURLName])
                                .then(res => res.text())
                                .then(responseText => {
                                    pipeline.input = responseText;
                                    pipeline.processInput();
                                }, (err) => {
                                    throw err;
                                });
                        }
                        return promise;
                    }
                }
                return Component;
            })
        }
    });
}
