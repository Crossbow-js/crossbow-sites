var _         = require("lodash");
var path      = require("../../../lib/core/path");
var assert    = require("chai").assert;
var multiline = require("multiline");
var sinon     = require("sinon");
var fs        = require("fs");
var crossbow  = require("../../../index");
var url       = require("../../../lib/url");
var merge     = require("../../../lib/config").merge;

function testfn (filepath, config) {
    return url.makeUrlpath(filepath, merge(config));
}

describe("Resolving url paths", function() {
    it("urlpaths", function() {
        var filepath = url.makeFilepath("_src/app/about.html", merge({cwd: "_src"}));
        assert.equal(testfn(filepath), "/app/about.html");
        assert.equal(testfn("_src/app/index.html"), "/_src/app/index.html");
    });
    it("urlpaths with pretty urls", function() {
        assert.equal(testfn("app/index.html",              {prettyUrls: true}), "/app");
        assert.equal(testfn("app/shane/index.html",        {prettyUrls: true}), "/app/shane");
        assert.equal(testfn("app/shane/index_.html",       {prettyUrls: true}), "/app/shane/index_");
        assert.equal(testfn("app/shane/kittie/index.html", {prettyUrls: true}), "/app/shane/kittie");
        assert.equal(testfn("app/shane/kittie/about.html", {prettyUrls: true}), "/app/shane/kittie/about");
    });
    it("urlpaths with pretty urls + non-index base", function() {
        var filepath = url.makeFilepath("_src/app/shane/kittie/index2.html", merge({cwd: "_src"}));
        assert.equal(filepath, "app/shane/kittie/index2.html");
        assert.equal(testfn(filepath, {prettyUrls: true}), "/app/shane/kittie/index2");
    });
    it("urlpaths with pretty urls + non-index base", function() {
        var filepath = url.makeFilepath("_src/app/shane/kittie/index2.html", merge({cwd: "_src"}));
        assert.equal(filepath, "app/shane/kittie/index2.html");
        assert.equal(testfn(filepath, {prettyUrls: true}), "/app/shane/kittie/index2");
    });
});