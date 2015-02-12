var _         = require("lodash");
var assert    = require("chai").assert;
var multiline = require("multiline");
var sinon     = require("sinon");
var fs        = require("fs");
var crossbow = require("../../../index");

describe("Compile render", function(){
    it("does not screw code", function(done) {
        var site = crossbow.builder();
        var page = site.addPage("docs.md", "{{compile site.title}}");

        site.compile({
            item: page,
            data: {
                title: "Shane",
                site: {
                    title: "{{site.name}}",
                    name: "Crossbow"
                }
            },
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                require("d-logger")(out.compiled);
                assert.include(out.compiled, "<p>Crossbow</p>");
                done();
            }
        });
    });
});