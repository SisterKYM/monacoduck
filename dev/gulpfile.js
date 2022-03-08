//----------------------------------------------------------------------------------------------------
// Gulp Sass & JavaScript Compiler with hot reloading sass and browsersync
// shoplab 2021
// <repo_link>
//----------------------------------------------------------------------------------------------------

//--------------------------------------------------
// Environment variables
//--------------------------------------------------

/* ===================================================================== */
/* ===================== DO NOT EDIT BELOW THIS LINE =================== */
/* ===================================================================== */

//--------------------------------------------------
// Dependencies
//--------------------------------------------------
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const changed = require('gulp-changed');
const concat = require('gulp-concat');
const rename = require("gulp-rename");
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const util = require('gulp-util');

const browserSync = require("browser-sync").create();

/**
 * Assets paths.
 */
const scssSrcTheme = 'styles/theme.scss';
const scssSrcThemePartials = 'styles/partials/*.scss';
const scssSrcThemeMixins = 'styles/mixins/*.scss';
const scssSrcIndex = 'styles/templates/index.scss';
const scssSrcCollection = 'styles/templates/collection.scss';
const scssSrcCart = 'styles/templates/cart.scss';
const scssSrcPage = 'styles/templates/page.scss';
const scssSrcProduct = 'styles/templates/product.scss';

const jsMainSrc = 'js/theme.js';
const jsIndexSrc = 'js/index.js';
const jsProductSrc = 'js/product.js';
const jsCollectionSrc = 'js/collection.js';
const jsPageSrc = 'js/page.js';
const jsCartSrc = 'js/cart.js';
const assetsDir = '../assets/';
const snippetsDir = '../snippets/';

/**
 * SCSS tasks
 */
gulp.task('cssTheme', function () {
  return gulp.src(scssSrcTheme)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(rename('lab.theme.css'))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest(assetsDir))
    .pipe(browserSync.stream());
});
// homepage
gulp.task('cssIndex', function () {
  return gulp.src(scssSrcIndex)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(rename('lab.index.css'))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest(assetsDir))
    .pipe(browserSync.stream());
});
// collection
gulp.task('cssCollection', function () {
  return gulp.src(scssSrcCollection)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(rename('lab.collection.css'))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest(assetsDir))
    .pipe(browserSync.stream());
});
// Cart
gulp.task('cssCart', function () {
  return gulp.src(scssSrcCart)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(rename('lab.cart.css'))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest(assetsDir))
    .pipe(browserSync.stream());
});
// Page
gulp.task('cssPage', function () {
  return gulp.src(scssSrcPage)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(rename('lab.page.css'))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest(assetsDir))
    .pipe(browserSync.stream());
});
// Product
gulp.task('cssProduct', function () {
  return gulp.src(scssSrcProduct)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(rename('lab.product.css'))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest(assetsDir))
    .pipe(browserSync.stream());
});

/**
 * JS task
 *
 * Note: you may or may not want to include the 2 below:
 * babel polyfill and jquery
 */
const jsDest = assetsDir;

/**
 * Main Bundles
 */
gulp.task('jsMain', function () {
  const bMain = browserify({
    entries: jsMainSrc,
    debug: false,
    transform: [babelify.configure({
      presets: ['@babel/preset-env']
    })]
  });

  return bMain.bundle()
    .pipe(source(jsMainSrc))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
      // Add other gulp transformations (eg. uglify) to the pipeline here.
      .pipe(concat('lab.theme.js'))
      .pipe(gulp.dest(jsDest))
      .pipe(rename('lab.theme.min.js'))
      .pipe(uglify())
      .on('error', util.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(jsDest));
});

/**
 * Index Page
 */
gulp.task('jsIndex', function () {
  const bIndex = browserify({
    entries: jsIndexSrc,
    debug: false,
    transform: [babelify.configure({
      presets: ['@babel/preset-env']
    })]
  });
  
  return bIndex.bundle()
    .pipe(source(jsIndexSrc))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
      // Add other gulp transformations (eg. uglify) to the pipeline here.
      .pipe(concat('lab.index.js'))
      .pipe(gulp.dest(jsDest))
      .pipe(rename('lab.index.min.js'))
      .pipe(uglify())
      .on('error', util.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(jsDest));
});

/**
 * Product Page
 */
gulp.task('jsProduct', function () {
  const bProduct = browserify({
    entries: jsProductSrc,
    debug: false,
    transform: [babelify.configure({
      presets: ['@babel/preset-env']
    })]
  });

  return bProduct.bundle()
    .pipe(source(jsProductSrc))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
      // Add other gulp transformations (eg. uglify) to the pipeline here.
      .pipe(concat('lab.product.js'))
      .pipe(gulp.dest(jsDest))
      .pipe(rename('lab.product.min.js'))
      .pipe(uglify())
      .on('error', util.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(jsDest));
});

