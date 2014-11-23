var _             = require("lodash");
var multiline     = require("multiline");
var assert        = require("chai").assert;

var crossbow      = require("../../../index");

var postLayout = multiline.stripIndent(function(){/*
 <!DOCTYPE html>
 <html>
 {{ inc src="_includes/head.html" }}
 <body class="post">
 {{ content }}
 </body>
 </html>
 */});

var pageLayout = multiline.stripIndent(function(){/*
<!DOCTYPE html>
<html>
 {{ inc src="_includes/head.html" }}
<body class="page">
{{ content }}
</body>
</html>
*/});

var post1 = multiline.stripIndent(function(){/*
 ---
 layout: post-test
 title: "Function Composition in Javascript."
 date: 2013-11-13 20:51:39
 ---

 Hi there {{page.title}}

 */});

describe("API gives meaningfull errors", function(){

    beforeEach(function () {
        crossbow.clearCache();

        // Add layouts to cache
        crossbow.populateCache("_layouts/post-test.html", postLayout);
        crossbow.populateCache("_layouts/page-test.html", pageLayout);

        // Add HEAD section to cache
        crossbow.populateCache("_includes/head.html", "<head><title>{{page.title}} {{site.sitename}}</title></head>");
    });

    it("passes error about helpers", function(done) {

        var post2 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Highlight Helper"
         date: 2013-11-13 20:51:39
         ---

         Before {{ inc src="shane }}After

         */});

        var post = crossbow.addPost("_posts/post2.md", post2, {});

        crossbow.emitter.on("_error", function (data) {
            assert.equal(data.error.hash.loc.first_line, 2);
            assert.include(data.error.hash.position.string, "Before {{ inc src=\"shane }}After");
            done();
        });

        crossbow.compileOne(post, {siteConfig: {sitename: "(shakyShane)"}}, function (err, out) {
            if (err) {
                done(err);
            }
            assert.include(out.compiled, "<p>Before After</p>");
        });
    });
    it("passes error about include helpers", function(done) {

        var post2 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Highlight Helper"
         date: 2013-11-13 20:51:39
         ---

         Before {{ inc src=3 }}After

         */});

        var post = crossbow.addPost("_posts/post2.md", post2, {});

        crossbow.emitter.on("_error", function (data) {
            assert.equal(data.error.name, "Error");
            done();
        });

        crossbow.compileOne(post, {siteConfig: {sitename: "(shakyShane)"}}, function (err, out) {
            assert.include(out.compiled, "<p>Before After</p>");
        });
    });
    it("passes error about data helpers", function(done) {

        var post2 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Highlight Helper"
         date: 2013-11-13 20:51:39
         ---

         Before {{ data src=3 }}After

         */});

        var post = crossbow.addPost("_posts/post2.md", post2, {});

        crossbow.emitter.on("_error", function (data) {
            assert.equal(data.error.name, "Error");
            done();
        });

        crossbow.compileOne(post, {siteConfig: {sitename: "(shakyShane)"}}, function (err, out) {
            if (err) {
                done(err);
            }
            //require("d-logger")(out.compiled);
            assert.include(out.compiled, "<p>Before After</p>");
        });
    });
});