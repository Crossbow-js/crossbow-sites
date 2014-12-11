var gulp         = require("gulp");
var jshint       = require("gulp-jshint");
var coderBlog    = require("./plugins/stream");
var browserSync  = require("browser-sync");
var through      = require("through2");
var noAbs        = require("no-abs");
var rimraf       = require("rimraf");
var htmlInjector = require("bs-html-injector");

gulp.task("lint", function () {
    gulp.src([
        "index.js",
        "plugins/*.js",
        "test/**/*.js",
        "lib/**/*.js"
    ])
    .pipe(noAbs())
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
    cwd: "test/fixtures",
    siteConfig: "test/fixtures/_config.yml"
};

/**
 * Default task
 */
gulp.task("build-blog", function () {

    return gulp.src([
        "test/fixtures/*.html",
        "test/fixtures/_posts/**",
        "test/fixtures/docs/**",
        "test/fixtures/projects/**"
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

gulp.task("clean", function (done) {
    rimraf.sync("./_site");
    done();
});

gulp.task("default", ["clean", "build-blog", "browserSync", "watch"]);