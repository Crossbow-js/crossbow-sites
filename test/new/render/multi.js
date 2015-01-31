var _         = require("lodash");
var assert    = require("chai").assert;
var multiline = require("multiline");
var sinon     = require("sinon");
var fs        = require("fs");
var crossbow = require("../../../index");

describe("Multi page mode", function() {

    it("Can render with knowledge of other pages", function(done) {

        var site = crossbow.builder();

        var page1 = site.addPage("index.html", "{{page.data.kittie}}");
        var page2 = site.addPage("about.html", "Hello from about page");

        site.compile({
            item: page1,
            data: {
                kittie: "Hello from the homepage"
            },
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.include(out.compiled, "Hello from the homepage");
                done();
            }
        });
    });
});