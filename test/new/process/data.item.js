var assert    = require("chai").assert;
var path      = require("../../../lib/core/path");
var crossbow  = require("../../../index");

describe("Item compile data", function() {

    it("should always use data given at compile time over any other", function(done) {

        var site = crossbow.builder({config: {cwd: "test/fixtures"}});
        var page = site.add({key: "index.html", content: ":{{shane}}:{{site.title}}"});

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
                cwd: "test/fixtures"
            }
        });

        var page = site.add({key: "index.html", content: "---\nlayout: 'parent.html'\n---\nDummy page"});

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
                cwd: "test/fixtures"
            },
            data: {
                site: {
                    title: "Human"
                }
            }
        });

        var page = site.add({key: "index.html", content: "---\nlayout: 'parent.html'\n---\n<h1>{{site.title}}</h1>"});

        site.compile({
            item: page,
            cb: function (err, out) {
                assert.include(out.get("compiled"), "<h1>Human</h1>");
                done();
            }
        });
    });
    it("should promote front-vars to first-level of page", function(done) {

        var site = crossbow.builder({
            config: {
                cwd: "test/fixtures"
            }
        });

        var page = site.add({key: "index.html", content: "---\nlayout: 'parent.html'\nanimal: 'cat'\n---\n<h1>{{page.animal}}</h1>"});

        site.compile({
            item: page,
            cb: function (err, out) {
                assert.include(out.get("compiled"), "<h1>cat</h1>");
                done();
            }
        });
    });
});