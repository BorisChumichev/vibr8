var gulp = require('gulp')
  , browserify = require('browserify')
  , transform = require('vinyl-transform')
  , uglify = require('gulp-uglify')
  , rename = require('gulp-rename')
  , gzip = require('gulp-gzip')

gulp.task('build', function () {
  var browserified = transform(function(filename) {
    var b = browserify(filename, {standalone: 'Vibr8'})
    return b.bundle()
  })
  // Build destination
  var DEST = './build'

  return gulp.src(['./sources/vibr8.js'])
    .pipe(browserified)
    .pipe(gulp.dest(DEST))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest(DEST))
    .pipe(gzip())
    .pipe(gulp.dest(DEST))
})