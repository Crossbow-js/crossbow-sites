var _             = require("lodash");
var multiline     = require("multiline");
var assert        = require("chai").assert;

var crossbow = require("../../../index");

var postLayout = multiline.stripIndent(function(){/*
<!DOCTYPE html>
<html>
{>head /}
<body class="post">
{#content /}
</body>
</html>
*/});

var pageLayout = multiline.stripIndent(function(){/*
<!DOCTYPE html>
<html>
{#inc src="head.html" /}
<body class="page">
{#content /}
</body>
</html>
*/});

var post1 = multiline.stripIndent(function(){/*
---
layout: post-test
title: "Function Composition in Javascript."
date: 2013-11-13 20:51:39
---

Hi there {page.title}

*/});

describe("Processing a file", function(){

    beforeEach(function () {
        crossbow.clearCache();

        // Add layouts to cache
        crossbow.populateCache("_layouts/post-test.html", postLayout);
        crossbow.populateCache("_layouts/page-test.html", pageLayout);

        // Add HEAD section to cache
        crossbow.populateCache("head.html", "<head><title>{page.title} {site.sitename}</title></head>");
    });

    it("Knows about posts", function(done) {

        var index = multiline.stripIndent(function(){/*
         ---
         layout: page-test
         title: "Homepage"
         date: 2014-04-10
         ---

         {#posts}
         {title} - {url}
         {/posts}

         */});


        // NO POSTS ADDED
        crossbow.addPost("posts/blog1.md", post1);
        var page = crossbow.addPage("index.html", index);
        crossbow.compileOne(page, {}, function (err, out) {
            var compiled = out.compiled;
            assert.include(compiled, "Function Composition in Javascript. - /blog1.html");
            done();
        });
    });
});