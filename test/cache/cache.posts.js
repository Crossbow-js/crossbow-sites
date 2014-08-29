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
    it("Should add an item", function(){
        var cache = _cache.addPost(post1);
        assert.equal(cache.posts().length, 1);
    });
    it("Should add Mulitple Items", function(){
        var cache = _cache.addPost([post1, post2]);
        assert.equal(cache.posts().length, 2);
    });
    it("Should not modify any data related to post", function(){

        var cache = _cache.addPost([post1, post2]);

        assert.isTrue(cache.posts()[0] instanceof Post);
        assert.equal(cache.posts()[0].front.title, "Blog 2");

        assert.isTrue(cache.posts()[1] instanceof Post);
        assert.equal(cache.posts()[1].front.title, "Blog 1");
    });
    it("Should find posts by key", function(){

        var post = _cache.addPost([post1, post2]).find("posts/post1.md");

        assert.isTrue(post instanceof Post);
        assert.equal(post.front.title, "Blog 1");
    });
    it("Should order posts by newest", function(){
        var cache = _cache.addPost([post1, post2]);
        assert.deepEqual(cache.posts()[0].front.title, "Blog 2");
    });
});