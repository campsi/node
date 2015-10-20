'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var transform = require('vinyl-transform');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var bulk = require('bulk-require');
var livereload = require('gulp-livereload');
var nodemon = require('gulp-nodemon');
var stylus = require('gulp-stylus');
var autoprefixer = require('gulp-autoprefixer');
var streamify = require('gulp-streamify');
var bower = require('gulp-bower');

var shouldMinify = false;

var coreDependencies = [
    'campsi',
    'async',
    'cheerio-or-jquery',
    'is-browser',
    'deepcopy',
    'equals',
    'extend',
    'page',
    'array-diff',
    'handlebars'
];

var serverOnlyDependencies = ['cheerio', 'console.table', 'request'];

gulp.task('serve', function () {
    nodemon({
        "verbose": false,
        'ignore': ['**/*.css', '**/*.styl', 'public/**/*'],
        'script': 'bin/www'
    });
});


gulp.task('stylus', function () {
    gulp.src('./stylus/main.styl')
        .pipe(stylus({compress: true}))
        .pipe(autoprefixer({
                  browsers: ['last 2 versions'],
                  cascade: false
              }))
        .pipe(gulp.dest('./public/stylesheets'));

    gulp.src('./stylus/invitation.styl')
        .pipe(stylus({compress: true}))
        .pipe(autoprefixer({
                  browsers: ['last 2 versions'],
                  cascade: false
              }))
        .pipe(gulp.dest('./public/stylesheets'));

    gulp.src('./stylus/profile.styl')
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
        debug: !shouldMinify
    });

    coreDependencies.forEach(function (dep) {
        b.require(dep);
    });

    serverOnlyDependencies.forEach(function (dep) {
        b.exclude(dep);
    });

    var bundle = b.bundle().pipe(source('campsi.core.js')).pipe(streamify(uglify()));
    return bundle.pipe(gulp.dest('./public/javascripts/'));
});

gulp.task('app', function () {

    // set up the browserify instance on a task basis
    var b = browserify('./lib/campsi-app/init.js', {
        bundleExternals: false
    });

    //b.require('filedrop');

    coreDependencies.forEach(function (dep) {
        b.exclude(dep);
    });

    serverOnlyDependencies.forEach(function (dep) {
        b.ignore(dep);
    });

    var bundle = b.bundle().pipe(source('campsi.app.js')).pipe(streamify(uglify()));
    return bundle.pipe(gulp.dest('./public/javascripts/'));
});

gulp.task('standard-components', function () {

    // set up the browserify instance on a task basis
    var b = browserify('./lib/components/map.js', {
        bundleExternals: false
    });

    //b.require('filedrop');

    coreDependencies.forEach(function (dep) {
        b.exclude(dep);
    });

    serverOnlyDependencies.forEach(function (dep) {
        b.ignore(dep);
    });

    var bundle = b.bundle().pipe(source('campsi.components.js')).pipe(streamify(uglify()));
    return bundle.pipe(gulp.dest('./public/javascripts/'));
});


gulp.task('editor', function () {

    // set up the browserify instance on a task basis
    var b = browserify('./lib/components/campsi/map.js', {
        bundleExternals: false
    });

    //b.require('brace');

    coreDependencies.forEach(function (dep) {
        b.exclude(dep);
    });

    serverOnlyDependencies.forEach(function (dep) {
        b.ignore(dep);
    });

    var bundle = b.bundle().pipe(source('campsi.editor.js')).pipe(streamify(uglify()));
    return bundle.pipe(gulp.dest('./public/javascripts/'));
});

gulp.task('watch', function () {
    gulp.watch('lib/campsi/lib/*.js', ['core']);
    gulp.watch('lib/campsi-app/*.js', ['app']);
    gulp.watch('lib/components/**/*.js', ['standard-components', 'editor']);
    gulp.watch('stylus/*.styl', ['stylus']);
});

gulp.task('default', ['core', 'stylus', 'app', 'standard-components', 'editor', 'watch', 'serve']);