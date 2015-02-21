var assert    = require("chai").assert;
var crossbow  = require("../../index");

describe("Workign with Types", function() {

    it("Can determine a `post type` using the filepath & base", function(done) {

        var type = crossbow.builder({
            config: {
                base: "src"
            }
        }).getType("src/_posts/test.md");

        assert.equal(type, "post");

        done();
    });

    it("Can determine a `post type` using the filepath & base", function(done) {

        var type = crossbow.builder({
            config: {
                base: "src",
                dirs: {
                    "type:post": "_blog"
                }
            }
        }).getType("src/_blog/test.md");

        assert.equal(type, "post");

        done();
    });

    it("Can determine a `partial type` when type:type syntax not being used", function(done) {

        var type = crossbow.builder().getType("_layouts/test.hbs");
        assert.equal(type, "partial");
        done();
    });

    it("Can determine a `page type` file has MD extension", function(done) {
        var type = crossbow.builder({config: {base: "src"}}).getType("src/docs/test.md");
        assert.equal(type, "page");
        done();
    });
});