var gulp = require('gulp');
var path = require('path');

var concat = require('gulp-concat');
var ngTemplates = require('gulp-ng-templates');
var ngAnnotate = require('gulp-ng-annotate');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');

var paths = {
	scripts: ['src/**/*.js', '!src/**/*.spec.js'],
	templates: ['src/**/*.tpl.html']
};

gulp.task('jshint', function () {
	return gulp.src(paths.scripts)
		.pipe(jshint({ lookup: true }))
		.pipe(jshint.reporter());
});

gulp.task('scripts', ['jshint'], function () {
	var dest = path.join(__dirname, 'dist');

	return gulp.src(paths.scripts)
		.pipe(ngAnnotate())
		.pipe(concat('angular-foundation.js'))
		.pipe(gulp.dest(dest));
});

gulp.task('templates', function () {
	var dest = path.join(__dirname, 'dist');

	return gulp.src(paths.templates)
		.pipe(ngTemplates({
			filename: 'angular-foundation.tpl.min.js',
			module: 'ngFoundation.templates',
			standalone: false
		}))
		.pipe(uglify())
		.pipe(gulp.dest(dest));
});

gulp.task('watch', ['scripts', 'templates'], function () {
	gulp.watch(paths.scripts, ['scripts']);
	gulp.watch(paths.templates, ['templates']);
});

gulp.task('default', ['scripts', 'templates']);