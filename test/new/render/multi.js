var _         = require("lodash");
var assert    = require("chai").assert;
var multiline = require("multiline");
var sinon     = require("sinon");
var fs        = require("fs");
var crossbow  = require("../../../index");

describe("Multi page mode", function() {

    it("Can render with knowledge of other pages", function(done) {

        var site = crossbow.builder();

        var page1 = site.addPage("index.html", "{{page.data.kittie}} {{pages.length}}");
        var page2 = site.addPage("about.html", "Hello from about page");

        site.compile({
            item: page1,
            data: {
                kittie: "Hello from the homepage"
            },
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.include(out.compiled, "Hello from the homepage 2");
                done();
            }
        });
    });
    it("Can render with knowledge of other posts", function(done) {

        var site = crossbow.builder();

        var post1 = site.addPost("blog/js/hello.md", "---\ntitle: nodejs\n---\n#{{post.title}}\nPost count: {{posts.length}}");
        var post2 = site.addPost("blog/js/hello2.md", "Hi there");
        var post3 = site.addPost("blog/js/hello3.md", "Hi there");
        var post4 = site.addPost("blog/js/hello4.md", "Hi there");

        site.compile({
            item: post1,
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.include(out.compiled, "<h1 id=\"nodejs\">nodejs</h1>");
                assert.include(out.compiled, "<p>Post count: 4</p>");
                done();
            }
        });
    });
});