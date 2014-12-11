var _           = require("lodash");
var assert      = require("chai").assert;
var multiline   = require("multiline");
var crossbow    = require("../../../index");

var content1 = multiline.stripIndent(function(){/*
---
title: "About"
---

post1
 */});

var content2 = multiline.stripIndent(function(){/*
---
title: "Blog"
---

post2
 */});

describe("Using the pages collection", function(){
    var _cache, post1, post2;

    beforeEach(function () {
        crossbow.clearCache();
    });

    it("should loop through and render links to posts in tags", function(done) {

        var index = multiline.stripIndent(function(){/*
---
title: "Homepage"
---
<ul>
{{#each pages}}
    <li>{{this.title}} - {{this.url}}</li>
{{/each}}
</ul>
*/});

        var expected = multiline.stripIndent(function () {/*
<ul>
    <li>About - /about.html</li>
    <li>Blog - /blog.html</li>
    <li>Homepage - /index.html</li>
</ul>
*/});

        crossbow.addPage("about.html", content1, {});
        crossbow.addPage("blog.html",  content2, {});
        crossbow.addPage("index.html",      index,    {});

        crossbow.compileOne("index.html", {siteConfig:{}}, function (err, out) {
            if (err) {
                done(err);
            }
            assert.include(out.compiled, expected);
            done();
        });
    });
});