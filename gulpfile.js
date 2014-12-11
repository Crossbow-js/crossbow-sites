var gulp         = require("gulp");
var jshint       = require("gulp-jshint");
var coderBlog    = require("./plugins/stream");
var browserSync  = require("browser-sync");
var htmlInjector = require("bs-html-injector");

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
 * Start BrowserSync
 */
gulp.task("browserSync", function () {
    browserSync.use(htmlInjector, {
        excludedTags: ["BODY"],
        logLevel: "info"
    });
    browserSync({
        server: {
            baseDir: "_site",
            routes: {
                "/img": "./img",
                "/css": "test/fixtures/css"
            }
        },
        open: false,
        online: false
    });
});

var blogconfig = {
    env: "dev",
    highlight: true,
    markdown: true,
    logLevel: "debug",
    postUrlFormat: "/posts/:title",
    prettyUrls: true,
    cwd: "test/fixtures"
};

/**
 * Default task
 */
gulp.task("build-blog", function () {

    return gulp.src([
        "test/fixtures/**/*.html",
        "test/fixtures/_posts/*.md",
        "test/fixtures/**/*.md"
    ])
        .pipe(coderBlog(blogconfig))
        .pipe(gulp.dest("_site"));
});

gulp.task("watch", function () {
    gulp.watch(["test/fixtures/**/*"], function (file) {
        return gulp.src(file.path)
            .pipe(coderBlog(blogconfig))
            .pipe(gulp.dest("_site"))
            .on("end", function () {
                browserSync.reload();
                //htmlInjector();
            });
    });
});

gulp.task("default", ["build-blog", "browserSync", "watch"]);