var multiline = require("multiline");
var assert    = require("chai").assert;
var crossbow  = require("../../../index");

describe("Nested/child layouts", function () {

    beforeEach(function () {
        crossbow.clearCache();
    });

    it("Can use a html file for layout", function (done) {

        crossbow.populateCache("_layouts/parent.html", "Layout: {{content}}");
        var post1 = multiline.stripIndent(function () {/*
        ---
        layout: parent
        ---
        {{site.sitename}}
         */});

        var post = crossbow.addPost("_posts/post1.md", post1, {});

        crossbow.compileOne(post, {siteConfig: {sitename: "({shakyShane})"}}, function (err, out) {
            var compiled = out.compiled;
            require("d-logger")(out.compiled);
            assert.include(compiled, "Layout: <p>({shakyShane})</p>");
            done();
        });
    });
    it("Can use any file for layout", function (done) {

        crossbow.populateCache("_layouts/parent.hbs", "Layout: {{content}}");
        var post1 = multiline.stripIndent(function () {/*
         ---
         layout: "parent.hbs"
         ---
         {{site.sitename}}
         */});

        var post = crossbow.addPost("_posts/post1.md", post1, {});

        crossbow.compileOne(post, {siteConfig: {sitename: "({shakyShane})"}}, function (err, out) {
            var compiled = out.compiled;
            require("d-logger")(out.compiled);
            assert.include(compiled, "Layout: <p>({shakyShane})</p>");
            done();
        });
    });

});
