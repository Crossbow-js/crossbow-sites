var gulp        = require("gulp");
var jshint      = require("gulp-jshint");

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