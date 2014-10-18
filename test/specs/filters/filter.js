var _             = require("lodash");
var assert        = require("chai").assert;
var multiline     = require("multiline");

var Post     = require("../../../lib/post");
var crossbow = require("../../../index");

describe("Yielding sections ", function(){

    beforeEach(function () {
        crossbow.clearCache();
    });

    it("allows sections with names:", function(done){

        var page1 = multiline.stripIndent(function(){/*
         ---
         layout: test
         title: "Homepage"
         ---

         This is how we roll.

         {#posts}
         {excerpt}
         {/posts}

         */});
        var post1 = multiline.stripIndent(function(){/*
         ---
         layout: test
         title: "About us"
         excerpt: This is the intro to this post
         ---

         This is how we roll.

         {page.title}

         */});

        crossbow.populateCache("_layouts/test.html", "{#content /}");

        var post = crossbow.addPost("_posts/about-us.md", post1);
        var page = crossbow.addPage("projects/about-us.html", page1);

        crossbow.compileOne(page, {}, function (err, out) {
            done();
        });
    });
});