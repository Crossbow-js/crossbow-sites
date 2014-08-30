var multiline = require("multiline");
var assert    = require("chai").assert;
var crossbow  = require("../../index");

var parentLayout = multiline.stripIndent(function () {/*
 <!DOCTYPE html>
 <html>
 <head><title>Parent Layout</title></head>
 {#content /}
 </html>
 */
});

var childLayout = multiline.stripIndent(function () {/*
 ---
 layout: parent
 ---
 <body class="post">
 {#content /}
 </body>
 */});

describe("Nested/child layouts", function () {

    beforeEach(function () {

        crossbow.clearCache();

        // Add layouts to cache
        crossbow.populateCache("_layouts/parent.html", parentLayout);
        crossbow.populateCache("_layouts/child.html", childLayout);
    });

    it("Uses nested layouts", function (done) {

        var post1 = multiline.stripIndent(function () {/*
         ---
         layout: child
         title: "Nested layout testing"
         ---

         {post.title}
         */});

        var post = crossbow.addPost("_posts/post2.md", post1, {});

        crossbow.compileOne(post, {siteConfig: {sitename: "({shakyShane})"}}, function (err, out) {
            var compiled = out.compiled;
            assert.include(compiled, "<head><title>Parent Layout</title></head>");
            assert.include(compiled, "<p>Nested layout testing</p>");
            done();
        });
    });
});
