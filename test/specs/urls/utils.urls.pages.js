var assert = require("chai").assert;
var Immutable = require("immutable");
var url = require("../../../lib/url");
var makePageUrl = url.makePageUrl;

var configTrue = Immutable.Map({
    prettyUrls: true
});
var configFalse = Immutable.Map({
    prettyUrls: false
});

describe("Creating Page URLS from keys", function () {

    it("replaces filename, 1 level deep", function () {

        var actual = makePageUrl("index.html", configFalse);

        assert.deepEqual(actual.filePath, "index.html");
        assert.deepEqual(actual.url, "/index.html");
    });
    it("replaces filename, 1 level deep", function () {

        var actual = makePageUrl("about-us.html", configFalse);

        assert.deepEqual(actual.filePath, "about-us.html");
        assert.deepEqual(actual.url, "/about-us.html");
    });
    it("replaces filename, 1 level deep", function () {

        var actual = makePageUrl("about/index.html", configFalse);

        assert.deepEqual(actual.filePath, "about/index.html");
        assert.deepEqual(actual.url, "/about/index.html");
    });
    it("replaces filename, 2 levels deep", function () {

        var actual = makePageUrl("project/design/job1.html", configFalse);

        assert.deepEqual(actual.filePath, "project/design/job1.html");
        assert.deepEqual(actual.url, "/project/design/job1.html");
    });

    it("replaces filename, 1 level deep", function () {

        var actual = makePageUrl("index.html", configTrue);

        assert.deepEqual(actual.filePath, "index.html");
        assert.deepEqual(actual.url, "/index.html");
    });
    it("replaces filename, 1 level deep", function () {

        var actual = makePageUrl("about-us.html", configTrue);

        assert.deepEqual(actual.filePath, "about-us/index.html");
        assert.deepEqual(actual.url, "/about-us");
    });
    it("replaces filename, 1 level deep with existing index", function () {

        var actual = makePageUrl("about-us/index.html", configTrue);

        assert.deepEqual(actual.filePath, "about-us/index.html");
        assert.deepEqual(actual.url, "/about-us");
    });
    it("replaces filename, 1 level deep", function () {

        var actual = makePageUrl("about/shane.html", configTrue);

        assert.deepEqual(actual.filePath, "about/shane/index.html");
        assert.deepEqual(actual.url, "/about/shane");
    });
});