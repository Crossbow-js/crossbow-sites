var _         = require("lodash");
var assert    = require("chai").assert;
var multiline = require("multiline");
var sinon     = require("sinon");
var fs        = require("fs");
var crossbow = require("../../../index");

describe("Using cache", function() {

    it("Populating the cache", function(done) {

        var site = crossbow.builder();

        site.populateCache("_includes/button.hbs", "<button>{{text}}</button>");

        var page1 = site.addPage("index.html", "{{inc src=\"_includes/button.hbs\" text=\"Click me\"}}");

        site.compile({
            item: page1,
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.include(out.compiled, "<button>Click me</button>");
            }
        });

        /**
         * Check there's no cross-polution of caches
         */
        crossbow.compile({
            content: "{{#md}}#hello{{/md}}",
            cb: function  (err, out) {
                assert.include(out.compiled, "<h1 id=\"hello\">hello</h1>");
                done();
            }
        });
    });
});