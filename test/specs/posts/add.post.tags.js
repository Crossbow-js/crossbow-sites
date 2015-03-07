var assert    = require("chai").assert;
var crossbow  = require("../../../index");

describe("Adding a post with tags", function() {
    it("promotes front-matter tags to main obj", function() {

        var site = crossbow.builder({
            config: {
                base: "src",
                urlFormat: {
                    "type:post": "/:filepath"
                }
            }
        });

        var index = site.add({
            type: "post",
            key: "src/_posts/javascript/whatevers.md",
            content: "---\ntags: js, node\n---\n{{post.date}}"
        });

        assert.equal(index.get("key"),      "src/_posts/javascript/whatevers.md");
        assert.equal(index.get("url"),      "/javascript/whatevers.html");
        assert.deepEqual(index.get("_tags").toJS(), ["js", "node"]);
    });
});