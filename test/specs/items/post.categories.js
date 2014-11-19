var _             = require("lodash");
var assert        = require("chai").assert;
var multiline     = require("multiline");

var Post     = require("../../../lib/post");
var crossbow = require("../../../index");

var post1 = multiline.stripIndent(function(){/*
---
layout: post-test
title: "Post 1"
date: 2014-01-01
categories: javascript, node-js
---

{{#post.related}}
{{title}}
{{/post.related}}

{{#post.categories}}{{this.name}}{{$sep ","}}{{/post.categories}}

 */});
var post1_alt = multiline.stripIndent(function(){/*
---
layout: post-test
title: "Post 1"
date: 2014-01-01
categories: javascript
---

{{#post.related}}
{{title}}
{{/post.related}}

{{#post.categories}}{{this.name}}{{$sep ","}}{{/post.categories}}

 */});
var post2 = multiline.stripIndent(function(){/*
---
layout: post-test
title: "Post 2"
date: 2014-01-01
categories: javascript, node-js
---

Post 2

{{post.title}}
 */});

describe("Creating a Post that knows about others in the same category", function(){

    beforeEach(function () {
        crossbow.clearCache();
        crossbow.populateCache("_layouts/post-test.html", "{{ content }}");
    });
    it.skip("can list the categories with separator", function(done) {


        var postItem  = crossbow.addPost("_posts/post1.md", post1);
        var postItem2 = crossbow.addPost("_posts/post2.md", post2);

        crossbow.compileOne(postItem, {}, function (err, out) {
            if (err) {
                done(err);
            }
            //require("d-logger")(out.compiled);
            assert.include(out.compiled, "<p>Post 2</p>");
            assert.include(out.compiled, "<p>javascript,node-js</p>");
            //assert.notInclude(out.compiled, "<p>Post 2</p>\n<p>Post 2</p>");
            done();
        });
    });
    it.skip("can re-render category list when it's updated", function(done) {

        var postItem  = crossbow.addPost("_posts/post1.md", post1);
        var postItem2 = crossbow.addPost("_posts/post2.md", post2);

        crossbow.compileOne(postItem, {siteConfig: {categories: ["js", "ruby"]} }, function (err, out) {

             crossbow.addPost("_posts/post1.md", post1_alt);

             crossbow.compileOne("_posts/post1.md", {}, function (err, out) {
                 if (err) {
                     done(err);
                 }
                 assert.include(out.compiled, "<p>javascript</p>");
                 done();
             });
        });
    });
});