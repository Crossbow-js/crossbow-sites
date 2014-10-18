var gulp        = require("gulp");
var jshint      = require("gulp-jshint");
var coderBlog   = require("./plugins/blog");

gulp.task("lint", function () {
    gulp.src([
        "index.js",
        "test/**/*.js",
        "lib/**/*.js"
    ])
    .pipe(jshint("test/.jshintrc"))
    .pipe(jshint.reporter("default"))
    .pipe(jshint.reporter("fail"));
});

/**
 * Default task
 */
gulp.task("build-blog", function () {

    return gulp.src([
        "test/fixtures/*.html"
    ])
        .pipe(coderBlog({cwd: "test/fixtures"}))
        .pipe(gulp.dest("_site"));
});