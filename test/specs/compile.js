var assert    = require("chai").assert;
var crossbow  = require("../../index");

describe("Public method: compileAll()", function() {

    it("Add 2 pages, compile all and returns an Immutable List", function(done) {

        var site = crossbow.builder();

        var index = site.add({key: "src/docs/index.html", content: "<p>{{itemTitle}} is rad, {{page.url}}, {{site.title}}</p>"});
        var about = site.add({key: "src/docs/about.html", content: "<div>About page</div>"});

        site.freeze();

        site.compileAll({
            cb: function (err, out) {
                assert.equal(out.size, 2);
                done();
            }
        });
    });
});