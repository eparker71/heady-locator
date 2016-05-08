var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-minify-css');
var jshint = require('gulp-jshint');
//var Server = require('karma').Server;

gulp.task('moveHTML', function(){
  return gulp.src('src/**/*.html')
    .pipe(gulp.dest('app'));
});

gulp.task('buildJs', function(){
  return gulp.src('src/js/**/*.js')
    .pipe(concat('app.js'))
    .pipe(gulp.dest('app/js'));
});

gulp.task('buildVendorJs', function(){
  return gulp.src([
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/**/*.min.js'])
    .pipe(concat('vendors.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/js'));
});

gulp.task('buildCSS', function(){
  return gulp.src([
    'bower_components/bootstrap/dist/css/bootstrap.css',
    'src/css/**/*.css'])
  .pipe(concat('main.css'))
  .pipe(minifycss())
  .pipe(gulp.dest('app/css'));
});

gulp.task('movePNG', function(){
  return gulp.src('src/**/*.png')
    .pipe(gulp.dest('app/images'));
});


gulp.task('build', ['moveHTML', 'buildJs', 'buildVendorJs', 'buildCSS', 'movePNG']);

gulp.task('jshint', function(){
  return gulp.src(['src/js/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

// gulp.task('karma', function (done) {
//   new Server({
//     configFile: __dirname + '/karma.conf.js',
//     singleRun: true
//   }, done).start();
// });

gulp.task('test', ['jshint']);


