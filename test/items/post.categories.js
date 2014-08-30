var _             = require("lodash");
var assert        = require("chai").assert;
var multiline     = require("multiline");

var Post     = require("../../lib/post");
var crossbow = require("../../index");

var post1 = multiline.stripIndent(function(){/*
---
layout: post-test
title: "Post 1"
date: 2014-01-01
categories: javascript
---

{#post.related}
{title}
{/post.related}
 */});
var post2 = multiline.stripIndent(function(){/*
---
layout: post-test
title: "Post 2"
date: 2014-01-01
categories: javascript
---

Post 2

{post.title}
 */});

describe("Creating a Post that knows about others in the same category", function(){

    beforeEach(function () {
        crossbow.clearCache();
        crossbow.populateCache("_layouts/post-test.html", "{#content /}");
    });

    it("uses the filename as title if no title available in front-matter (e2e)", function() {


        var postItem  = crossbow.addPost("_posts/post1.md", post1);
        var postItem2 = crossbow.addPost("_posts/post2.md", post2);

        crossbow.compileOne(postItem, {}, function (err, out) {
            assert.include(out.compiled, "<p>Post 2</p>");
            assert.notInclude(out.compiled, "<p>Post 1</p>");
        });
    });
});