var _             = require("lodash");
var assert        = require("chai").assert;
var multiline     = require("multiline");

var Page  = require("../../lib/page");
var Cache = require("../../lib/cache");

var content1 = multiline.stripIndent(function(){/*

    Page content

 */});
var content2 = multiline.stripIndent(function(){/*

    Page 2

 */});

describe("Adding Pages to the Cache", function(){
    var _cache, page1, page2;
    beforeEach(function () {
        _cache    = new Cache();
        page1     = new Page("about-us.html", content1);
        page2     = new Page("projects.html", content2);
    });
    it("Should add an item", function(){
        var cache = _cache.addPage(page1);
        assert.equal(cache.pages().length, 1);
    });
    it("Should add Mulitple Items", function(){
        var cache = _cache.addPages([page1, page2]);
        assert.equal(cache.pages().length, 2);
    });
    it("Should not modify any data related to post", function(){

        var cache = _cache.addPage([page1, page2]);
        var pages = cache.pages();

        assert.isTrue(pages[0] instanceof Page);
        assert.isUndefined(pages[0].front.title);

        assert.isTrue(pages[1] instanceof Page);
        assert.isUndefined(pages[1].front.title);
    });
    it("Should find posts by key", function(){
        var page = _cache.addPages([page1, page2]).find("about-us.html");
        assert.isTrue(page instanceof Page);
    });
});