var assert      = require("chai").assert;
var url         = require("../../lib/url");
var makePostUrl = url.makePostUrl;

describe("Creating Post URLS from keys + categories & tags", function () {

    it("Adds categories", function () {

        var config = {
            postUrlFormat: "/blog/:category/:filename",
            prettyUrls: false
        };

        var categories = ["js", "node"];

        var actual = makePostUrl("posts/post1.md", config, categories);

        var expected = {
            filePath: "blog/js/node/post1.html",
            url: "/blog/js/node/post1.html"
        };

        assert.deepEqual(actual, expected);
    });
    it("Adds categories", function () {

        var config = {
            postUrlFormat: "/blog/:category/:filename",
            prettyUrls: true
        };

        var categories = ["js", "node"];

        var actual = makePostUrl("posts/post1.md", config, categories);

        var expected = {
            filePath: "blog/js/node/post1/index.html",
            url: "/blog/js/node/post1"
        };

        assert.deepEqual(actual, expected);
    });
    it("removes categories categories when none exist + pretty", function () {

        var config = {
            postUrlFormat: "/blog/:category/:filename",
            prettyUrls: true
        };

        var categories = [];

        var actual = makePostUrl("posts/post1.md", config, categories);

        var expected = {
            filePath: "blog/post1/index.html",
            url: "/blog/post1"
        };

        assert.deepEqual(actual, expected);
    });
    it("removes categories categories when none exist + none pretty", function () {

        var config = {
            postUrlFormat: "/blog/:category/:filename",
            prettyUrls: false
        };

        var categories = [];

        var actual = makePostUrl("posts/post1.md", config, categories);

        var expected = {
            filePath: "blog/post1.html",
            url: "/blog/post1.html"
        };

        assert.deepEqual(actual, expected);
    });
});