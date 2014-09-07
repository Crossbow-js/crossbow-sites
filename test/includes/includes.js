var _             = require("lodash");
var multiline     = require("multiline");
var fs            = require("fs");
var sinon         = require("sinon");
var assert        = require("chai").assert;
var crossbow = require("../../index");

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

    var fsStub, existsStub;
    before(function () {
        fsStub     = sinon.stub(fs, "readFileSync");
        existsStub = sinon.stub(fs, "existsSync");
    });
    after(function () {
        fsStub.restore();
        existsStub.restore();
    });
    afterEach(function () {
        fsStub.reset();
        existsStub.reset();
    });
    beforeEach(function () {

        crossbow.clearCache();

        // Add layouts to cache
        crossbow.populateCache("_layouts/post-test.html", postLayout);
        crossbow.populateCache("_layouts/page-test.html", pageLayout);

        // Add HEAD section to cache
        crossbow.populateCache("_includes/head.html", "<head><title>{page.title} {site.sitename}</title></head>");
    });

    it("Can do simple includes", function(done) {

        var index = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Blogging is coolio"
         date: 2013-11-13 20:51:39
         ---

         {#inc src="button.tmpl.html" /}

         */});

        // NO POSTS ADDED
        crossbow.populateCache("/_includes/button.tmpl.html", "<button>Sign Up</button>");

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {}, function (err, out) {
            var compiled = out.compiled;
            assert.include(compiled, "<button>Sign Up</button>");
            done();
        });
    });

    it("Setting short keys for includes in cache", function(done) {

        var index = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Blogging is coolio"
         date: 2013-11-13 20:51:39
         ---

         {>"includes/button.tmpl.html" /}

         */});

        // NO POSTS ADDED
        crossbow.populateCache("/_includes/button.tmpl.html", "<button>Sign Up</button>");

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {}, function (err, out) {
            var compiled = out.compiled;
            assert.include(compiled, "<button>Sign Up</button>");
            done();
        });
    });
    it("Setting PARTIAL short keys for includes in cache", function(done) {

        var post2 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Blogging is coolio"
         date: 2013-11-13 20:51:39
         ---

         {>button /}

         */});

        // NO POSTS ADDED
        crossbow.populateCache("user/whatever/_includes/button.html", "<button>Sign up</button>");
        crossbow.addPage("werg/wergwerg/wergwergw/werg/_posts/post1.md", post2, {});
        crossbow.compileOne("posts/post1.md", {}, function (err, out) {
            assert.include(out.compiled, "<button>Sign up</button>");
            done();
        });
    });

    it("Setting short keys, but still allow paths for includes in cache", function(done) {

        var post2 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Blog Title"
         date: 2013-11-13 20:51:39
         ---

         {#inc src="button.html" /}

         */});

        // NO POSTS ADDED
        var post = crossbow.addPage("wef/_posts/post2.md", post2, {});
        crossbow.populateCache("some/Random/path/_includes/button.html", "<button>Sign Up</button>");
        crossbow.compileOne(post, {}, function (err, out) {
            assert.include(out.compiled, "<button>Sign Up</button>");
            done();
        });
    });

    it("Allows access to include params via 'params' namespace to deal with any conflicts", function(done) {

        var post2 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Blogging is coolio"
         date: 2013-11-13 20:51:39
         ---

         {#inc src="button.tmpl.html" text="Sign Up" /}

         {site.title}

         */});

        // NO POSTS ADDED
        crossbow.populateCache("_includes/button.tmpl.html", "<button>{params.text}</button>", "partials");
        crossbow.addPage("_posts/post2.md", post2, {});
        crossbow.compileOne("posts/post2.md", {siteConfig: {title: "Blog Name"}}, function (err, out) {
            var compiled = out.compiled;
            assert.include(compiled, "<button>Sign Up</button>");
            assert.include(compiled, "Blog Name");
            done();
        });
    });
    it("Allows includes that are not in the cache", function(done) {

        existsStub.returns(true);
        fsStub.returns("<p>crossbow.js is awesome</p>");

        var post2 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Blogging is coolio"
         date: 2013-11-13 20:51:39
         ---

         {#inc src="includes/snippet.html" /}

         */});

        // NO POSTS ADDED
        crossbow.addPost("_posts/post2.md", post2, {});
        crossbow.compileOne("_posts/post2.md", {siteConfig: {sitename: "(shakyShane)"}}, function (err, out) {
            sinon.assert.calledOnce(fsStub);
            assert.include(out.compiled, "<p>crossbow.js is awesome</p>");
            done();
        });
    });

    it("Allows highlighting", function(done) {

        var post2 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Blogging is coolio"
         date: 2013-11-13 20:51:39
         ---

         ```js
         var shane;
         ```

         */});

        // NO POSTS ADDED
        crossbow.addPost("_posts/post2.md", post2, {});
        crossbow.compileOne("_posts/post2.md", {siteConfig: {sitename: "(shakyShane)"}}, function (err, out) {
            assert.include(out.compiled, "<span class=\"hljs-keyword\">var</span>");
            done();
        });
    });
    it("Allows highlighting via a helper", function(done) {

        existsStub.returns(true);
        fsStub.returns("<button class=\"button button--{type}\">{params.text}</button>");

        var post2 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Highlight Helper"
         date: 2013-11-13 20:51:39
         ---

         {page.title}

         {#inc src="button" type="primary" text="Sign up"/}

         {#snippet src="function2.js" name="shane"/}

         {post.date}

         */});
        var post3 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Highlight Helper"
         date: 2013-11-14 20:51:39
         ---

         {page.title}

         {#inc src="button" type="primary" text="Sign up"/}

         {#snippet src="snippets/function2.js" name="shane"/}

         {post.date}

         */});

        crossbow.populateCache("_snippets/function2.js", "var name = \"shane\"");

        var post = crossbow.addPost("_posts/post2.md", post2, {});
        crossbow.addPost("_posts/post21.md", post3, {});

        crossbow.compileOne(post, {siteConfig: {sitename: "(shakyShane)"}}, function (err, out) {
            var compiled = out.compiled;
            sinon.assert.calledOnce(fsStub);
            assert.include(compiled, "<button class=\"button button--primary\">Sign up</button>");
            assert.include(compiled, "<code class=\"lang-js\"><span class=\"hljs-keyword\">var</span> name = <span class=\"hljs-string\">\"shane\"</span>");
            done();
        });
    });
});