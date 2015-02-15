var assert    = require("chai").assert;
var crossbow  = require("../../../index");

describe("Adding a post", function() {

    it("Add 1 post & set's data", function() {

        var site = crossbow.builder();

        var index = site.add({
            type: "post",
            key: "src/_posts/test.md",
            content: "---\ndate: 2013-11-13\n---\n{{post.date}}"
        });

        assert.equal(index.get("key"),      "src/_posts/test.md");
        assert.equal(index.get("url"),      "/blog/test.html");
        assert.equal(index.get("filepath"), "blog/test.html");

        assert.isTrue(index.get("date") instanceof Date);
        assert.equal(index.get("timestamp"), 1384300800000);

    });

    it("Add 1 post & compile", function(done) {

        var site = crossbow.builder({
            config: {
                cwd: "src"
            }
        });

        var index = site.add({type: "post", key: "src/_posts/test.md", content: ":{{post.title}}"});

        assert.equal(index.get("key"),      "src/_posts/test.md");
        assert.equal(index.get("url"),      "/blog/test.html");
        assert.equal(index.get("filepath"), "blog/test.html");

        assert.equal(site.cache.byType("post").size, 1);

        site.freeze();

        site.compile({
            item: index,
            data: {
                site: {
                    title: "browsersync"
                },
                itemTitle: "Crossbow"
            },
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.include(out.get("compiled"), "<p>:Test</p>");
                done();
            }
        });
    });
    it("Add 1 post with custom url format", function(done) {

        var site = crossbow.builder({
            config: {
                cwd: "src",
                urlFormat: {
                    "type:post": "/blog/:filename"
                }
            }
        });

        var index = site.add({type: "post", key: "src/_posts/test.md", content: ":{{post.title}}"});

        assert.equal(index.get("key"),      "src/_posts/test.md");
        assert.equal(index.get("url"),      "/blog/test.html");
        assert.equal(index.get("filepath"), "blog/test.html");

        assert.equal(site.cache.byType("post").size, 1);

        site.freeze();

        site.compile({
            item: index,
            data: {
                site: {
                    title: "browsersync"
                },
                itemTitle: "Crossbow"
            },
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.include(out.get("compiled"), "<p>:Test</p>");
                done();
            }
        });
    });
});