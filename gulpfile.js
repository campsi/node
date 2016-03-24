'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var nodemon = require('gulp-nodemon');
var stylus = require('gulp-stylus');
var autoprefixer = require('gulp-autoprefixer');
var streamify = require('gulp-streamify');
var config = require('./config');
var shouldMinify = false;
var isProd = (config.env === 'prod');
var i18n = require('i18n');
var locales = ['en', 'fr'];

i18n.configure({
    locales: locales,
    directory: './locales'
});

var coreDependencies = [
    'campsi-core',
    'async',
    'cheerio-or-jquery',
    'is-browser',
    'deepcopy',
    'equals',
    'extend',
    'page',
    'handlebars'
];

var serverOnlyDependencies = [
    'util',
    'cheerio',
    'console.table',
    'request',
    'jade',
    'path',
    'i18n',
    'fs',
    'node-redis-pubsub',
    'mongoose',
    'unicode/category/So'
];

gulp.task('serve', function () {
    nodemon({
        verbose: false,
        ignore: ['**/*.css', '**/*.styl', 'public/**/*'],
        script: 'bin/www'
    });
});


gulp.task('stylus', function () {
    gulp.src('./stylus/main.styl')
        .pipe(stylus({
            compress: isProd,
            'include css': true
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./public/stylesheets'));

    gulp.src('./stylus/invitation.styl')
        .pipe(stylus({compress: isProd}))
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

    if (isProd) {
        bundle.pipe(streamify(uglify()));
    }
    return bundle.pipe(gulp.dest('./public/javascripts/'));
});

var packComponents = function (map, dest) {
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
    if (isProd) {
        bundle.pipe(streamify(uglify()));
    }
    return bundle.pipe(gulp.dest('./public/javascripts/'));
};

gulp.task('app', function () {
    return packComponents('./lib/campsi-app/browser.js', 'campsi.app.js');
});

gulp.task('invitation', function () {
    return packComponents('./lib/campsi-app/invitation.js', 'invitation.js');
});

gulp.task('standard-components', function () {
    return packComponents('./lib/components/index.js', 'campsi.components.js');
});

gulp.task('editor', function () {
    return packComponents('./lib/campsi-components/index.js', 'campsi.editor.js');
});

gulp.task('watch', function () {
    gulp.watch('lib/campsi-app/**/*.js', ['app']);
    gulp.watch('lib/components/**/*.js', ['standard-components']);
    gulp.watch('lib/campsi-components/**/*.js', ['editor']);
    gulp.watch('**/*.styl', ['stylus']);
});

gulp.task('compile', ['core', 'app', 'editor', 'standard-components', 'stylus']);

gulp.task('default', ['compile', 'watch', 'serve']);