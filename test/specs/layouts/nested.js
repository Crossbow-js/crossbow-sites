var multiline = require("multiline");
var assert    = require("chai").assert;
var crossbow  = require("../../../index");

var parentLayout = multiline.stripIndent(function () {/*
<!DOCTYPE html>
<html>
<head><title>{{page.title}}</title></head>
{{ content }}
</html>
 */
});

var childLayout = multiline.stripIndent(function () {/*
---
layout: parent
---
<body class="post">{{ content }}</body>
 */});
var childLayout2 = multiline.stripIndent(function () {/*
---
layout: child
---
<section>{{ content }}</section>
 */});

describe("Nested/child layouts", function () {

    beforeEach(function () {

        crossbow.clearCache();

        // Add layouts to cache
        crossbow.populateCache("_layouts/parent.html", parentLayout);
        crossbow.populateCache("_layouts/child.html",  childLayout);
        crossbow.populateCache("_layouts/child2.html", childLayout2);
    });

    it("Can render with no layout", function (done) {

        var post1 = multiline.stripIndent(function () {/*
         {{site.sitename}}
         */});

        var post = crossbow.addPost("_posts/post2.md", post1, {});

        crossbow.compileOne(post, {siteConfig: {sitename: "({shakyShane})"}}, function (err, out) {
            var compiled = out.compiled;
            assert.include(compiled, "({shakyShane})");
            done();
        });
    });
    it("Can render using a default layout in config", function (done) {

        var post1 = multiline.stripIndent(function () {/*
         {{site.sitename}}
         */});

        var post = crossbow.addPost("_posts/post2.md", post1, {});

        crossbow.populateCache("_layouts/shane.html", ":::{{ content }}");

        var config = {
            defaultLayout: "shane.html",
            siteConfig: {
                sitename: "({shakyShane})"
            }
        };

        crossbow.compileOne(post, config, function (err, out) {
            var compiled = out.compiled;
            assert.include(compiled, ":::<p>({shakyShane})</p>");
            done();
        });
    });
    it("Uses nested layouts 2", function (done) {

        var post1 = multiline.stripIndent(function () {/*
         ---
         layout: child
         title: "Nested layout testing"
         ---

         {{post.title}}
         */});

        var post = crossbow.addPost("_posts/post2.md", post1, {});

        crossbow.compileOne(post, {siteConfig: {sitename: "({shakyShane})"}}, function (err, out) {
            var compiled = out.compiled;
            assert.include(compiled, "<head><title>Nested layout testing</title></head>");
            assert.include(compiled, "<p>Nested layout testing</p>");
            done();
        });
    });
    it("Uses nested layouts 3", function (done) {

        var post1 = multiline.stripIndent(function () {/*
         ---
         layout: child2
         title: "Nested layout testing"
         ---

         {{post.title}}
         */});

        var post = crossbow.addPost("_posts/post2.md", post1, {});

        crossbow.compileOne(post, {siteConfig: {sitename: "({shakyShane})"}}, function (err, out) {
            var compiled = out.compiled;
            assert.include(compiled, "<head><title>Nested layout testing</title></head>");
            assert.include(compiled, "<p>Nested layout testing</p>");
            done();
        });
    });
});
