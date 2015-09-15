'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var bulk = require('bulk-require');
var livereload = require('gulp-livereload');
var nodemon = require('gulp-nodemon');
var stylus = require('gulp-stylus');
var autoprefixer = require('gulp-autoprefixer');


var shouldMinify = false;
var coreDependencies = ['campsi', 'async', 'cheerio-or-jquery', 'is-browser', 'deepcopy', 'equals', 'extend'];
var serverOnlyDependencies = ['cheerio'];

gulp.task('serve', function () {
    nodemon({'script': 'bin/www'});
});


gulp.task('stylus', function () {
    gulp.src('./stylus/main.styl')
        .pipe(stylus({compress: true}))
        .pipe(autoprefixer({
                  browsers: ['last 2 versions'],
                  cascade: false
              }))
        .pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('core', function () {

    // set up the browserify instance on a task basis
    var b = browserify({
        //noParse: ['cheerio'],
        debug: !shouldMinify
    });

    coreDependencies.forEach(function (dep) {
        b.require(dep);
    });

    serverOnlyDependencies.forEach(function (dep) {
        b.exclude(dep);
    });

    var bundle = b.bundle().pipe(source('campsi.core.js'));

    if (shouldMinify) {
        bundle.pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify())
            .on('error', gutil.log)
            .pipe(sourcemaps.write('./'))
    }

    return bundle.pipe(gulp.dest('./public/javascripts/'));
});

gulp.task('standard-components', function () {
    // set up the browserify instance on a task basis
    var b = browserify(['./lib/components/map.js'], {
        transform: ['bulkify'],
        bundleExternals: false,
        debug: !shouldMinify
    });

    coreDependencies.forEach(function (dep) {
        b.exclude(dep);
    });

    serverOnlyDependencies.forEach(function (dep) {
        b.exclude(dep);
    });

    var bundle = b.bundle().pipe(source('campsi.components.js'));

    if (shouldMinify) {
        bundle.pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify())
            .on('error', gutil.log)
            .pipe(sourcemaps.write('./'))

    }
    return bundle.pipe(gulp.dest('./public/javascripts/'));
});

gulp.task('watch', function () {
    livereload.listen(3001);
    gulp.watch('lib/campsi/lib/*.js', ['core']);
    gulp.watch('lib/components/**/component.js', ['standard-components']);
    gulp.watch('stylus/*.styl', ['stylus']);
});

gulp.task('default', ['core', 'stylus', 'standard-components', 'watch', 'serve']);