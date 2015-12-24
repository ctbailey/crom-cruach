var gulp = require('gulp');
var gutil = require('gulp-util');
var coffee = require('gulp-coffee');
var wiredep = require('wiredep').stream;
var sass = require('gulp-sass');

// Transpile Sass
gulp.task('sass', function () {
  gulp.src('./src/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public'));
});

// Transpile Coffee
gulp.task('coffee', function() {
  gulp.src('./src/*.coffee')
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('./public/'))
});

// Watch .coffee, .sccs, and index.html files for change
gulp.task('watch', ['coffee', 'sass'], function() {
  gulp.watch('./src/*.coffee', ['coffee']);
  gulp.watch('./src/*.scss', ['sass']);
  gulp.watch('./src/index.html', ['bower']);
});

// Include bower components into html
gulp.task('bower', function () {
  gulp.src('./src/index.html')
    .pipe(wiredep({
      optional: 'configuration',
      goes: 'here'
    }))
    .pipe(gulp.dest('./public'));
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'bower', 'sass']);
