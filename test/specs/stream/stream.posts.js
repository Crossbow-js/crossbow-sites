var crossbow = require("../../../index");
var through  = require("through2");
var fs       = require("vinyl-fs");
var assert   = require("chai").assert;

var outpath   = "./stream-out";
var rimraf    = require("rimraf").sync;

rimraf(outpath);

describe("E2E stream - posts", function(){
    it("works with base config", function(done){

        var expected = ["blog/post1.html", "blog/post2.html"];
        var out =      [];

        fs.src([
            "test/fixtures/_posts/**"
        ])
            .pipe(crossbow.stream({
                config: {
                    base: "test/fixtures"
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
    it("works with Pretty urls config", function(done){

        var expected = ["blog/post1/index.html", "blog/post2/index.html"];
        var out =      [];

        fs.src([
            "test/fixtures/_posts/**"
        ])
            .pipe(crossbow.stream({
                config: {
                    base: "test/fixtures",
                    prettyUrls: true
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
    it("works with Pretty urls config + urlFormat", function(done){

        var expected = ["shane/post1/index.html", "shane/post2/index.html"];
        var out =      [];

        fs.src([
            "test/fixtures/_posts/**"
        ])
            .pipe(crossbow.stream({
                config: {
                    base: "test/fixtures",
                    prettyUrls: true,
                    urlFormat: {
                        "type:post": "/shane/:filename"
                    }
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
    it("works with urlFormat", function(done) {

        var expected = ["shane/kittie/post1.html", "shane/kittie/post2.html"];
        var out =      [];

        fs.src([
            "test/fixtures/_posts/**"
        ])
            .pipe(crossbow.stream({
                config: {
                    base: "test/fixtures",
                    urlFormat: {
                        "type:post": "/shane/kittie/:filename"
                    }
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