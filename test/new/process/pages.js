var assert    = require("chai").assert;
var crossbow  = require("../../../index");

describe("Adding muliple pages", function() {

    it("Add multi pages & compile with knowledge", function(done) {

        var site = crossbow.builder();

        var index = site.add({key: "src/docs/index.html", content: "<p>{{pages.length}}</p>"});
        var about = site.add({key: "src/docs/about.html", content: "<div>About page</div>"});

        site.freeze();

        site.compile({
            item: index,
            cb: function (err, out) {
                assert.include(out.get("compiled"), "<p>2</p>");
                done();
            }
        });
    });
});