var assert      = require("chai").assert;
var url         = require("../../lib/url");
var makePostUrl = url.makePostUrl;

describe("Creating Post URLS from keys + categories & tags", function () {

    it("replaces filename, 1 level deep", function () {

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
    it("replaces filename, 1 level deep", function () {

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
});