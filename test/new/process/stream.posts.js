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

describe("E2E stream - posts", function(){
    it("works with cwd config", function(done){

        var expected = ["blog/post1.html", "blog/post2.html"];
        var out =      [];

        fs.src([
            "test/fixtures/_posts/**"
        ])
            .pipe(crossbow.stream({
                config: {
                    cwd: "test/fixtures"
                }
            }))
            .pipe(through.obj(function (file, enc, cb) {
                out.push(file.relative);
                cb();
            }, function (cb) {
                this.emit("end");
                cb();
            }))
            .on("end", function () {
                assert.deepEqual(expected, out);
                done();
            });
    });
});