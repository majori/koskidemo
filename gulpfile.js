var gulp          = require('gulp');
var livereload    = require('gulp-livereload');

var PUBLIC_DIR = './server/public';

gulp.task('watch', function() {
  livereload.listen({port: 35729});
  gulp.watch(PUBLIC_DIR + '/styles/*.css', (event) => livereload.changed(event.path));
  gulp.watch(PUBLIC_DIR + '/views/*.html', (event) => livereload.changed(event.path));
});

gulp.task('default', ['watch']);
