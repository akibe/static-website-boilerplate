const gulp = require('gulp')
const runSequence = require('run-sequence')

// Error Handling
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
const errMsg = 'Error: <%= error.message %>'

// Asset Management
const rev = require('gulp-rev')
const revReplace = require('gulp-rev-replace')
const manifest = 'dist/assets/rev-manifest.json'

// ================================================================================

// ============================== Clean
const del = require('del')
// ------------------------------
gulp.task('clean', () => {
  return del.sync(['dist/*'])
})

// ============================== Html
const pug = require('gulp-pug')
const puglint = require('gulp-pug-lint')
// ------------------------------
// Lint
gulp.task('html:lint', () => {
  return gulp.src('src/**/*.pug')
    .pipe(plumber({errorHandler: notify.onError(errMsg)}))
    .pipe(puglint())
    .pipe(plumber.stop())
})
// Develop
gulp.task('html:develop', ['html:lint'], () => {
  return gulp.src('src/*.pug')
    .pipe(plumber({errorHandler: notify.onError(errMsg)}))
    .pipe(pug().on('error', notify.onError(errMsg)))
    .pipe(revReplace({manifest: gulp.src(manifest)}))
    .pipe(plumber.stop())
    .pipe(gulp.dest('dist'))
})
// Serve
gulp.task('html:serve', ['html:develop'], () => {
  return gulp.watch(['src/**/*.pug', 'dist/assets/*'], ['html:develop'])
})
// Build
gulp.task('html:build', ['html:lint'], () => {
  return gulp.src('src/*.pug')
    .pipe(pug())
    .pipe(revReplace({manifest: gulp.src(manifest)}))
    .pipe(gulp.dest('dist'))
})

// ============================== Style
const postcss = require('gulp-postcss')
const stylelint = require('gulp-stylelint')
const concatCss = require('gulp-concat-css')
// ------------------------------
// Lint
gulp.task('style:lint', () => {
  return gulp.src('src/**/*.css')
    .pipe(plumber({errorHandler: notify.onError(errMsg)}))
    .pipe(stylelint({
      reporters: [
        {formatter: 'string', console: true}
      ]
    }))
    .pipe(plumber.stop())
})
// Develop
gulp.task('style:develop', ['style:lint'], () => {
    .pipe(plumber({errorHandler: notify.onError(errMsg)}))
  return gulp.src(['src/styles/index.css', 'src/styles/*.css'])
    .pipe(postcss([
      require('postcss-import'),
      require('postcss-cssnext')
    ]))
    .pipe(concatCss('index.css'))
    .pipe(revReplace({manifest: gulp.src(manifest)}))
    .pipe(plumber.stop())
    .pipe(gulp.dest('dist'))
})
// Serve
gulp.task('style:serve', ['style:develop'], () => {
  return gulp.watch(['src/**/*.css', 'dist/assets/*'], ['style:develop'])
})
// Build
  .pipe(postcss([
    require('postcss-import'),
    require('postcss-cssnext')
  ]))
  .pipe(revReplace({manifest: gulp.src(manifest)}))
  .pipe(gulp.dest('dist'))
gulp.task('style:build', ['style:lint'], () => {
  return gulp.src(['src/styles/index.css', 'src/styles/*.css'])
    .pipe(concatCss('index.css'))
})

// ============================== Script
const webpack = require('webpack-stream')
const eslint = require('gulp-eslint')
const named = require('vinyl-named')
// ------------------------------
// Lint
gulp.task('script:lint', () => {
  return gulp.src('src/**/*.js')
    .pipe(plumber({ errorHandler: notify.onError(errMsg) }))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(plumber.stop())
})
// Develop
gulp.task('script:develop', ['script:lint'], () => {
  return gulp.src(['src/scripts/index.js'])
    .pipe(plumber({ errorHandler: notify.onError(errMsg) }))
    .pipe(named())
    .pipe(webpack(require('./webpack.dev.config.js')))
    .pipe(plumber.stop())
    .pipe(gulp.dest('dist'))
})
// Serve
gulp.task('script:serve', ['script:develop'], () => {
  return gulp.watch(['src/**/*.js'], ['script:develop'])
})
// Build
gulp.task('script:build', ['script:lint'], () => {
  return gulp.src(['src/scripts/index.js'])
    .pipe(named())
    .pipe(webpack(require('./webpack.prd.config.js')))
    .pipe(gulp.dest('dist'))
})

// ============================== Image
const cached = require('gulp-cached')
const imagemin = require('gulp-imagemin')
const pngcrush = require('imagemin-pngcrush')
const svgmin = require('gulp-svgmin')
const svgstore = require('gulp-svgstore')
const cheerio = require('gulp-cheerio')
// ------------------------------
// Develop
gulp.task('image:develop', () => {
  return gulp.src('src/assets/*.{jpg,png,svg}')
    .pipe(rev())
    .pipe(gulp.dest('dist/assets'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('dist/assets'))
})
// Serve
gulp.task('image:serve', ['icon:build', 'image:develop'], () => {
  gulp.watch('src/assets/*.{jpg,png,svg}', ['image:develop'])
})
// Build
gulp.task('image:build', ['icon:build'], () => {
  return gulp.src('src/assets/*.{jpg,png,svg}')
    .pipe(imagemin())
    .pipe(rev())
    .pipe(gulp.dest('dist/assets'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('dist/assets'))
})
gulp.task('icon:build', () => {
  return gulp.src('src/assets/icons/*.svg')
    .pipe(cached('icon'))
    .pipe(svgmin())
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(cheerio({
      run: function ($) {
        $('svg').attr('style', 'display:none')
        $('[fill]').removeAttr('fill')
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(gulp.dest('dist/assets'))
})

// ============================== Serve
const browserSync = require('browser-sync')
// ------------------------------
const bs = browserSync.create()
gulp.task('serve', (done) => {
  runSequence(
    'clean',
    'image:serve',
    'style:serve',
    'script:serve',
    'html:serve',
    'serve:browser',
    'serve:rebuild',
    done)
})
gulp.task('serve:rebuild', () => {
  return gulp.watch('dist/*', {readDelay: 1000}).on('change', bs.reload)
})
gulp.task('serve:browser', () => {
  return bs.init({
    server: {
      baseDir: ['dist']
    }
  })
})

// ============================== Build
// ------------------------------
gulp.task('build', (done) => {
  runSequence(
    'clean',
    'image:build',
    'style:build',
    'script:build',
    'html:build',
    done)
})
