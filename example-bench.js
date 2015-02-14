var crossbow    = require("./plugins/stream");
//var through     = require("through2");
var fs          = require("vinyl-fs");
var rimraf      = require("rimraf").sync;
var outpath     = "./_bench-out";

rimraf(outpath);

fs.src([
    "_bench/*.html"
])
    .pipe(crossbow({cwd: "_bench"}))
    .pipe(fs.dest(outpath));


