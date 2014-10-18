var multiline = require("multiline");
var assert    = require("chai").assert;
var crossbow  = require("../../../index");

describe("When handling YAML front-matter errors", function () {

    beforeEach(function () {
        crossbow.clearCache();
    });

    it("Does not Crash the process when yaml is malformed", function (done) {

        var post1 = multiline.stripIndent(function () {/*
         ---
         layout: default2.html
         title "This is the page title"
         ---
         <p>Ha ha ha</p>
         */});

        var post = crossbow.addPost("_posts/post1.md", post1, {});

        crossbow.compileOne(post, {siteConfig: {}}, function (err, out) {
            var compiled = out.compiled;
            assert.include(compiled, "<p>Ha ha ha</p>");
            done();
        });
    });
});
