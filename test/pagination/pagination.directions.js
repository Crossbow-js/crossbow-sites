var _             = require("lodash");
var multiline     = require("multiline");
var sinon         = require("sinon");
var fs            = require("fs");
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

var pageLayout = multiline.stripIndent(function(){/*
 <!DOCTYPE html>
 <html>
 {#inc src="head.html" /}
 <body class="page">
 {#content /}
 </body>
 </html>
 */});

describe("Processing a Markdown file", function(){

    var fsStub;

    before(function () {
        fsStub = sinon.stub(fs, "readFileSync");
    });
    after(function () {
        fsStub.restore();
    });
    afterEach(function () {
        fsStub.reset();
    });

    beforeEach(function () {

        coderBlog.clearCache();

        // Add layouts to cache
        coderBlog.populateCache("_layouts/post-test.html", postLayout);

        // Add HEAD section to cache
        coderBlog.populateCache("_includes/head.html", "<head><title>{page.title} {site.sitename}</title></head>");
    });

    it("Can use site variables", function(done) {

        var post1 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Homepage"
         date: 2013-11-13
         ---


         */});
        var post2 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "About us"
         date: 2013-11-14
         ---

         Prev - {post.prev.url}

         Next - {post.next.url}


         */});
        var post3 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "About us"
         date: 2013-11-15
         ---

         Content

         */});

        coderBlog.addPost("_posts/post1.md", post1, {});
        coderBlog.addPost("_posts/post2.md", post2, {});
        coderBlog.addPost("_posts/post3.md", post3, {});

        coderBlog.compileOne("_posts/post2.md", {}, function (err, out) {
            var compiled = out.compiled;
            assert.include(compiled, "<p>Prev - /post1.html</p>");
            assert.include(compiled, "<p>Next - /post3.html</p>");
            done();
        });
    });
});