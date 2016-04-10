var gulp        = require('gulp');
var livereload  = require('gulp-livereload');
var uglify      = require('gulp-uglify');
var rename      = require('gulp-rename');

var browserify  = require('browserify');
var through2    = require('through2');

var cfg         = require('./config');

// https://www.npmjs.com/package/gulp-livereload
gulp.task('watch', function() {
  livereload.listen({port: 35729});
  gulp.watch(cfg.publicPath + '/styles/*.css', (event) => livereload.changed(event.path));
  gulp.watch(cfg.publicPath + '/views/*.html', (event) => livereload.changed(event.path));
  gulp.watch('./server/browser/*.js', ['browserify']);
});

gulp.task('browserify', function() {

    return gulp.src(['./server/browser/socket.js'])
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
    .pipe(gulp.dest(cfg.publicPath + '/assets/js'));
});

gulp.task('default', ['watch']);
gulp.task('build', ['browserify']);
