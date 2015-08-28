var gulp = require('gulp');
var browserify = require('browserify');
var watchify = require('watchify');
var assign = require('lodash.assign');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var babelify = require('babelify');
var nodemon = require('gulp-nodemon');
var livereload = require('gulp-livereload');
var stylus = require('gulp-stylus');

var customOpts = {
    entries: ['./client/app.js'],
    debug: true
};

var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts));

b.transform(babelify);

function bundle() {
    livereload.listen();
    return b.bundle()
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./server/build/js'))
        .pipe(livereload());
}

gulp.task('js', bundle);
b.on('update', bundle);
b.on('log', gutil.log);

gulp.task('nodemon', function() {
    return nodemon({
        script: 'server/app.js',
        ignore: ['client/**/*.*', 'client/*.js', 'gulpfile.js']
    });
});

gulp.task('stylus', function() {
    livereload.listen();
    gulp.src('./client/styles/app.styl')
        .pipe(stylus())
        .pipe(gulp.dest('./server/build/css'))
        .pipe(livereload());
});

gulp.task('watch', function() {
    gulp.watch(
        ['./client/styles/*.styl', './client/styles/**/*.styl'], ['stylus']
    );
});

gulp.task('dev', ['stylus', 'js', 'nodemon', 'watch']);