/**
 * Collection Page
 */
gulp.task('jsCollection', function () {
  const bCollection = browserify({
    entries: jsCollectionSrc,
    debug: false,
    transform: [babelify.configure({
      presets: ['@babel/preset-env']
    })]
  });

  return bCollection.bundle()
    .pipe(source(jsCollectionSrc))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
      // Add other gulp transformations (eg. uglify) to the pipeline here.
      .pipe(concat('lab.collection.js'))
      .pipe(gulp.dest(jsDest))
      .pipe(rename('lab.collection.min.js'))
      .pipe(uglify())
      .on('error', util.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(jsDest));
});

/**
 *  Page
 */
gulp.task('jsPage', function () {
  const bPage = browserify({
    entries: jsPageSrc,
    debug: false,
    transform: [babelify.configure({
      presets: ['@babel/preset-env']
    })]
  });

  return bPage.bundle()
    .pipe(source(jsPageSrc))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
      // Add other gulp transformations (eg. uglify) to the pipeline here.
      .pipe(concat('lab.page.js'))
      .pipe(gulp.dest(jsDest))
      .pipe(rename('lab.page.min.js'))
      .pipe(uglify())
      .on('error', util.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(jsDest));
});

/**
 *  Cart
 */
gulp.task('jsCart', function () {
  const bCart = browserify({
    entries: jsCartSrc,
    debug: false,
    transform: [babelify.configure({
      presets: ['@babel/preset-env']
    })]
  });

  return bCart.bundle()
    .pipe(source(jsCartSrc))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
      // Add other gulp transformations (eg. uglify) to the pipeline here.
      .pipe(concat('lab.cart.js'))
      .pipe(gulp.dest(jsDest))
      .pipe(rename('lab.cart.min.js'))
      .pipe(uglify())
      .on('error', util.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(jsDest));
});

/**
 * Images task
 */
gulp.task('images', function () {
  return gulp.src('images/**')
    .pipe(changed(assetsDir)) // ignore unchanged files
    .pipe(gulp.dest(assetsDir))
});

/**
 * Fonts task
 */
gulp.task('fonts', function () {
  return gulp.src('fonts/**')
    .pipe(changed(assetsDir)) // ignore unchanged files
    .pipe(gulp.dest(assetsDir))
});

/**
 * Copy Liquid files
 */
gulp.task('liquid', function () {
  return gulp.src('liquid/**')
    .pipe(changed(snippetsDir)) // ignore unchanged files
    .pipe(gulp.dest(snippetsDir))
});

/**
 * Watch task
 */
gulp.task('watch', function () {
  // watch sass files
  gulp.watch(scssSrcTheme, gulp.series('cssTheme'));
  gulp.watch(scssSrcThemePartials, gulp.series('cssTheme'));
  gulp.watch(scssSrcThemeMixins, gulp.series('cssTheme'));
  gulp.watch(scssSrcIndex, gulp.series('cssIndex'));
  gulp.watch(scssSrcCollection, gulp.series('cssCollection'));
  gulp.watch(scssSrcCart, gulp.series('cssCart'));
  gulp.watch(scssSrcPage, gulp.series('cssPage'));
  gulp.watch(scssSrcProduct, gulp.series('cssProduct'));

  // watch javascript files
  gulp.watch(jsMainSrc, gulp.series('jsMain'));
  gulp.watch(jsIndexSrc, gulp.series('jsIndex'));
  gulp.watch(jsProductSrc, gulp.series('jsProduct'));
  gulp.watch(jsCollectionSrc, gulp.series('jsCollection'));
  gulp.watch(jsPageSrc, gulp.series('jsPage'));
  gulp.watch(jsCartSrc, gulp.series('jsCart'));

  // watch other assets
  gulp.watch('images/*.{jpg,jpeg,png,gif,svg}', gulp.series('images'));
  gulp.watch('fonts/*.{eot,svg,ttf,woff,woff2}', gulp.series('fonts'));
  gulp.watch('liquid/*.liquid', gulp.series('liquid'));
});

/**
 * Default task
 */
gulp.task('build', gulp.series('liquid', 'cssTheme', 'cssIndex', 'cssCollection', 'cssCart', 'cssPage', 'cssProduct', 'jsMain', 'jsIndex', 'jsProduct', 'jsCollection', 'jsPage', 'jsCart', 'images', 'fonts'));
