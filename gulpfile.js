// Load plugins
var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var csso = require('gulp-csso');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var cache = require('gulp-cache');
var imagemin = require('gulp-imagemin');
var lr = require('tiny-lr');
var livereload = require('gulp-livereload');
var server = lr();
var express = require('express');
var connect = require('connect-livereload');
var lrPort = 35729;

function startExpress() {
  var app = express();
      app.use(connect());
      app.use(express.static(__dirname + '/build'));
      app.listen(4000);
}

// HTML
gulp.task('html', function() {
  return gulp.src('build/*.html')
    .pipe(livereload(server));
});

// Styles
gulp.task('styles', function() {
  return gulp.src('src/styles/main.scss')
    .pipe(sass())
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest('build/assets/styles'))
    .pipe(csso())
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest('build/assets/styles'))
    .pipe(livereload(server));
});

// Scripts
gulp.task('scripts', function() {
  return gulp.src('src/scripts/*.js')
    .pipe(concat('main.js'))
    .pipe(gulp.dest('build/assets/scripts'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(gulp.dest('build/assets/scripts'))
    .pipe(livereload(server));
});

// Images
gulp.task('images', function() {
  return gulp.src('src/images/**/*')
    .pipe(gulp.dest('build/assets/images'))
    .pipe(cache(imagemin({ progressive: true, interlaced: true })));
});

// Clean
gulp.task('clean', function() {
  return gulp.src(['build/assets/styles', 'build/assets/scripts'], {read: false})
    .pipe(clean());
});

// Watch
gulp.task('default', function() {
  startExpress();
  server.listen(lrPort);

  gulp.watch('src/styles/**/*.scss', ['styles']);
  gulp.watch('src/scripts/**/*.js', ['scripts']);
  gulp.watch('src/images/**/*', ['images']);
  gulp.watch('build/*.html', ['html']);
});
