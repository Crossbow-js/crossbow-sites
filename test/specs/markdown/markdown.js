var _ = require("lodash");
var multiline = require("multiline");
var sinon = require("sinon");
var fs = require("fs");
var assert = require("chai").assert;

var crossbow = require("../../../index");

var postLayout = multiline(function () {/*
<!DOCTYPE html>
<html>
<body class="post">
{{ content }}
</body>
</html>
*/});

var pageLayout = multiline(function () {/*
<!DOCTYPE html>
<html>
{{ inc src="head.html" }}
<body class="page">
{{ content }}
</body>
</html>
*/});

var post1 = multiline(function () {/*
---
layout: post-test
title: "Function Composition in Javascript."
date: 2013-11-13 20:51:39
---

Hi there {{page.title}}

 */
});

describe("Processing a Markdown file", function () {

    var fsStub, existsStub;
    before(function () {
        fsStub = sinon.stub(fs, "readFileSync");
        existsStub = sinon.stub(fs, "existsSync").returns(true);
    });
    after(function () {
        fs.readFileSync.restore();
        fs.existsSync.restore();
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
        crossbow.populateCache("head.html", "<head><title>{{page.title}} {{site.sitename}}</title></head>");
    });

    it("Does not use markdown + still have vars", function (done) {

        var index = multiline.stripIndent(function () {/*
         ---
         layout: page-test
         title: "Homepage"
         date: 2014-04-10
         ---

         #Welcome to my blog. {{#if posts}}I have written before..{{/if}}
         */
        });


        // NO POSTS ADDED
        crossbow.addPage("index.html", index);
        crossbow.compileOne("index.html", {}, function (err, out) {

            var compiled = out.compiled;
            assert.include(compiled, "#Welcome to my blog.");
            assert.notInclude(compiled, "I have written before..");
            done();
        });
    });

    it("Can use site variables + Inline code snippets that have braces", function (done) {

        var index = multiline.stripIndent(function () {/*
         ---
         layout: post-test
         title: "Homepage"
         randomVar: "Kittenz"
         date: 2014-04-10
         ---

         #{{page.title}} {{#if posts}}I have written before..{{/if}}

         ```css
         @mixin inline-block(){
         display: inline-block;
         zoom: 1;
         *display: inline;
         }
         ```

         {{post.randomVar}}

         */
        });


        // NO POSTS ADDED
        crossbow.addPost("_posts/post1.md", index);
        crossbow.compileOne("_posts/post1.md", {}, function (err, out) {
            if (err) {
                done(err);
            }
            assert.include(out.compiled, "<p>Kittenz</p>");
            done();
        });
    });
    it("Can use site variables + Inline code snippets that have braces (2)", function (done) {

        var index = multiline.stripIndent(function () {/*
         ---
         layout: post-test
         title: "Homepage"
         randomVar: "Kittenz"
         date: 2014-04-10
         ---

         `var shane = function(){ return; } `

         */
        });


        // NO POSTS ADDED
        var page = crossbow.addPage("index.html", index);
        crossbow.compileOne(page, {}, function (err, out) {
            var compiled = out.compiled;
            assert.include(compiled, "var shane = function(){ return; }");
            done();
        });
    });
    it("Can use site variables + external snippets", function (done) {

        fsStub.returns("var shane = function(){};");

        var index = multiline.stripIndent(function () {/*
         ---
         layout: post-test
         title: "Homepage"
         randomVar: "Kittenz"
         lang: "js"
         date: 2014-04-10
         ---

         {{ hl src="function.js" lang=page.lang }}

         */
        });


        // NO POSTS ADDED
        crossbow.addPost("_posts/index.markdown", index);
        crossbow.compileOne("_posts/index.markdown", {}, function (err, out) {
            if (err) {
                done(err);
            }
            var compiled = out.compiled;
            assert.include(compiled, "<code class=\"js\">");
            done();
        });
    });
    it("Can use site variables + external snippets", function (done) {

        var index = multiline.stripIndent(function () {/*
         ---
         layout: post-test
         title: "Homepage"
         randomVar: "Kittenz"
         lang: "js"
         date: 2014-04-10
         ---

         Page Title: {{post.title}}

         ```css
         .box {
         display: inline-block;
         zoom: 1;
         *display: inline;
         }
         ```

         `.box { @include inline-block(); }`

         ```js
         @mixin inline-block() {

         display: inline-block;
         zoom: 1;
         *display: inline;
         }

         .box {
         @include inline-block();
         }
         .box2 {
         @include inline-block();
         }
         ```
         */
        });


        // NO POSTS ADDED
        crossbow.addPage("index.html", index);
        crossbow.compileOne("index.html", {}, function (err, out) {
            assert.include(out.compiled, "Page Title: Homepage");
            done();
        }); // Good if no error thrown
    });
    it("Does not auto-highlight code fences when no language given", function (done) {

        crossbow.clearCache();

        var index = multiline.stripIndent(function () {/*
         ---
         title: "Homepage"
         ---

         ```
         var snippet = "false";
         ```

         */
        });


        // NO POSTS ADDED
        crossbow.addPost("_posts/post1.md", index);
        crossbow.compileOne("_posts/post1.md", {siteConfig: {defaultLayout: null}, highlight: true}, function (err, out) {
            assert.notInclude(out.compiled, "<span class=\"hljs-keyword\">");
            assert.include(out.compiled, "<pre><code>var snippet = &quot;false&quot;;");
            done();
        }); // Good if no error thrown
    });
    it("Does not auto-highlight indented code-blocks", function (done) {

        crossbow.clearCache();

        var index = multiline(function () {/*
---
title: "Homepage"
---
    var snippet = "false";
         */
        });


        // NO POSTS ADDED
        crossbow.addPost("_posts/post1.md", index);
        crossbow.compileOne("_posts/post1.md", {siteConfig: {defaultLayout: null}, highlight: true}, function (err, out) {
            assert.notInclude(out.compiled, "<span class=\"hljs-keyword\">");
            assert.include(out.compiled, "<pre><code>var snippet = &quot;false&quot;;");
            done();
        }); // Good if no error thrown
    });
    it("Can render any content as markdown if `markdown: true` given in header.", function (done) {

        var index = multiline.stripIndent(function () {/*
         ---
         layout: test
         title: "Homepage"
         markdown: "true"
         ---

         #{{page.title}}

         */
        });


        // NO POSTS ADDED
        crossbow.populateCache("_layouts/test.html", "<body>{{ content }}</body>");
        crossbow.addPage("docs/layouts.html", index);
        crossbow.compileOne("docs/layouts.html", {}, function (err, out) {
            assert.include(out.compiled, "<h1 id=\"homepage\">Homepage</h1>");
            done();
        }); // Good if no error thrown
    });
    it("Can render any file with .md or .markdown extension", function (done) {

        var index = multiline.stripIndent(function () {/*
         ---
         layout: test
         title: "Homepage"
         ---

         #{{page.title}}

         */
        });


        // NO POSTS ADDED
        crossbow.populateCache("_layouts/test.html", "<body>{{ content }}</body>");
        crossbow.addPage("docs/layouts.md", index);
        crossbow.compileOne("docs/layouts.md", {}, function (err, out) {
            assert.equal(out.filePath, "docs/layouts.html");
            assert.equal(out.url, "/docs/layouts.html");
            assert.include(out.compiled, "<h1 id=\"homepage\">Homepage</h1>");
            done();
        }); // Good if no error thrown
    });
    it("Can render any file with index.md or index.markdown extension + Pretty urls", function (done) {

        var index = multiline.stripIndent(function () {/*
         ---
         layout: test
         title: "Homepage"
         ---

         #{{page.title}}

         */
        });


        // NO POSTS ADDED
        crossbow.populateCache("_layouts/test.html", "<body>{{ content }}</body>");
        crossbow.addPage("docs/index.md", index, {prettyUrls: true});
        crossbow.compileOne("docs/index.md", {}, function (err, out) {

            assert.equal(out.filePath, "docs/index.html");
            assert.equal(out.url, "/docs");
            done();
        }); // Good if no error thrown
    });
});