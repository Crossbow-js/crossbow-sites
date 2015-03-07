var assert    = require("chai").assert;
var crossbow  = require("../../index");

describe("Configuring layouts", function() {

    it("Uses NO layout by default", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures"
            }
        });

        var index = site.add({key: "src/docs/index-2.html", content: "<p>{{pages.length}}</p>"});

        site.freeze();

        site.compile({
            item: index,
            cb: function (err, out) {
                assert.equal(out.get("compiled"), "<p>1</p>");
                done();
            }
        });
    });
    it("Adds a layout using defaultLayout property", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures",
                defaultLayout: "default.html"
            }
        });

        var index = site.add({key: "src/docs/index-2.html", content: "<p>{{pages.length}}</p>"});

        site.freeze();

        site.compile({
            item: index,
            cb: function (err, out) {
                assert.include(out.get("compiled"), "<title>Index 2</title>");
                done();
            }
        });
    });
    it("Add's a defaultLayouts property for type:page", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures",
                defaultLayouts: {
                    "type:page": "default.html"
                }
            }
        });

        var index = site.add({key: "src/docs/index-2.html", content: "<p>{{pages.length}}</p>"});

        site.freeze();

        site.compile({
            item: index,
            cb: function (err, out) {
                assert.include(out.get("compiled"), "<title>Index 2</title>");
                done();
            }
        });
    });
    it("Adds multiple defaultLayouts properties for type:page & type:post", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures",
                defaultLayouts: {
                    "type:page": "default.html",
                    "type:post": "post.hbs"
                }
            }
        });

        var index = site.add({key: "test/fixtures/docs/index-2.html", content: "<p>{{posts.length}}</p>"});
        var post  = site.add({type: "post", key: "test/fixtures/_posts/test.md", content: "Some amazing post"});

        site.compileAll({
            cb: function (err, out) {
                assert.include(out.get(0).get("compiled"), "<main class=\"page-content\">");
                assert.include(out.get(1).get("compiled"), "<div class=\"post-content\">");
                done();
            }
        });
    });
});