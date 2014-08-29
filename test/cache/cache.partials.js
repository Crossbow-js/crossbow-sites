var _             = require("lodash");
var assert        = require("chai").assert;
var multiline     = require("multiline");
var sinon         = require("sinon");
var fs            = require("fs");

var Cache     = require("../../lib/cache");
var coderBlog = require("../../index");
var Partial   = require("../../lib/partial");

describe("Adding Partials to the Cache", function(){
    var _cache;
    beforeEach(function () {
        _cache    = new Cache();
    });
    it("Should add an item", function(){
        var partial = new Partial("_snippets/function.js", "content");
        var cache   = _cache.addPartial(partial);
        assert.equal(cache.partials().length, 1);
    });
    it("retrieve items from a given key", function(){

        var partial1 = new Partial("_snippets/function.js", "content");
        var partial2 = new Partial("_snippets/styles.css", "CSS content");

        var item     = _cache.addPartial([partial1, partial2]).find("styles");
        assert.equal(item.content, "CSS content");
    });
    it("adding to cache accessible to dust", function(done){

        var layout = multiline.stripIndent(function(){/*
         <!DOCTYPE html>
         <html>
         {>head /}
         <body class="post">

         {#inc src="date" /}

         {#inc src="partials/footer.html" url="http://shakyshane.com" /}

         {#posts}
            {#inc src="title" title=title /}
         {/posts}

         {#inc src="title2" title=title post="Clashing namespace" /}

         {#content /}

         </body>
         </html>
         */});

        var fsStub = sinon.stub(fs, "readFileSync").returns(layout);

        var post1 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Homepage"
         date: 2014-04-10
         ---

         Content

         */});

        var post2 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Homepage 2"
         date: 2014-04-10
         ---

         Content

         {#snippet src="styles.css" lang="scss" /}
         {#snippet src="func.js" /}

         */});

        coderBlog.populateCache("_layouts/post-test.html", layout);
        coderBlog.populateCache("_includes/title.html", "<li>{title}</li>");
        coderBlog.populateCache("_includes/title2.html", "<li>{post} - {_post.title}</li>");
        coderBlog.populateCache("_includes/head.html", "<head><title>{post.title}</title></head>");
        coderBlog.populateCache("_snippets/styles.css", ".shane { background: black }");
        coderBlog.populateCache("_snippets/func.js", "var shane='kitten'");
        coderBlog.populateCache("_includes/date.html", "<footer>Date: {post.date}</footer>");
        coderBlog.populateCache("_includes/partials/footer.html", "<footer>Alternative links {params.url}</footer>");

        coderBlog.addPost("_posts/post1.md", post1, {});
        coderBlog.addPost("_posts/post2.md", post2, {});

        coderBlog.compileOne("posts/post2.md", {}, function (err, out) {
            var compiled = out.compiled;
            assert.include(compiled, "<head><title>Homepage 2</title></head>");
            assert.include(compiled, "<footer>Date: April 10, 2014</footer>");
            assert.include(compiled, "<li>Homepage</li>");
            assert.include(compiled, "<li>Homepage 2</li>");
            assert.include(compiled, "<footer>Alternative links http://shakyshane.com</footer>");
            fsStub.restore();
            done();
        });

    });
});