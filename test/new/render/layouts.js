var _         = require("lodash");
var assert    = require("chai").assert;
var multiline = require("multiline");
var sinon     = require("sinon");
var fs        = require("fs");
var crossbow  = require("../../../index");

describe("Multi page mode", function() {

    it("Layout construction", function(done) {

        var site = crossbow.builder();

        var layout = site.populateCache("_layouts/default.hbs", "Before:{{content}}:After");
        var page2  = site.addPage("about.html", "---\nlayout: 'default.hbs'\n---\nThis is the page Content");

        site.compile({
            item: page2,
            data: {
                kittie: "Hello from the homepage"
            },
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.include(out.compiled, "Before:This is the page Content:After");
                done();
            }
        });
    });

    it("Nested construction", function(done) {

        var site = crossbow.builder();

        var parent = site.populateCache("_layouts/parent.hbs", "Top level: {{content}}");
        var main   = site.populateCache("_layouts/main.hbs", "---\nlayout: 'parent.hbs'\n---\nMain level: {{content}}");
        var layout = site.populateCache("_layouts/default.hbs", "---\nlayout: 'main.hbs'\n---\nFirst layout include:{{content}}");
        var page2  = site.addPage("about.html", "---\nlayout: 'default.hbs'\n---\n This is the page Content");

        site.compile({
            item: page2,
            data: {
                kittie: "Hello from the homepage"
            },
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.include(out.compiled, "Top level: Main level: First layout include: This is the page Content");
                done();
            }
        });
    });
});