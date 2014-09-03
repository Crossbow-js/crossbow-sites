var _             = require("lodash");
var multiline     = require("multiline");
var assert        = require("chai").assert;
var dust          = require("dustjs-linkedin");
dust.cache        = {};
dust.isDebug = true;
dust.optimizers.format = function(ctx, node) { return node; };

var crossbow = require("../../index");

describe("Posts variable available to all pages/posts", function(){

    beforeEach(function () {
        crossbow.clearCache();
        crossbow.populateCache("_layouts/test.html", "{#content /}");
    });
    it("Knows about posts and pages (when they are added)", function(done) {

        var post1 = multiline.stripIndent(function(){/*
         ---
         layout: test
         title: "Blogging is cool"
         date: 2013-11-14
         ---

         #{page.title}
         */});
        var post2 = multiline.stripIndent(function(){/*
         ---
         layout: test
         title: "Blogging is really cool"
         date: 2013-11-15
         ---

         #{page.title}
         */});

        var index = multiline.stripIndent(function(){/*
         ---
         layout: test
         title: "Homepage"
         date: 2014-04-10
         ---

         #Welcome to my blog

         {#posts}
         {title}
         {/posts}
         */});


        crossbow.addPost("_posts/post1.html", post1, {});
        crossbow.addPost("_posts/post2.html", post2, {});

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {}, function (err, out) {

            var compiled = out.compiled;

            assert.include(compiled, "Welcome to my blog");
            assert.include(compiled, "Blogging is cool");
            assert.include(compiled, "Blogging is really cool");

            done();
        });
    });
});
