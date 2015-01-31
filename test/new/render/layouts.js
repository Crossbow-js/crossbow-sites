var _         = require("lodash");
var assert    = require("chai").assert;
var multiline = require("multiline");
var sinon     = require("sinon");
var fs        = require("fs");
var crossbow  = require("../../../index");

describe("Multi page mode", function() {

    it.only("Layout construction", function(done) {

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
});