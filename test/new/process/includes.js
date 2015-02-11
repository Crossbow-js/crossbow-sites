var assert    = require("chai").assert;
var crossbow  = require("../../../index");

describe("Doing includes", function() {

    it("Add 1 page & compile with includes", function(done) {

        var site = crossbow.builder({
            config: {
                cwd: "test/fixtures"
            },
            errorHandler: function (err) {
                console.log(err);
            }
        });

        var item = site.addPage("src/docs/index.html", "{{inc src='button.html' name='kittie'}}");

        site.compile({
            item: item,
            cb: function (err, out) {
                assert.include(out.get("compiled"), "<button>kittie Button</button>");
                done();
            }
        });
    });

    it("Add 1 page & compile with includes in simple mode", function(done) {

        crossbow.compile({
            config: {
                cwd: "test/fixtures"
            },
            key: "src/docs/index.html",
            content: "{{inc src='button.html' name='kittie'}}",
            cb: function (err, out) {
                assert.include(out.get("compiled"), "<button>kittie Button</button>");
                done();
            }
        });
    });

    it("Add 1 page & compile without markdown", function(done) {

        var site = crossbow.builder({
            config: {
                cwd: "test/fixtures"
            },
            errorHandler: function (err) {
                console.log(err);
            }
        });

        var item = site.addPage("src/docs/index.html", "This is not a P");

        site.compile({
            item: item,
            cb: function (err, out) {
                assert.notInclude(out.get("compiled"), "<p>This is not a P</p>");
                assert.include(out.get("compiled"), "This is not a P");
                done();
            }
        });
    });
});