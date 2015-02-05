var _         = require("lodash");
var assert    = require("chai").assert;
var multiline = require("multiline");
var sinon     = require("sinon");
var fs        = require("fs");
var crossbow  = require("../../../index");

describe("Default layouts", function() {

    it("Layout construction using default given as string", function(done) {

        var site = crossbow.builder({
            config: {
                defaultLayout: "parent.html",
                cwd: "test/fixtures"
            }
        });

        var page2  = site.addPage("about.html", "This is the page Content");

        site.compile({
            item: page2,
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.include(out.compiled, "<h1>Parent Layout</h1>");
                done();
            }
        });
    });
});