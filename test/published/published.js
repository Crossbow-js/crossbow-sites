var _             = require("lodash");
var multiline     = require("multiline");
var assert        = require("chai").assert;
var dust          = require("dustjs-linkedin");
dust.cache        = {};
dust.isDebug = true;
dust.optimizers.format = function(ctx, node) { return node; };

var crossbow = require("../../index");

describe("Filtering published", function(){

    beforeEach(function () {
        crossbow.clearCache();
    });

    it("Does not show any items with published:false in front matter", function() {
        var post = multiline.stripIndent(function(){/*
         ---
         layout: test
         title: "Homepage"
         published: false
         ---

         #{page.title}

         */});
        crossbow.addPost("_posts/post1.md", post);

        var actual = crossbow.getCache().posts().length;
        assert.equal(actual, 0);
    });
    it("Does not add any items starting with an underscore", function() {
        var post = multiline.stripIndent(function(){/*
         ---
         layout: test
         title: "Homepage"
         ---

         #{page.title}

         */});
        crossbow.addPost("_posts/_post1.md", post);

        var actual = crossbow.getCache().posts().length;
        assert.equal(actual, 0);
    });
    it("Does not add any items from _drafts dir", function() {
        var post = multiline.stripIndent(function(){/*
         ---
         layout: test
         title: "Homepage"
         ---

         #{page.title}

         */});

        crossbow.addPost("_drafts/post1.md", post);

        var actual = crossbow.getCache().posts().length;
        assert.equal(actual, 0);
    });
});