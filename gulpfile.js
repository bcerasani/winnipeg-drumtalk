// Load plugins
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    csso = require('gulp-csso'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    cache = require('gulp-cache'),
    imagemin = require('gulp-imagemin'),
    lr = require('tiny-lr'),
    livereload = require('gulp-livereload'),
    server = lr(),
    express = require('express'),
    connect = require('connect-livereload'),
    lrPort = 35729;

function startExpress() {
  var app = express();
      app.use(connect());
      app.use(express.static(__dirname + '/build'));
      app.listen(4000);
}

// Hue Api
var hue = require("node-hue-api"),
    HueApi = hue.HueApi;
    // lightState = hue.lightState;

var host = "192.168.100.111",
    username = "38dd650bbbf7b6f194666132bef48f7",
    api = new HueApi(host, username);

function hueError (err) {
  api.lightStatus(1)
    .then(function(status) {
      api.setLightState(1, flash)
        .then(api.setLightState(1, status.state));
    })
    .done(console.log(err));
}

var flash = {
        "on":true,
        "bri": 255,
        "hue": 65535,
        "sat": 255,
        "transitiontime": 1
      };

// HTML
gulp.task('html', function() {
  return gulp.src('build/*.html')
    .pipe(livereload(server));
});

// Styles
gulp.task('styles', function() {
  return gulp.src('src/styles/main.scss')
    .pipe(sass({
      onError: hueError
    }))
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
