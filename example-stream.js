var crossbow = require("./");
var through = require("through2");
var fs = require("vinyl-fs");
var rimraf = require("rimraf").sync;
var outpath = "./stream-out";

rimraf(outpath);

fs.src([
    "test/fixtures/*.html",
    "test/fixtures/_posts/**"
    //"test/fixtures/docs/**",
    //"test/fixtures/projects/**"
])
.pipe(crossbow.stream({
    config: {
        base:        "test/fixtures",
        prettyUrls: true,
    },
    data: {
        work: 'dir:work'
    }
}))
.pipe(fs.dest(outpath));
