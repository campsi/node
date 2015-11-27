'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var transform = require('vinyl-transform');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var nodemon = require('gulp-nodemon');
var stylus = require('gulp-stylus');
var autoprefixer = require('gulp-autoprefixer');
var streamify = require('gulp-streamify');
var bower = require('gulp-bower');
var config = require('./config');
var shouldMinify = false;

var i18n = require('i18n');
var locales = ['en', 'fr'];

i18n.configure({
    locales: locales,
    directory: './locales'
});

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

var serverOnlyDependencies = ['cheerio', 'console.table', 'request', 'jade', 'path', 'i18n'];

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

    gulp.src('./stylus/editor.styl')
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

    var bundle = b.bundle().pipe(source('campsi.core.js'));

    if(config.env !== 'dev'){
        bundle.pipe(streamify(uglify()));
    }
    return bundle.pipe(gulp.dest('./public/javascripts/'));
});

var packComponents = function(map, dest){
    // set up the browserify instance on a task basis
    var b = browserify(map, {
        bundleExternals: false
    });

    //b.require('filedrop');

    coreDependencies.forEach(function (dep) {
        b.exclude(dep);
    });

    serverOnlyDependencies.forEach(function (dep) {
        b.ignore(dep);
    });

    var bundle = b.bundle().pipe(source(dest));
    if(config.env !== 'dev'){
        bundle.pipe(streamify(uglify()));
    }
    return bundle.pipe(gulp.dest('./public/javascripts/'));
};

gulp.task('app', function () {
    return packComponents('./lib/campsi-app/init.js', 'campsi.app.js');
});

gulp.task('invitation', function () {
    return packComponents('./lib/campsi-app/invitation.js', 'invitation.js');
});

gulp.task('profile', function () {
    return packComponents('./lib/campsi-app/profile.js', 'profile.js');
});

gulp.task('standard-components', function () {
    return packComponents('./lib/components/map.js', 'campsi.components.js');
});

gulp.task('editor', function () {
    return packComponents('./lib/components/campsi/map.js', 'campsi.editor.js');
});


gulp.task('codeEditor', function () {
    return packComponents('./lib/campsi-app/editor.js', 'editor.js');
});

gulp.task('watch', function () {
    gulp.watch('lib/campsi/lib/*.js', ['core']);
    gulp.watch('lib/campsi-app/*.js', ['app', 'profile']);
    gulp.watch('lib/campsi-app/editor.js', ['codeEditor']);
    gulp.watch('lib/components/**/*.js', ['standard-components', 'editor']);
    gulp.watch('stylus/**/*.styl', ['stylus']);
});

gulp.task('compile', ['core', 'app', 'invitation', 'standard-components', 'editor', 'codeEditor', 'stylus', 'profile']);

gulp.task('default', ['compile', 'watch', 'serve']);