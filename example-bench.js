var crossbow    = require("./plugins/stream");
var fs          = require("vinyl-fs");
var rimraf      = require("rimraf").sync;
var outpath     = "./_bench-out";

var site        = require("./").builder({
    config: {
        base: "_bench"
    }
});

rimraf(outpath);

console.time("bench");

fs.src([
    "_bench/*.md"
    //"_bench/1-file.html"
])
    .pipe(crossbow({builder: site}))
    .pipe(fs.dest(outpath)).on("end", function () {
        console.timeEnd("bench");
    });


