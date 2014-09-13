var _             = require("lodash");
var multiline     = require("multiline");
var sinon         = require("sinon");
var fs            = require("fs");
var assert        = require("chai").assert;
var dust          = require("dustjs-linkedin");
dust.cache        = {};
dust.isDebug = true;
dust.optimizers.format = function(ctx, node) { return node; };

var crossbow = require("../../index");
//crossbow.setLogLevel("debug");

var defaultLayout = multiline.stripIndent(function(){/*
<!DOCTYPE html>
<html>
{>head /}
<body>
{#content /}
</body>
</html>
*/});

var postLayout = multiline.stripIndent(function(){/*
<!DOCTYPE html>
<html>
{>head /}
<body class="post">
{#content /}
</body>
</html>
*/});

describe("Creating a pagination index", function(){

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

        crossbow.clearCache();

        // Add layouts to cache
        crossbow.populateCache("_layouts/post-test.html", postLayout);
        crossbow.populateCache("_layouts/default.html", defaultLayout);

        // Add HEAD section to cache
        crossbow.populateCache("_includes/head.html", "<head><title>{page.title} {site.sitename}</title></head>");
    });

    it("Can use site variables", function(done) {

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
        var post3 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Post 3"
         date: 2013-11-15
         ---

         Post 3

         */});
        var post4 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Post 4"
         date: 2013-11-16
         ---

         Post 4

         */});
        var post5 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Post 5"
         date: 2013-11-17
         ---

         Post 5

         */});
        var post6 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Post 6"
         date: 2013-11-18
         ---

         Post 6

         */});

        var page1 = multiline.stripIndent(function(){/*
         ---
         layout: default
         title: "Blog posts"
         paginate: posts:2
         ---

         Number of posts: {posts.length}

         Per Page: {paged.perPage}

         This URL:

         {#paged.items}
         {title}{~n}
         {/paged.items}

         {#paged.next}
         NEXT: {url} - {title}
         {/paged.next}

         {#paged.prev}
         PREV: {url} - {title}
         {/paged.prev}

         {site.site-name}

         */});

        crossbow.addPost("_posts/post1.md", post1, {});
        crossbow.addPost("_posts/post2.md", post2, {});
        crossbow.addPost("_posts/post3.md", post3, {});
        crossbow.addPost("_posts/post4.md", post4, {});
        crossbow.addPost("_posts/post5.md", post5, {});
        crossbow.addPost("_posts/post6.md", post6, {});

        var page = crossbow.addPage("blog/posts/index.html", page1, {prettyUrls: true});

        crossbow.compileOne(page, {siteConfig: {"site-name": "shane - test"}}, function (err, out) {

            assert.equal(out[0].url, "/blog/posts");

            assert.include(out[0].title, "Blog posts");
            assert.include(out[0].compiled, "shane - test");

            assert.include(out[0].compiled, "Per Page: 2");

            assert.include(out[0].compiled, "Post 6");
            assert.include(out[0].compiled, "Post 5");
            assert.include(out[0].compiled, "Number of posts: 6");

            assert.include(out[1].compiled, "Post 4");
            assert.include(out[1].compiled, "Post 3");
            assert.equal(out[1].url, "/blog/posts/page2");

            assert.include(out[2].compiled, "Post 2");
            assert.include(out[2].compiled, "Post 1");
            assert.equal(out[2].url, "/blog/posts/page3");

            done();
        });
    });
});