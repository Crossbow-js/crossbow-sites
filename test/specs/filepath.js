var assert    = require("chai").assert;
var url       = require("../../lib/url");
var merge     = require("../../lib/config").merge;

describe("Resolving filepaths", function() {
    it("filepaths", function() {
        assert.equal(url.makeFilepath("_src/app/index.html",  merge({})),  "_src/app/index.html");
        assert.equal(url.makeFilepath("/_src/app/index.html", merge({})),  "_src/app/index.html");
    });
    it("remove base", function() {
        var filepath = "_src/app/index.html";
        assert.equal(url.makeFilepath(filepath,               merge({base: "_src"})),     "app/index.html");
        assert.equal(url.makeFilepath(filepath,               merge({base: ""})),         "_src/app/index.html");
        assert.equal(url.makeFilepath(filepath,               merge({base: "."})),        "_src/app/index.html");
        assert.equal(url.makeFilepath(filepath,               merge({base: "./"})),       "_src/app/index.html");
        assert.equal(url.makeFilepath(filepath,               merge({base: "_src/app"})), "index.html");
    });
    it("remove base repeated", function() {
        assert.equal(url.makeFilepath("/_src/app/another/index.html", merge({base: "_src"})),     "app/another/index.html");
        assert.equal(url.makeFilepath("/_src/app/another/index.html", merge({base: "_src/app"})), "another/index.html");
    });

    it("handles pretty urls", function() {
        assert.equal(url.makeFilepath("_src/app/docs.html",   merge({base: "_src", prettyUrls: true})), "app/docs/index.html");
        assert.equal(url.makeFilepath("_src/docs.html",       merge({base: "_src", prettyUrls: true})), "docs/index.html");
        assert.equal(url.makeFilepath("docs.html",            merge({prettyUrls: true})),               "docs/index.html");
    });
    it("handles pretty urls + index", function() {
        assert.equal(url.makeFilepath("index.html",           merge({prettyUrls: false})), "index.html");
        assert.equal(url.makeFilepath("index.html",           merge({prettyUrls: true})),  "index.html");
        assert.equal(url.makeFilepath("docs/index.html",      merge({prettyUrls: true})),  "docs/index.html");
        assert.equal(url.makeFilepath("docs/app/index.html",  merge({prettyUrls: true})),  "docs/app/index.html");
        assert.equal(url.makeFilepath("docs/app.html",        merge({prettyUrls: true})),  "docs/app/index.html");
    });
    it("handles pretty urls + index + base", function() {
        assert.equal(url.makeFilepath("docs/app.html",        merge({base: "docs", prettyUrls: true})),  "app/index.html");
        assert.equal(url.makeFilepath("docs/app.html",        merge({base: "docs", prettyUrls: false})), "app.html");
    });
});