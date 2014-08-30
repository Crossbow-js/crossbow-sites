var assert = require("chai").assert;
var url = require("../../lib/url");
var makePageUrl = url.makePageUrl;

describe("Creating Page URLS from keys", function () {


    it("replaces filename, 1 level deep", function () {

        var config = {
            prettyUrls: false
        };

        var actual = makePageUrl("index.html", config);

        var expected = {
            filePath: "index.html",
            url: "/index.html"
        };

        assert.deepEqual(actual, expected);
    });
    it("replaces filename, 1 level deep", function () {

        var config = {
            prettyUrls: false
        };

        var actual = makePageUrl("about-us.html", config);

        var expected = {
            filePath: "about-us.html",
            url: "/about-us.html"
        };

        assert.deepEqual(actual, expected);
    });
    it("replaces filename, 1 level deep", function () {

        var config = {
            prettyUrls: false
        };

        var actual = makePageUrl("about/index.html", config);

        var expected = {
            filePath: "about/index.html",
            url: "/about/index.html"
        };

        assert.deepEqual(actual, expected);
    });
    it("replaces filename, 2 levels deep", function () {

        var config = {
            prettyUrls: false
        };

        var actual = makePageUrl("project/design/job1.html", config);

        var expected = {
            filePath: "project/design/job1.html",
            url: "/project/design/job1.html"
        };

        assert.deepEqual(actual, expected);
    });

    it("replaces filename, 1 level deep", function () {

        var config = {
            prettyUrls: true
        };

        var actual = makePageUrl("index.html", config);

        var expected = {
            filePath: "index.html",
            url: "/index.html"
        };

        assert.deepEqual(actual, expected);
    });
    it("replaces filename, 1 level deep", function () {

        var config = {
            prettyUrls: true
        };

        var actual = makePageUrl("about-us.html", config);

        var expected = {
            filePath: "about-us/index.html",
            url: "/about-us"
        };

        assert.deepEqual(actual, expected);
    });
    it("replaces filename, 1 level deep with existing index", function () {

        var config = {
            prettyUrls: true
        };

        var actual = makePageUrl("about-us/index.html", config);

        var expected = {
            filePath: "about-us/index.html",
            url: "/about-us"
        };

        assert.deepEqual(actual, expected);
    });
    it("replaces filename, 1 level deep", function () {

        var config = {
            prettyUrls: true
        };

        var actual = makePageUrl("about/shane.html", config);

        var expected = {
            filePath: "about/shane/index.html",
            url: "/about/shane"
        };

        assert.deepEqual(actual, expected);
    });
});