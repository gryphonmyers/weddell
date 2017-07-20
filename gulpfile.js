var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var uglify = require('gulp-uglify');
var fs = require('mz/fs');
var uglifyify = require('uglifyify');
var uglifyES = require('uglify-es');
var disc = require('disc');
var path = require('path');
var gulpIf = require('gulp-if');
var del = require('del');
var _ = require('lodash');
var uglifyComposer = require('gulp-uglify/composer');
var zlib = require('zlib');
var streamToPromise = require('stream-to-promise');
var promisify = require('es6-promisify');
var gzip = promisify(zlib.gzip);
var prettySize = require('prettysize');
var colors = require('colors');
var config = require('./package.json');

gulp.task('build', function() {
    return makeBundles('./src/presets', './dist', [{es6: true}]);
});

gulp.task('compile-discs', function() {
    return makeBundles('./src/presets', './disc', [{disc:true}]);
});

gulp.task('compile-dev', function() {
    return makeBundle('implementation/index.js', 'bundle.js', './implementation/js/', {dev: true});
});
gulp.task('compile-dev-dot', function() {
    return makeBundle('implementation/imp-dot.js', 'bundle.js', './implementation/js/', {dev: true});
});

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
                        if (file.toLowerCase().indexOf('e5' > -1)) {
                            opts = Object.assign({es6:false}, opts);
                        }
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
    } else {
        // if (opts.es6) {
        //     parsed.name += '-es6';
        // }
        parsed.name += '-' + config.version;
        if (!opts.dev) {
            parsed.ext = '.min' + parsed.ext;
        }
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
    } else {
        bundleOpts.standalone = 'Weddell';
    }
    if (opts.disc) {
        bundleOpts.fullPaths = true;
    }
    var bundler = browserify(bundleOpts);
    if (opts.dev) {
        bundler.plugin(watchify);
    }
    if (!opts.es6) {
        bundler.transform('babelify', {presets:['es2015']});
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

gulp.task('default',['compile-dev']);
