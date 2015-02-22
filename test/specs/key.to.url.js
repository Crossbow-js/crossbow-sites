var path      = require("../../lib/core/path");
var assert    = require("chai").assert;
var crossbow  = require("../../index");
var url       = require("../../lib/url");
var merge     = require("../../lib/config").merge;

describe("e2e, making url from key", function() {

    it("urlpaths containing index", function() {

        assert.equal(url.keyToUrl("index.html",            merge()),                    "/index.html");
        assert.equal(url.keyToUrl("app/index.html",        merge()),                    "/app/index.html");
    });
    it("urlpaths containing index + Pretty urls", function() {

        assert.equal(url.keyToUrl("index.html",            merge({prettyUrls: true})),  "/");
        assert.equal(url.keyToUrl("app/index.html",        merge({prettyUrls: true})),  "/app");
        assert.equal(url.keyToUrl("app/about/index.html",  merge({prettyUrls: true})),  "/app/about");
    });

    it("urlpaths not containing index", function () {

        assert.equal(url.keyToUrl("about-this.html",       merge()),               "/about-this.html");
        assert.equal(url.keyToUrl("docs/about-this.html",  merge()),               "/docs/about-this.html");
    });

    it("urlpaths not containing index + Pretty urls", function () {

        assert.equal(url.keyToUrl("about.html",            merge({prettyUrls: true})),  "/about");
        assert.equal(url.keyToUrl("app/about.html",        merge({prettyUrls: true})),  "/app/about");
        assert.equal(url.keyToUrl("app/about/index2.html", merge({prettyUrls: true})),  "/app/about/index2");
    });


    it("urlpaths not containing index + Pretty urls", function () {

        assert.equal(url.keyToUrl("_src/app/about.html",        merge({prettyUrls: true, base: "_src"})),  "/app/about");
        assert.equal(url.keyToUrl("_src/app/about/index2.html", merge({prettyUrls: true, base: "_src"})),  "/app/about/index2");
    });

    describe("E2E post urls", function () {

        it("in default directory", function () {

            var key       = "_posts/blog/post1.md";
            var expected  = "/blog/post1.html";

            var site = crossbow.builder();

            var url  = site.add({
                type:    site.getType(key),
                key:     key,
                content: "Sus"
            }).get("url");

            assert.equal(url, expected);
        });

        it("in default directory + base", function () {
            var key       = "_src/_posts/blog/post1.md";
            var expected  = "/blog/post1.html";

            var site = crossbow.builder({
                config: {
                    base: "_src"
                }
            });

            var url  = site.add({
                type:    site.getType(key),
                key:     key,
                content: "Sus"
            }).get("url");

            assert.equal(url, expected);
        });
        it("in default directory + base + pretty urls", function () {
            var key       = "_src/_posts/blog/post1.md";
            var expected  = "/blog/post1";

            var site = crossbow.builder({
                config: {
                    base: "_src",
                    prettyUrls: true
                }
            });

            var url  = site.add({
                type:    site.getType(key),
                key:     key,
                content: "Sus"
            }).get("url");

            assert.equal(url, expected);
        });
    });
});