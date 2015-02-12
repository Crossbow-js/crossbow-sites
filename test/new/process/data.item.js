var assert    = require("chai").assert;
var path      = require("../../../lib/core/path");
var crossbow  = require("../../../index");

describe("Item compile data", function() {

    it("should always use data given at compile time over any other", function(done) {

        var site = crossbow.builder({config: {cwd: "test/fixtures"}});
        var page = site.addPage("index.html", ":{{shane}}:{{site.title}}");

        site.compile({
            item: page,
            data: {
                shane: "hello",
                site: {
                    title: "Hi there"
                }
            },
            cb: function (err, out) {
                assert.equal(out.get("compiled"), ":hello:Hi there");
                done();
            }
        });
    });
    it("should always use data given at compile time over any other", function(done) {

        var site = crossbow.builder({
            config: {
                cwd: "test/fixtures",
                logLevel: "debug"
            }
        });

        var page = site.addPage("index.html", "---\nlayout: 'parent.html'\n---\nDummy page");

        site.compile({
            item: page,
            cb: function (err, out) {
                assert.include(out.get("compiled"), "<title>Crossbow - Index</title>");
                done();
            }
        });
    });
    it("should have data available that was given in constructor", function(done) {

        var site = crossbow.builder({
            config: {
                cwd: "test/fixtures",
                logLevel: "debug"
            },
            data: {
                site: {
                    title: "Human"
                }
            }
        });

        var page = site.addPage("index.html", "---\nlayout: 'parent.html'\n---\n<h1>{{site.title}}</h1>");

        site.compile({
            item: page,
            cb: function (err, out) {
                assert.include(out.get("compiled"), "<h1>Human</h1>");
                done();
            }
        });
    });
});