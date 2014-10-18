var assert = require("chai").assert;
var url = require("../../../lib/url");
var makePageUrl = url.makePageUrl;

describe("Creating Page URLS from keys", function () {


    it("replaces filename, 1 level deep", function () {

        var config = {
            prettyUrls: false
        };

        var actual = makePageUrl("index.html", config);

        assert.deepEqual(actual.filePath, "index.html");
        assert.deepEqual(actual.url, "/index.html");
    });
    it("replaces filename, 1 level deep", function () {

        var config = {
            prettyUrls: false
        };

        var actual = makePageUrl("about-us.html", config);

        assert.deepEqual(actual.filePath, "about-us.html");
        assert.deepEqual(actual.url, "/about-us.html");
    });
    it("replaces filename, 1 level deep", function () {

        var config = {
            prettyUrls: false
        };

        var actual = makePageUrl("about/index.html", config);

        assert.deepEqual(actual.filePath, "about/index.html");
        assert.deepEqual(actual.url, "/about/index.html");
    });
    it("replaces filename, 2 levels deep", function () {

        var config = {
            prettyUrls: false
        };

        var actual = makePageUrl("project/design/job1.html", config);

        assert.deepEqual(actual.filePath, "project/design/job1.html");
        assert.deepEqual(actual.url, "/project/design/job1.html");
    });

    it("replaces filename, 1 level deep", function () {

        var config = {
            prettyUrls: true
        };

        var actual = makePageUrl("index.html", config);

        assert.deepEqual(actual.filePath, "index.html");
        assert.deepEqual(actual.url, "/index.html");
    });
    it("replaces filename, 1 level deep", function () {

        var config = {
            prettyUrls: true
        };

        var actual = makePageUrl("about-us.html", config);

        assert.deepEqual(actual.filePath, "about-us/index.html");
        assert.deepEqual(actual.url, "/about-us");
    });
    it("replaces filename, 1 level deep with existing index", function () {

        var config = {
            prettyUrls: true
        };

        var actual = makePageUrl("about-us/index.html", config);

        assert.deepEqual(actual.filePath, "about-us/index.html");
        assert.deepEqual(actual.url, "/about-us");
    });
    it("replaces filename, 1 level deep", function () {

        var config = {
            prettyUrls: true
        };

        var actual = makePageUrl("about/shane.html", config);

        assert.deepEqual(actual.filePath, "about/shane/index.html");
        assert.deepEqual(actual.url, "/about/shane");
    });
});