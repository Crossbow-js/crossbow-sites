var assert = require("chai").assert;

describe("registering custom handlebars helpers", function(){

    it.skip("should add a helper with context", function(done) {

        var site = require("../../../").builder();

        site.registerHelper("shane", function (compiler) {
            return function () {
                console.log(compiler.item);
                return "kittie ";
            };
        });

        site.compile({
            key: "index.html",
            content: "{{shane}}",
            cb: function (err, out) {
                assert.equal(out.get("compiled"), "kittie");
                done();
            }
        });
    });
});