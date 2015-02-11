var assert    = require("chai").assert;
var url       = require("../../../lib/url");
var merge     = require("../../../lib/config").merge;

function testfn (filepath, config) {
    return url.makeFilepath(filepath, merge(config));
}

describe("Resolving filepaths", function() {
    it("filepaths", function() {
        var filepath = "_src/app/index.html";
        assert.equal(testfn(filepath, {}),  "_src/app/index.html");
        assert.equal(testfn("/" + filepath, {}),  "_src/app/index.html");
    });
    it("remove cwd", function() {
        var filepath = "_src/app/index.html";
        assert.equal(testfn(filepath, {cwd: "_src"}),     "app/index.html");
        assert.equal(testfn(filepath, {cwd: ""}),         "_src/app/index.html");
        assert.equal(testfn(filepath, {cwd: "."}),        "_src/app/index.html");
        assert.equal(testfn(filepath, {cwd: "./"}),       "_src/app/index.html");
        assert.equal(testfn(filepath, {cwd: "_src/app"}), "index.html");
    });
    it("remove cwd repeated", function() {
        assert.equal(testfn("/_src/app/another/index.html", {cwd: "_src"}),      "app/another/index.html");
        assert.equal(testfn("/_src/app/another/index.html", {cwd: "_src/app"}),  "another/index.html");
    });

    it("handles pretty urls", function() {
        assert.equal(testfn("_src/app/docs.html", {cwd: "_src", prettyUrls: true}),  "app/docs/index.html");
        assert.equal(testfn("_src/docs.html",     {cwd: "_src", prettyUrls: true}),  "docs/index.html");
        assert.equal(testfn("docs.html",          {prettyUrls: true}),               "docs/index.html");
    });
    it("handles pretty urls + index", function() {
        assert.equal(testfn("index.html",          {prettyUrls: false}),        "index.html");
        assert.equal(testfn("index.html",          {prettyUrls: true}),         "index.html");
        assert.equal(testfn("docs/index.html",     {prettyUrls: true}),         "docs/index.html");
        assert.equal(testfn("docs/app/index.html", {prettyUrls: true}),         "docs/app/index.html");
        assert.equal(testfn("docs/app.html",       {prettyUrls: true}),         "docs/app/index.html");
    });
    it("handles pretty urls + index + cwd", function() {
        assert.equal(testfn("docs/app.html",       {cwd: "docs", prettyUrls: true}),  "app/index.html");
        assert.equal(testfn("docs/app.html",       {cwd: "docs", prettyUrls: false}), "app.html");
    });
});