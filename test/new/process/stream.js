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
            "test/fixtures/*.html"
        ])
            .pipe(crossbow.stream())
            .pipe(fs.dest(outpath))
            .pipe(through.obj(function (file, enc, cb) {
                assert.equal(vp("test/fixtures", file.path), file.path);
                cb();
            }, function (cb) {
                this.emit("end");
                cb();
            }))
            .on("end", function () {
                done();
            });
    });
    it("works with CWD config", function(done) {
        var count = 0;
        fs.src([
            "test/fixtures/*.html"
        ])
            .pipe(crossbow.stream({
                config: {
                    cwd: "test/fixtures"
                },
                data: {
                    site: "file:_config.yml"
                }
            }))
            .pipe(fs.dest(outpath))
            .pipe(through.obj(function (file, enc, cb) {
                if (file._contents) {
                    count += 1;
                    assert.include(file._contents.toString(), '<link rel="stylesheet" href="/css/main.css"/>');
                }
                assert.equal(vp("", file.path), file.path);
                cb();
            }, function (cb) {
                this.emit("end");
                cb();
            }))
            .on("end", function () {
                assert.equal(count, 5);
                done();
            });
    });
});