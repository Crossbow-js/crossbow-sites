var crossbow = require("../../../index");
var through  = require("through2");
var File     = require("vinyl");
var assert   = require("chai").assert;

var outpath   = "./stream-out";
var rimraf    = require("rimraf").sync;

var Readable  = require("stream").Readable;

function readStream (content) {
    var rs = new Readable({objectMode: true});
    rs._read = function () {
        if (content) {
            this.push(content);
            this.push(null);
        }
    };
    return rs;
}

rimraf(outpath);

describe("E2E stream - posts with cache (2)", function() {
    it("knows when frontmatter has changed", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures"
            }
        });

        var expected = ["blog/post1.html", "blog/post2.html"];
        var out =      [];
        var rs  =      readStream();
        var files = {};

        rs.push(new File({
            cwd: "test/fixtures",
            base: "/test/",
            path: "/test/fixtures/_posts/post1.md",
            contents: new Buffer("Post 1, first run!")
        }));
        rs.push(new File({
            cwd: "test/fixtures",
            base: "/test/",
            path: "/test/fixtures/_posts/post2.md",
            contents: new Buffer("Post 2, first run!")
        }));
        rs.push(null);

        rs.pipe(crossbow.stream({builder: site}))
            .pipe(through.obj(function (file, enc, cb) {
                files[file.path] = file.contents.toString();
                out.push(file.relative);
                cb();
            }, function (cb) {
                this.emit("end");
                cb();
            }))
            .on("end", function () {
                assert.equal(Object.keys(files).length, 2);
                assert.deepEqual(out, expected);
                assert.include(files["blog/post1.html"], "<p>Post 1, first run!</p>");
                assert.include(files["blog/post2.html"], "<p>Post 2, first run!</p>");
                //done();
                secondRun();
            });

        function secondRun() {
            var files = {};
            var rs2 = readStream();
            rs2.push(new File({
                cwd: "test/fixtures",
                base: "/test/",
                path: "/test/fixtures/_posts/post1.md",
                contents: new Buffer("---\ntitle: Crossbow\n---\nPost 1, first run!")
            }));
            rs2.push(null);
            rs2.pipe(crossbow.stream({builder: site}))
                .pipe(through.obj(function (file, enc, cb) {
                    files[file.path] = file.contents.toString();
                    cb();
                }, function (cb) {
                    assert.equal(Object.keys(files).length, 2);
                    //console.log(files);
                    //assert.include(outfiles["blog/post1.html"], "<p>Post 1, second run!</p>");
                    //assert.equal(site.cache.byType("post").size, 2);
                    //assert.include(site.cache.byType("post").get(0).get("compiled"), "<p>Post 1, second run!</p>");
                    //assert.include(site.cache.byType("post").get(1).get("compiled"), "<p>Post 2, first run!</p>");
                    this.emit("end");
                    cb();
                    done();
                }));
        }
    });
});