var _             = require("lodash");
var multiline     = require("multiline");
var assert        = require("chai").assert;
var dust          = require("dustjs-linkedin");
dust.cache        = {};
dust.isDebug = true;
dust.optimizers.format = function(ctx, node) { return node; };

var coderBlog = require("../../index");
//coderBlog.setLogLevel("debug");

var postLayout = multiline.stripIndent(function(){/*
 <!DOCTYPE html>
 <html>
 {>head /}
 <body class="post">
 {#content /}
 </body>
 </html>
 */});

describe("Ordering posts by date", function(){

    beforeEach(function () {

        coderBlog.clearCache();

        // Add layouts to cache
        coderBlog.populateCache("_layouts/post-test.html", postLayout);

        // Add HEAD section to cache
        coderBlog.populateCache("_includes/head.html", "<head><title>{page.title} {site.sitename}</title></head>");
    });

    it("Should have newest posts first", function(done) {

        var post1 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Post 1"
         date: 2013-11-13
         ---

         Post 1

         */});
        var post2 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Post 2"
         date: 2013-11-14
         ---

         Post 2

         */});
        var index = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Homepage"
         date: 2014-04-10
         ---

         #Welcome to my blog
         {#posts}
         [{title}](#)
         {/posts}

         */});

        coderBlog.addPost("_posts/post1.md", post1, {});
        coderBlog.addPost("_posts/post2.md", post2, {});

        // NO POSTS ADDED
        var page = coderBlog.addPage("index.html", index, {});

        coderBlog.compileOne(page, {}, function (err, out) {
            var posts = coderBlog.getCache().posts();
            assert.equal(posts[0].front.title, "Post 2");
            assert.equal(posts[1].front.title, "Post 1");
            done();
        });
    });
});