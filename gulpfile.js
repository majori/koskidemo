var gulp            = require('gulp');
var livereload      = require('gulp-livereload');
var uglify          = require('gulp-uglify');
var rename          = require('gulp-rename');
var preprocess      = require('gulp-preprocess');
var del             = require('del');

var browserify  = require('browserify');
var through2    = require('through2');

var cfg         = require('./config');

var SOURCE_FOLDER = './server/browser';
var BUILD_FOLDER = SOURCE_FOLDER + '/build'

// https://www.npmjs.com/package/gulp-livereload
gulp.task('watch', function() {
  livereload.listen({port: 35729});
  gulp.watch(cfg.publicPath + '/assets/*.js', (event) => livereload.changed(event.path));
  gulp.watch(cfg.publicPath + '/styles/*.css', (event) => livereload.changed(event.path));
  gulp.watch(cfg.publicPath + '/views/*.html', (event) => livereload.changed(event.path));
  gulp.watch('./server/browser/*.js', ['browserify']);
});

gulp.task('browserify', ['preprocess'], function(cb) {

    gulp.src([BUILD_FOLDER + '/socket.js'])
    .pipe(through2.obj(function (file, enc, next){
        browserify(file.path)
            .bundle(function(err, res){
                // assumes file.contents is a Buffer
                file.contents = res;
                next(null, file);
            });
        }))
    .pipe(uglify())
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest(cfg.publicPath + '/assets/js'))
    .on('end', cb);
});

gulp.task('preprocess', function(cb) {

    gulp.src([SOURCE_FOLDER + '/**/*.js', '!' + BUILD_FOLDER])
    .pipe(preprocess({
        context: {
            KOSKIOTUS_HTTP_ADDRESS: cfg.httpAddress,
            KOSKIOTUS_IO_PORT: cfg.ioPort
        }
    }))
    .pipe(gulp.dest(BUILD_FOLDER))
    .on('end', cb);
})

gulp.task('cleanBuild', function(cb) {
    return del([BUILD_FOLDER], cb);
});

gulp.task('default', ['watch']);
gulp.task('build', ['browserify']);
gulp.task('clean', ['cleanBuild']);
