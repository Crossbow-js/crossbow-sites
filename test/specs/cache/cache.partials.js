var _             = require("lodash");
var assert        = require("chai").assert;
var multiline     = require("multiline");
var sinon         = require("sinon");
var fs            = require("fs");

var Cache     = require("../../../lib/cache");
var crossbow  = require("../../../index");
var Partial   = require("../../../lib/partial");

describe("Adding Partials to the Cache", function(){
    var _cache;
    var config;
    beforeEach(function () {
        _cache    = new Cache();
        config = {
            config: {
                cwd: ""
            }
        };
    });
    it("Should add an item", function(){
        config.config.cwd = "test/fixtures";
        var partial = new Partial("test/fixtures/snippets/function.js", "content", config);
        var cache   = _cache.addPartial(partial);
        assert.equal(cache.partials().length, 1);
    });
    it("retrieve items from a given key", function(){

        var partial1 = new Partial("_snippets/function.js", "content", config);
        var partial2 = new Partial("_snippets/styles.css", "CSS content", config);

        var item     = _cache.addPartial([partial1, partial2]).find("styles");
        assert.equal(item.content, "CSS content");
    });
    it("adding to cache accessible to dust", function(done){

        var layout = multiline.stripIndent(function(){/*
         <!DOCTYPE html>
         <html>

         <body class="post">

         {{ inc src="_includes/date.html" }}

         {{ inc src="_includes/partials/footer.html" url="http://shakyshane.com" }}

         {{#posts}}
            {{ inc src="_includes/title.html" title=title }}
         {{/posts}}

         {{ content }}

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

         */});

        crossbow.populateCache("_layouts/post-test.html", layout);
        crossbow.populateCache("_includes/title.html", "<li>{{title}}</li>");
        crossbow.populateCache("_includes/title2.html", "<li>{{post}} - {{_post.title}}</li>");
        crossbow.populateCache("_includes/head.html", "<head><title>{{post.title}}</title></head>");
        crossbow.populateCache("_snippets/styles.css", ".shane { background: black }");
        crossbow.populateCache("_snippets/func.js", "var shane='kitten'");
        crossbow.populateCache("_includes/date.html", "<footer>Date: {{post.date}}</footer>");
        crossbow.populateCache("_includes/partials/footer.html", "<footer>Alternative links {{params.url}}</footer>");

        crossbow.addPost("_posts/post1.md", post1, {});
        crossbow.addPost("_posts/post2.md", post2, {});

        crossbow.compileOne("_posts/post2.md", {}, function (err, out) {
            if (err) {
                done(err);
            }
            var compiled = out.compiled;
            assert.include(compiled, "<footer>Date: April 10, 2014</footer>");
            assert.include(compiled, "<li>Homepage</li>");
            assert.include(compiled, "<li>Homepage 2</li>");
            assert.include(compiled, "<footer>Alternative links http://shakyshane.com</footer>");
            fsStub.restore();
            done();
        });
    });
    it("Can update partials in the cache", function(done){

        var page1 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Homepage"
         date: 2014-04-10
         ---

         {{ inc src="button.html" text="Sign up" }}

         */});

        crossbow.clearCache();

        crossbow.populateCache("_layouts/post-test.html", "{{content}}");

        var cache = crossbow.populateCache("button.html", "<button>{{text}}</button>");

        crossbow.addPage("projects/shane.html", page1, {});

        crossbow.compileOne("projects/shane.html", {}, function (err, out) {

            assert.include(out.compiled, "<button>Sign up</button>");

            crossbow.populateCache("button.html", "<button class=\"button\">{{text}}</button>");

            assert.equal(cache.partials().length, 2);

            crossbow.compileOne("projects/shane.html", {}, function (err, out) {
                assert.include(out.compiled, "<button class=\"button\">Sign up</button>");
                done();
            });
        });
    });
});