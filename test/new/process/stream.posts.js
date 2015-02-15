var crossbow = require("../../../");
var through  = require("through2");
var fs       = require("vinyl-fs");
var path     = require("path");
var assert   = require("chai").assert;

var outpath   = "./stream-out";
var rimraf    = require("rimraf").sync;

rimraf(outpath);

function vp (dir, file) {
    return path.resolve(process.cwd(), outpath, dir, path.basename(file));
}

describe("E2E stream", function(){
    it("works with noe config", function(done){
        fs.src([
            "test/fixtures/about.html",
            "test/fixtures/_posts/**"
        ])
            .pipe(crossbow.stream({
                config: {
                    cwd: "test/fixtures"
                }
            }))
            .pipe(fs.dest(outpath))
            .pipe(through.obj(function (file, enc, cb) {
                //console.log(file.path);
                //assert.equal(vp("test/fixtures", file.path), file.path);
                cb();
            }, function (cb) {
                this.emit("end");
                cb();
            }))
            .on("end", function () {
                done();
            });
    });
});