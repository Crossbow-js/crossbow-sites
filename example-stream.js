var crossbow    = require("./plugins/blog");
var through     = require("through2");
var fs          = require("vinyl-fs");
var rimraf      = require("rimraf").sync;
var outpath     = "./stream-out";

rimraf(outpath);
fs.src("test/fixtures/index.html")
    .pipe(crossbow({
        cwd: "test/fixtures",
        logLevel: "debug"
    }))
    .pipe(fs.dest(outpath));


