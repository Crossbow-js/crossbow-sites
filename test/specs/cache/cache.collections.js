var _             = require("lodash");
var assert        = require("chai").assert;
var multiline     = require("multiline");

var Post  = require("../../lib/post");
var Cache = require("../../lib/cache");

var content1 = multiline.stripIndent(function(){/*
 ---
 layout: post-test
 title: "Blog 1"
 date: 2013-11-13
 categories: javascript, node js
 tags: code, jquery-ui, how to guide
 ---

 post1
 */});

var content2 = multiline.stripIndent(function(){/*
 ---
 layout: featured
 title: "Blog 2"
 date: 2013-11-14
 ---

 post2
 */});

describe("Adding Posts to the Cache", function(){
    var _cache, post1, post2;

    beforeEach(function () {
        _cache    = new Cache();
        post1     = new Post("_posts/post1.md", content1);
        post2     = new Post("_posts/post2.md", content2);
    });

    it("Should not modify any data related to post", function(){

        var cache = _cache.addPost([post1, post2]);

        var collection = _cache.getCollection("posts");

        assert.isTrue(collection[0] instanceof Post);
        assert.equal(collection[0].front.title, "Blog 2");

        assert.isTrue(collection[1] instanceof Post);
        assert.equal(collection[1].front.title, "Blog 1");
    });
});