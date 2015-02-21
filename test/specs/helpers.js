var assert = require("chai").assert;

describe("registering custom handlebars helpers", function(){

    it("should add a helper with context", function(done) {

        var site = require("../../index").builder();

        site.registerHelper("shane", function (compiler) {
            return function () {
                return compiler.item.get("title") + " - kittie";
            };
        });

        site.compile({
            key: "index.html",
            content: "{{shane}}",
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.equal(out.get("compiled"), "Index - kittie");
                done();
            }
        });
    });
});