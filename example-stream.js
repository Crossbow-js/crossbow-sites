var crossbow    = require("./");
var through     = require("through2");
var fs          = require("vinyl-fs");
var rimraf      = require("rimraf").sync;
var outpath     = "./stream-out";

rimraf(outpath);

fs.src([
    "test/fixtures/index.html"
    //"test/fixtures/_posts/**",
    //"test/fixtures/docs/**",
    //"test/fixtures/projects/**"
])
.pipe(crossbow.stream({
    cwd: "test/fixtures",
    postUrlFormat: "/posts/:title"
}))
.pipe(fs.dest(outpath));


