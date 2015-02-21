var assert    = require("chai").assert;
var crossbow  = require("../../index");

describe("Compiling in simple mode", function() {

    it("can render a template", function(done) {

        var content  = "<p>{{itemTitle}} is rad, {{page.url}}, {{site.title}}</p>";
        var content2 = content + "<span>another</span>";
        var key      = "lay/default.hbs";

        var index = crossbow.compile({
            key: "lay/default.hbs",
            content: "{{name}} {{inc src='test/fixtures/_includes/button.html'}}",
            data: {
                name: "shane"
            },
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.equal(out.get("compiled"), "shane <button>shane Button</button>");
                done();
            }
        });
    });
});