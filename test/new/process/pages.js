var assert    = require("chai").assert;
var crossbow  = require("../../../index");

describe("Adding muliple pages", function() {

    it("Add multi pages & compile with knowledge", function(done) {

        var site = crossbow.builder();

        var index = site.addPage("src/docs/index.html", "<p>{{pages.length}}</p>");
        var about = site.addPage("src/docs/about.html", "<div>About page</div>");

        site.compile({
            item: index,
            cb: function (err, out) {
                assert.include(out.get("compiled"), "<p>2</p>");
                done();
            }
        });
    });
});