var path      = require("../../lib/core/path");
var assert    = require("chai").assert;
var crossbow  = require("../../index");
var url       = require("../../lib/url");
var merge     = require("../../lib/config").merge;

describe("Resolving url paths", function() {
    it("urlpaths", function() {
        var filepath = url.makeFilepath("_src/app/about.html", merge({base: "_src"}));
        assert.equal(url.makeUrlpath(filepath,              merge()), "/app/about.html");
    });
    it("urlpaths with pretty urls", function() {
        assert.equal(url.makeUrlpath("app/index.html",              merge({prettyUrls: true})), "/app");
        assert.equal(url.makeUrlpath("app/shane/index.html",        merge({prettyUrls: true})), "/app/shane");
        assert.equal(url.makeUrlpath("app/shane/index_.html",       merge({prettyUrls: true})), "/app/shane/index_");
        assert.equal(url.makeUrlpath("app/shane/kittie/index.html", merge({prettyUrls: true})), "/app/shane/kittie");
        assert.equal(url.makeUrlpath("app/shane/kittie/about.html", merge({prettyUrls: true})), "/app/shane/kittie/about");
    });
    it("urlpaths with pretty urls + non-index base", function() {

        var filepath = url.makeFilepath("_src/app/shane/kittie/index2.html", merge({base: "_src"}));

        assert.equal(filepath, "app/shane/kittie/index2.html");

        assert.equal(url.makeUrlpath(filepath, merge({prettyUrls: false})), "/app/shane/kittie/index2.html");
        assert.equal(url.makeUrlpath(filepath, merge({prettyUrls: true})),  "/app/shane/kittie/index2");
    });
    it("urlpaths with pretty urls + non-index base", function() {
        var filepath = url.makeFilepath("_src/app/shane/kittie/index2.html", merge({base: "_src"}));
        assert.equal(filepath, "app/shane/kittie/index2.html");
        assert.equal(url.makeUrlpath(filepath, merge({prettyUrls: true})), "/app/shane/kittie/index2");
    });
});