var _         = require("lodash");
var assert    = require("chai").assert;
var multiline = require("multiline");
var sinon     = require("sinon");
var fs        = require("fs");
var crossbow = require("../../../index");

describe("Adding a page", function() {

    it.only("Add 1 page & compile", function(done) {

        var site = crossbow.builder();

        var item = site.addPage("src/docs/index.html", "<p>{{other}} is rad, {{page.url}}, {{site.title}}</p>");

        assert.equal(item.get("key"),   "src/docs/index.html");
        assert.equal(item.get("url"),   "/src/docs/index.html");
        assert.equal(item.get("title"), "Index");

        assert.equal(site.cache.byType("page").size, 1);
        assert.equal(site.cache.byType("page").get(0).get("title"), "Index");
        assert.equal(site.cache.byType("page").get(0).get("url"), "/src/docs/index.html");

        site.compile({
            item: item,
            data: {
                site: {
                    title: "browsersync"
                },
                other: "Crossbow"
            },
            cb: function (err, out) {
                assert.include(out.get("compiled"), "<p>Crossbow is rad, /src/docs/index.html, browsersync</p>");
                done();
            }
        });
    });
});