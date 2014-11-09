var _             = require("lodash");
var assert        = require("chai").assert;
var multiline     = require("multiline");

var Post     = require("../../../lib/post");
var crossbow = require("../../../index");

var post1 = multiline.stripIndent(function(){/*
---
layout: post-test
date: 2013-11-13
---

{{post.title}}
 */});

describe("Creating a Post title from the filename", function(){

    beforeEach(function () {
        crossbow.clearCache();
        crossbow.populateCache("_layouts/post-test.html", "{{ content }}");
    });

    it("uses the filename as title if no title available in front-matter", function() {

        var postItem = new Post("posts/2013-11-13-this-post-is-great.md", post1, {
            postUrlFormat: "/blog/:month/:title"
        });

        assert.deepEqual(postItem.front.title, "This Post Is Great");
    });

    it("uses the filename as title if no title available in front-matter (e2e)", function() {

        var post = crossbow.addPost("posts/2013-11-13-this-post-is-great.md", post1, {
            postUrlFormat: "/blog/:month/:title"
        });

        crossbow.compileOne(post, {}, function (err, out) {
            assert.include(out.compiled, "<p>This Post Is Great</p>");
        });
    });
});