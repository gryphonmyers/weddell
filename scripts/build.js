var _ = require('lodash');
var browserify = require('browserify');

var defaultBundleOpts = {
    es6: false,
    dev: false,
    disc: false
};

function makeBundle(entryPath, fileName, outputDir, opts) {
    opts = _.defaults(opts, defaultBundleOpts);

    uglify = opts.es6 ? uglifyComposer(uglifyES, console) : uglify;
    uglifyOpts = opts.es6 ? {} : {};

    var parsed = path.parse(fileName);
    if (opts.disc) {
        parsed.ext = '.html';
        parsed.name += '-disc';
    } else if (! opts.dev) {
        // parsed.name += '-' + config.version;
        parsed.ext = '.min' + parsed.ext;
    }
    parsed.base = parsed.name + parsed.ext;
    fileName = path.format(parsed);
    var bundle = function() {
        var stream = bundler.bundle()
            .on('error', function(err){
                console.log(err.toString());
                this.emit('end');
            });

        if (opts.disc) {
            console.log("Writing analysis file:", fileName);
            stream = stream
                .pipe(disc())
                .pipe(fs.createWriteStream(path.join(outputDir, fileName)));
        } else {
            console.log("Starting build:", fileName);
            stream = stream
                .pipe(source(fileName))
                .pipe(buffer())
                .pipe(gulpIf(!opts.dev, uglify(uglifyOpts).on('error', function(err) {
                    console.error(err);
                    this.emit('end');
                })))
                .pipe(gulp.dest(outputDir));
        }

        return streamToPromise(stream)
            .then(function(){
                return fs.readFile(path.join(outputDir, fileName))
                    .then(function(buffer){
                        if (!opts.disc) {
                            return gzip(buffer, {level: 9})
                                .then(function (gBuffer) {
                                    console.log('Wrote file,', fileName);
                                    return {fileName, gzipSize: gBuffer.byteLength, size: buffer.byteLength };
                                });
                        } else {
                            console.log('Wrote analysis file,', fileName, 'Open it in a browser to analyze module sizes.');
                        }
                    });
            });
    };
    var bundleOpts = {};
    if (opts.dev) {
        _.assign(bundleOpts, {cache: {}, packageCache: {}});
    }
    bundleOpts.standalone = 'Weddell';
    if (opts.disc) {
        bundleOpts.fullPaths = true;
    }
    var bundler = browserify(bundleOpts);
    if (opts.dev) {
        bundler.plugin(watchify);
    }

    if (!opts.es6) {
        bundler.transform('babelify', {
            presets:['es2015'],
            global: true
        });
    }

    if (!opts.dev && !opts.es6) { //right now we skip uglify on es6 because newer uglifyify versions supporting es6 are broken
        bundler.transform(uglifyify, {global: true, ignore: ['*.css', '*.pug']});
    }

    bundler.add(entryPath);
    bundler.on('update', bundle);
    bundler.on('log', msg => console.log(msg));
    bundler.on('error', err => console.error(err));

    return bundle();
}


function makeBundles(entryDir, outputDir, optsArr) {
    if (!optsArr) optsArr = [{}];
    return Promise.all([
            fs.readdir(entryDir),
            del(path.join(outputDir, '*'))
        ])
        .then(function(results){
            var files = results[0];
            return Promise.all(_.flatMap(files, file => {
                    return optsArr.map(function(opts){
                        opts = Object.assign(opts, {es6: !(file.toLowerCase().indexOf('e5')  > -1) })
                        // console.log(opts);
                        return makeBundle(path.join(entryDir, file), file, outputDir, opts);
                    });
                }))
                .then(function(result){
                    result = _.compact(result);
                    if (result.length) {
                        console.log("Build stats:\n" +
                            _.sortBy(result, 'size', 'desc').map(function(fileObj){
                                return fileObj.fileName + ': ' + colors.green(prettySize(fileObj.size)) + ' (minified), ' + colors.cyan(prettySize(fileObj.gzipSize)) + ' (gzipped)\n';
                            }).join('')
                        );
                    }
                });
        })
}

makeBundles('./lib/presets', './dist', [{}]);