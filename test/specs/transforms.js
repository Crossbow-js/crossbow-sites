var assert    = require("chai").assert;
var crossbow  = require("../../index");

describe("Content transforms", function() {

    it("Adds a content transform", function(done) {

        var site = crossbow.builder();

        site.transform({type: "content", when: "before templates", fn: function (opts) {
            return opts.content + " Kittie";
        }}).compile({
            content: "Hi",
            key: "page1.html",
            cb: function (err, out) {
                assert.equal(out.get("compiled"), "Hi Kittie");
                done();
            }
        });
    });

    it("Adds an item transform", function(done) {

        var site = crossbow.builder();

        site.transform({type: "item", when: "before add", fn: function (opts) {
            return opts.item.set("url", "/shane");
        }});

        site.compile({
            content: "Hi",
            key: "page1.html",
            cb: function (err, out) {
                assert.equal(out.get("url"), "/shane");
                done();
            }
        });
    });
});