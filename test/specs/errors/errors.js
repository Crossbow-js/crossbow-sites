var _             = require("lodash");
var multiline     = require("multiline");
var assert        = require("chai").assert;

var crossbow = require("../../index");

var postLayout = multiline.stripIndent(function(){/*
 <!DOCTYPE html>
 <html>
 {>"includes/head" /}
 <body class="post">
 {#content /}
 </body>
 </html>
 */});

var pageLayout = multiline.stripIndent(function(){/*
<!DOCTYPE html>
<html>
 {>"includes/head" /}
<body class="page">
{#content /}
</body>
</html>
*/});

var post1 = multiline.stripIndent(function(){/*
 ---
 layout: post-test
 title: "Function Composition in Javascript."
 date: 2013-11-13 20:51:39
 ---

 Hi there {page.title}

 */});

describe("API gives meaningfull errors", function(){

    beforeEach(function () {
        crossbow.clearCache();

        // Add layouts to cache
        crossbow.populateCache("_layouts/post-test.html", postLayout);
        crossbow.populateCache("_layouts/page-test.html", pageLayout);

        // Add HEAD section to cache
        crossbow.populateCache("_includes/head", "<head><title>{page.title} {site.sitename}</title></head>");
    });

    it("passes error about includes", function(done) {

        var post2 = multiline.stripIndent(function(){/*
         ---
         layout: post-test
         title: "Highlight Helper"
         date: 2013-11-13 20:51:39
         ---

         {page.title}

         {@inc src="buttonss" /}

         */});

        var post = crossbow.addPost("_posts/post2.md", post2, {});
        crossbow.populateCache("_snippets/function2.js", "var name = \"{params.name}\"");

        crossbow.compileOne(post, {siteConfig: {sitename: "(shakyShane)"}}, function (err, out) {
//            assert.equal(err, "Error: Template Not Found: includes/buttonss.html");
            done();
        });
    });
});