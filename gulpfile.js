var gulp        = require('gulp');
var livereload  = require('gulp-livereload');
var cfg         = require('./config');

// https://www.npmjs.com/package/gulp-livereload
gulp.task('watch', function() {
  livereload.listen({port: 35729});
  gulp.watch(cfg.publicPath + '/assets/js/*.js', (event) => livereload.changed(event.path));
  gulp.watch(cfg.publicPath + '/styles/*.css', (event) => livereload.changed(event.path));
  gulp.watch(cfg.publicPath + '/views/*.html', (event) => livereload.changed(event.path));
});

gulp.task('default', ['watch']);
