var gulp = require('gulp')
  , stylus = require('gulp-stylus')
  , browserify = require('gulp-browserify')
  , uglify = require('gulp-uglify')

gulp.task('stylus', function() {
  gulp.src('sources/styles/main.styl')
    .pipe(stylus({
      "compress": true,
      "include css": true
    }))
    .pipe(gulp.dest('./css'))
})

gulp.task('scripts', function() {
  gulp.src('sources/scripts/app.js')
      .pipe(browserify({
        debug : !gulp.env.production
      }))
      .pipe(uglify())
      .pipe(gulp.dest('./js'))
})

gulp.task('watch', function() {
  gulp.watch(['sources/**/**'], ['stylus', 'scripts'])
})