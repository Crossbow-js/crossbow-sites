var gulp         = require("gulp");
var jshint       = require("gulp-jshint");
var crossbow     = require("./");
var browserSync  = require("browser-sync");
var noAbs        = require("no-abs");
var rimraf       = require("rimraf");
var htmlInjector = require("bs-html-injector");

gulp.task("lint", function () {
    gulp.src([
        "index.js",
        "plugins/*.js",
        "test/**/*.js",
        "lib/**/*.js",
        "!lib/core/*.js"
    ])
    .pipe(noAbs())
    .pipe(jshint("test/.jshintrc"))
    .pipe(jshint.reporter("default"))
    .pipe(jshint.reporter("fail"));
});

/**
 * Start BrowserSync
 */
gulp.task("serve", function () {
    browserSync({
        open: false,
        server: {
            baseDir: "_site",
            routes: {
                "/img": "./img",
                "/css": "test/fixtures/css"
            }
        }
    });
});

/**
 * Default task
 */
gulp.task("crossbow", function () {
    return gulp.src([
        "test/fixtures/*.html"
        //"test/fixtures/index.html"
        //"test/fixtures/_posts/**"
        //"test/fixtures/docs/**",
        //"test/fixtures/projects/**"
    ])
        .pipe(crossbow.stream({
            cwd: "test/fixtures",
            data: {
                site: "file:_config.yml",
                cats: "file:_config.json"
            }
        }))
        .pipe(gulp.dest("_site"));
});

gulp.task("watch", function () {
    gulp.watch(["test/fixtures/**"], ["crossbow", browserSync.reload]);
});

gulp.task("clean", function (done) {
    rimraf.sync("./_site");
    done();
});

gulp.task("default", ["clean", "crossbow", "serve", "watch"]);