var crossbow    = require("./plugins/stream");
//var through     = require("through2");
var fs          = require("vinyl-fs");
var rimraf      = require("rimraf").sync;
var outpath     = "./_bench-out";

rimraf(outpath);

console.time("bench");
fs.src([
    "_bench/*.html"
    //"_bench/1-file.html"
])
    .pipe(crossbow({config: {base: "_bench"}}))
    .pipe(fs.dest(outpath)).on("end", function () {
        console.timeEnd("bench");
    });


