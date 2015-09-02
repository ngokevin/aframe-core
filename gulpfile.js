var gulp = require('gulp');
var async = require('async');
var gulpif = require('gulp-if');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var karmaServer = require('karma').Server;
var webServer = require('gulp-webserver');
var browserify = require('gulp-browserify');
var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');
var jshintStylish = require('jshint-stylish');
var flags = require('minimist')(process.argv.slice(2));

// Gulp command line arguments
// e.g: gulp --production
// Gulp command line arguments
var production = flags.production || false;
var debug = flags.debug || !production;
var watch = flags.watch;


gulp.task('test', function (done) {
  new karmaServer({
    configFile: 'test/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('build', ['lint'], function(callback) {
  build(true, 'vr-markup.js', function() {
    build(false, 'vr-markup-min.js', callback);
  })
});

gulp.task('lint', function() {
  return gulp.src(['src/*/*.js', 'src/*.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

function build(debug, filename, callback) {
  async.series([
     function (next) {
        gulp.src([
          'lib/vendor/document-register-element.max.js',
          'lib/vendor/three.js',
          'lib/vendor/VREffect.js',
          'lib/vendor/VRControls.js',
          'lib/vendor/Raycaster.js',
          'lib/cursor3D.js',
          'src/core/vr-node.js',
          'src/core/vr-object.js',
          'src/core/vr-scene.js',
          'src/core/vr-camera.js',
          'src/core/vr-assets.js',
          'src/vr-behavior.js',
          'src/vr-animation.js',
          'src/vr-material.js',
          'src/vr-geometry.js',
          'src/vr-mesh.js',
          'src/vr-fog.js',
          'src/vr-controls.js',
          'src/vr-cursor.js'
        ])
        .pipe(gulpif(debug, sourcemaps.init()))
        .pipe(gulpif(!debug, uglify()))
        .pipe(concat(filename))
        .pipe(gulpif(debug, sourcemaps.write()))
        .pipe(gulp.dest('./dist/'))
        .on('end', next);
      }, function (next) {
        gulp.src(['style/vr-markup.css'])
            .pipe(gulp.dest('./dist/'))
            .on('end', next);
      }], callback);
}

gulp.task('clean', function() {
   return gulp.src(['./build'], {read: false})
          .pipe(clean({force: true}));
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(['src/*.js','src/*/*.js', 'gulpfile.js'], ['build']);
});

gulp.task('server', function() {
  gulp.src('./')
    .pipe(webServer({
      livereload: false,
      directoryListing: true,
      port: 9000
    }));
});

gulp.task('dev', ['watch', 'server']);

gulp.task('default', ['clean', 'build']);