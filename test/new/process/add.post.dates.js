var fs        = require("fs");
var assert    = require("chai").assert;
var crossbow  = require("../../../index");

describe("Adding a post with dates", function() {

    it("Add 1 post & set date from front-matter", function() {

        var site = crossbow.builder();

        var index = site.add({
            type: "post",
            key: "src/_posts/test.md",
            content: "---\ndate: 2013-11-13\n---\n{{post.date}}"
        });

        assert.equal(index.get("key"),      "src/_posts/test.md");
        assert.equal(index.get("url"),      "/blog/test.html");
        assert.equal(index.get("filepath"), "blog/test.html");

        assert.isTrue(index.get("dateObj") instanceof Date);
        assert.equal(index.get("timestamp"), 1384300800000);
    });
    it("Add 1 post & set date when NO front-matter or in filename", function() {

        var site = crossbow.builder();

        var stat    = fs.statSync("./test/fixtures/about.html");
        var content = fs.readFileSync("./test/fixtures/about.html", "utf8");

        var index = site.add({
            type:    "post",
            key:     "src/_posts/test.md",
            content: content,
            stat:    stat
        });

        assert.equal(index.get("key"),      "src/_posts/test.md");
        assert.equal(index.get("url"),      "/blog/test.html");
        assert.equal(index.get("filepath"), "blog/test.html");

        assert.isTrue(index.get("dateObj") instanceof Date);
    });
    it("Add 1 post & set date when in URL", function() {

        var site = crossbow.builder({
            config: {
                cwd: "src",
                urlFormat: {
                    "type:post": "/blog/:filename"
                }
            }
        });

        var index = site.add({
            type: "post",
            key: "src/_posts/javascript/2013-11-14-test.md",
            content: "{{post.date}}"
        });

        assert.equal(index.get("key"),      "src/_posts/javascript/2013-11-14-test.md");
        assert.equal(index.get("url"),      "/blog/test.html");
    });
    it("Add 1 post & set pretty date default to ctime when not set", function() {

        var site = crossbow.builder({config: {cwd: "src"}});

        var index = site.add({
            type: "post",
            key: "src/_posts/javascript/test.md",
            content: "{{post.date}}"
        });

        assert.isTrue(index.get("dateObj") instanceof Date);
    });
    it("Add 1 post & set pretty date when in URL", function() {

        var site = crossbow.builder({config: {cwd: "src"}});

        var index = site.add({
            type: "post",
            key: "src/_posts/javascript/2014-01-01-test.md",
            content: "{{post.date}}"
        });

        assert.equal(index.get("date"),     "January 1, 2014");

        site.freeze();

        site.compile({
            item: index,
            cb: function (err, out) {
                assert.include(out.get("compiled"), "<p>January 1, 2014</p>");
            }
        });
    });
    it("Add 1 post & set pretty date when in Frontmatter", function() {

        var site = crossbow.builder({config: {cwd: "src"}});

        var index = site.add({
            type: "post",
            key: "src/_posts/javascript/test.md",
            content: "---\ndate: 2013-11-13\n---\n{{post.date}}"
        });

        assert.equal(index.get("date"),     "November 13, 2013");

        site.freeze();

        site.compile({
            item: index,
            cb: function (err, out) {
                assert.include(out.get("compiled"), "<p>November 13, 2013</p>");
            }
        });
    });
    it("Add 1 post & set pretty date when in Frontmatter + URL", function() {

        var site = crossbow.builder({config: {cwd: "src"}});

        var index = site.add({
            type: "post",
            key: "src/_posts/javascript/2014-01-01-test.md",
            content: "---\ndate: 2013-11-13\n---\n{{post.date}}"
        });

        assert.equal(index.get("date"),     "November 13, 2013");

        site.freeze();

        site.compile({
            item: index,
            cb: function (err, out) {
                assert.include(out.get("compiled"), "<p>November 13, 2013</p>");
            }
        });
    });
    it("Does not add drafts when the filename begins _", function() {

        var site = crossbow.builder({config: {cwd: "src"}});

        var index = site.add({
            type: "post",
            key: "src/_posts/javascript/_2014-01-01-test.md",
            content: "---\ndate: 2013-11-13\n---\n{{post.date}}"
        });

        assert.equal(index.get("date"),     "November 13, 2013");

        site.freeze();

        assert.equal(site.frozen["posts"].length, 0);
    });

    it("Can override default filters", function() {

        var site = crossbow.builder({
            config: {
                cwd: "src",
                filters: {
                    "type:post": function (item) {
                        return item;
                    }
                }
            }
        });

        var index = site.add({
            type: "post",
            key: "src/_posts/javascript/_2014-01-01-test.md",
            content: "---\ndate: 2013-11-13\n---\n{{post.date}}"
        });

        assert.equal(index.get("date"),     "November 13, 2013");

        site.freeze();

        assert.equal(site.frozen["posts"].length, 1);
    });
});