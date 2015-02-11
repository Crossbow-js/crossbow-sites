var _         = require("lodash");
var assert    = require("chai").assert;
var multiline = require("multiline");
var sinon     = require("sinon");
var fs        = require("fs");
var crossbow  = require("../../../index");

describe("Adding a page", function() {

    it("Add 1 page & compile", function(done) {

        var site = crossbow.builder();

        var index = site.addPage("src/docs/index.html", "<p>{{itemTitle}} is rad, {{page.url}}, {{site.title}}</p>");
        var about = site.addPage("src/docs/about.html", "<div>About page</div>");

        assert.equal(index.get("key"),   "src/docs/index.html");
        assert.equal(index.get("url"),   "/src/docs/index.html");
        assert.equal(index.get("title"), "Index");

        assert.equal(site.cache.byType("page").size, 2);

        var collection = site.cache.byType("page");

        assert.equal(collection.get("src/docs/index.html").get("url"), "/src/docs/index.html");
        assert.equal(collection.get("src/docs/index.html").get("title"), "Index");
        assert.equal(collection.get("src/docs/about.html").get("url"), "/src/docs/about.html");
        assert.equal(collection.get("src/docs/about.html").get("title"), "About");

        site.compile({
            item: index,
            data: {
                site: {
                    title: "browsersync"
                },
                itemTitle: "Crossbow"
            },
            cb: function (err, out) {
                assert.include(out.get("compiled"), "<p>Crossbow is rad, /src/docs/index.html, browsersync</p>");
                done();
            }
        });
    });
    it("Add 1 page & compile with layouts", function(done) {

        var site = crossbow.builder({
            config: {
                cwd: "test/fixtures"
            }
        });

        var item = site.addPage("src/docs/index.html", "---\nlayout: 'docs.html'\n---\n<p>{{itemTitle}} is rad, {{page.url}}, {{site.title}}</p>");

        assert.equal(item.get("key"),   "src/docs/index.html");
        assert.equal(item.get("url"),   "/src/docs/index.html");
        assert.equal(item.get("title"), "Index");

        assert.equal(site.cache.byType("page").size, 1);
        assert.equal(site.cache.byType("page").get("src/docs/index.html").get("title"), "Index");
        assert.equal(site.cache.byType("page").get("src/docs/index.html").get("url"), "/src/docs/index.html");

        site.compile({
            item: item,
            data: {
                site: {
                    title: "browsersync"
                },
                itemTitle: "Crossbow"
            },
            cb: function (err, out) {

                if (err) {
                    console.log(err);
                } else {
                    assert.include(out.get("compiled"), "<h1>Parent Layout</h1>");
                    assert.include(out.get("compiled"), "<p>Crossbow is rad, /src/docs/index.html, browsersync</p>");
                }
                done();
            }
        });
    });
});