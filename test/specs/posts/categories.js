var assert    = require("chai").assert;
var crossbow  = require("../../../index");

describe("Adding categories var to global vars", function() {
    it("promotes front-matter categories to main obj", function(done) {

        var site = crossbow.builder({
            config: {
                base: "src",
                urlFormat: {
                    "type:post": "/:filepath"
                }
            }
        });

        site.add({
            type: "post",
            key: "src/_posts/javascript/whatevers.md",
            content: "---\ncategories: js, node, abstract, zindex css\n---\n{{post.date}}"
        });

        site.add({
            type: "post",
            key: "src/_posts/javascript/whatevers2.md",
            content: "---\ncategories: js, node\n---\n{{post.date}}"
        });

        var index = site.add({
            key: "src/index.html",
            content: "{{#categories}}{{this.name}}{{$sep ', '}}{{/categories}}"
        });

        site.freeze();

        assert.equal(site.frozen.categories.length, 4);

        site.compileAll({
            item: index,
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.equal(out.get(2).get("compiled"), "abstract, js, node, zindex css");
                done();
            }
        });
    });
});