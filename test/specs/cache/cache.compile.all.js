var _             = require("lodash");
var assert        = require("chai").assert;
var multiline     = require("multiline");

var crossbow  = require("../../../index");

var content1 = multiline.stripIndent(function(){/*
 ---
 layout: test
 title: "Blog 1"
 date: 2013-11-13
 categories: javascript, node js
 tags: code, jquery-ui, how to guide
 ---

 post1
 */});

var content2 = multiline.stripIndent(function(){/*
 ---
 layout: test
 title: "Blog 2"
 date: 2013-11-14
 ---

 post2
 */});

describe("Compiling everything in the cache", function(){
    beforeEach(function () {
        crossbow.clearCache();
    });
    it("should be able to compile all posts", function (done) {

        crossbow.populateCache("_layouts/test.html", "{#content /}");

        crossbow.addPost("_posts/1.md", content1);
        crossbow.addPost("_posts/2.md", content2);

        crossbow.compilePosts({}, function (err, out) {
            assert.equal(out.length, 2);
            done();
        });
    });
    it("should be able to compile every page", function (done) {

        crossbow.populateCache("_layouts/test.html", "{#content /}");

        crossbow.addPage("projects/index1.html", content1);
        crossbow.addPage("projects/index2.html", content2);

        crossbow.compilePages({}, function (err, out) {
            assert.equal(out.length, 2);
            done();
        });
    });
    it("should be able to compile everything", function (done) {

        crossbow.populateCache("_layouts/test.html", "{#content /}");

        crossbow.addPage("projects/index1.html", content1);
        crossbow.addPost("_posts/post1.md", content2);

        crossbow.compileAll({}, function (err, out) {
            assert.equal(out.length, 2);
            done();
        });
    });
    it("should be able to compile items manually", function (done) {

        crossbow.populateCache("_layouts/test.html", "{#content /}");

        crossbow.addPage("projects/index1.html", content1);
        crossbow.addPage("projects/index2.html", content2);

        crossbow.compileMany(crossbow.getCache().pages(), {}, function (err, out) {
            assert.equal(out.length, 2);
            done();
        });
    });
});