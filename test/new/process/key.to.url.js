var path      = require("../../../lib/core/path");
var assert    = require("chai").assert;
var crossbow  = require("../../../index");
var url       = require("../../../lib/url");
var merge     = require("../../../lib/config").merge;

function testfn (filepath, config) {
    return url.keyToUrl(filepath, merge(config));
}

describe("e2e, making url from key", function() {
    it("urlpaths", function() {
        assert.equal(testfn("index.html"),                                 "/index.html");
        assert.equal(testfn("app/index.html"),                             "/app/index.html");
        assert.equal(testfn("app/index.html",        {prettyUrls: true}),  "/app");
        assert.equal(testfn("app/about.html",        {prettyUrls: true}),  "/app/about");
        assert.equal(testfn("app/about/index.html",  {prettyUrls: true}),  "/app/about");
        assert.equal(testfn("app/about/index2.html", {prettyUrls: true}),  "/app/about/index2");
        assert.equal(testfn("app/about/index2.html", {prettyUrls: false}), "/app/about/index2.html");
    });
});