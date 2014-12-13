var multiline = require("multiline");
var assert    = require("chai").assert;
var crossbow  = require("../../../index");

describe("Layouts in custom DIRS", function () {

    beforeEach(function () {

        crossbow.clearCache();

        // Add layouts to cache
        crossbow.populateCache("layouts/parent.html", "::{{content}}::");
    });

    it("uses custom dirs config option to lookup layout files", function (done) {

        var post1 = multiline.stripIndent(function () {/*
         ---
         layout: parent
         title: "Post Title"
         ---
         {{post.title}}
         */});

        var post   = crossbow.addPost("_posts/post2.md", post1);

        var config = {
            dirs: {
                layouts: "layouts"
            }
        };

        crossbow.compileOne(post, config, function (err, out) {
            var compiled = out.compiled;
            assert.include(compiled, "::<p>Post Title</p>::");
            done();
        });
    });
});
