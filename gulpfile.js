var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-minify-css');
var jshint = require('gulp-jshint');

gulp.task('buildApp', function(){
  return gulp.src('src/*.js')
    .pipe(concat('app.js'))
    .pipe(gulp.dest('app'));
});

gulp.task('buildVendor', function(){
  return gulp.src([
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/**/*.min.js'])
    .pipe(concat('vendors.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app'));
});

gulp.task('buildCSS', function(){
  return gulp.src([
    'bower_components/bootstrap/dist/css/bootstrap.css',
    'src/*.css'])
  .pipe(concat('main.css'))
  .pipe(minifycss())
  .pipe(gulp.dest('app'));
});

gulp.task('movePHP', function(){
   return gulp.src('src/*.php')
	.pipe(gulp.dest('app'));
});

gulp.task('moveHTML', function(){
  return gulp.src('src/*.html')
    .pipe(gulp.dest('app'));
});

gulp.task('jshint', function(){
  return gulp.src(['src/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

//gulp.task('test', ['karma', 'jshint']);

gulp.task('build', ['jshint', 'buildApp', 'buildVendor', 'buildCSS', 'moveHTML', 'movePHP']);
