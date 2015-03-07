var assert    = require("chai").assert;
var crossbow  = require("../../../index");

describe("Adding a post with tags", function() {
    it("knows about the current posts tags", function(done) {

        var site = crossbow.builder({
            config: {
                base: "src",
                markdown: false,
                urlFormat: {
                    "type:post": "/:filepath"
                }
            }
        });

        site.add({
            type: "post",
            key: "src/_posts/javascript/whatevers.md",
            content: "---\ntags: js, node\n---\nThis is the first post here"
        });

        site.add({
            type: "post",
            key: "src/_posts/javascript/whatevers2.md",
            content: "---\ntags: js\n---\nThis is the second post here"
        });

        site.add({
            type: "post",
            key: "src/_posts/javascript/whatevers3.md",
            content: "---\ntags: js\n---\nThis is the second post here"
        });

        var index = site.add({
            type: "page",
            key: "src/index.html",
            content: "{{#each tags}}\n<h1>{{this.name}}</h1>\n<ul>\n{{#each this.items}}    <li>{{this.url}}</li>\n{{/each}}</ul>\n{{/each}}"
        });

        site.compile({
            item: index,
            cb: function (err, out) {
                var compiled = out.get("compiled");
                assert.include(compiled, "<h1>js</h1>");
                assert.include(compiled, "<h1>node</h1>");
                assert.include(compiled, "<li>/javascript/whatevers.html</li>");
                assert.include(compiled, "<li>/javascript/whatevers3.html</li>");
                assert.include(compiled, "<li>/javascript/whatevers2.html</li>");
                done();
            }
        });
    });
});