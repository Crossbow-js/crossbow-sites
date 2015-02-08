var _         = require("lodash");
var assert    = require("chai").assert;
var multiline = require("multiline");
var sinon     = require("sinon");
var fs        = require("fs");
var crossbow = require("../../../index");

describe("Adding a page", function(){
    it("Should Always use title in front-matter first", function(done) {

        var site = crossbow.builder();
        var page = site.addPage("some-file.html", "---\ntitle: \"Cats\"\n---\n<p>Shane is rad, {{page.url}}</p>");

        crossbow.compile({
            item: page,
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.equal(out.title, "Cats");
                done();
            }
        });
    });
    it("Should create a default title if not given in frontmatter", function(done) {

        var site = crossbow.builder();
        var page = site.addPage("some-file.html", "<p>Shane is rad, {{page.url}}</p>");

        crossbow.compile({
            item: page,
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.equal(out.url,            "/some-file");
                assert.equal(out.title,          "Some File");
                assert.equal(out.paths.filePath, "some-file/index.html");
                done();
            }
        });
    });
    it("Should create a default title if not given in frontmatter when pretty urls's = false", function(done) {

        var site = crossbow.builder({
            config: {
                prettyUrls: false
            }
        });

        var page = site.addPage("some-file.html", "<p>Shane is rad, {{page.url}}</p>");

        crossbow.compile({
            item: page,
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.equal(out.url,            "/some-file.html");
                assert.equal(out.title,          "Some File");
                assert.equal(out.paths.filePath, "some-file.html");
                done();
            }
        });
    });
    it("Should create a default title if not given in frontmatter when pretty urls's = false", function(done) {

        var site = crossbow.builder({
            config: {
                prettyUrls: false,
                cwd: "test/fixtures"
            }
        });

        var page = site.addPage("test/fixtures/some_file.html", "<p>Shane is rad, {{page.url}}</p>");

        crossbow.compile({
            item: page,
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.equal(out.url,            "/some_file.html");
                assert.equal(out.title,          "Some File");
                assert.equal(out.paths.filePath, "some_file.html");
                done();
            }
        });
    });
});