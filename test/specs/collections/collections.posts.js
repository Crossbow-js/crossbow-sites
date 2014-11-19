var _           = require("lodash");
var assert      = require("chai").assert;
var multiline   = require("multiline");
var crossbow    = require("../../../index");

var content1 = multiline.stripIndent(function(){/*
 ---
 layout: post-test
 title: "Blog 1"
 date: 2013-11-13
 categories: javascript, node js
 tags: code, jquery-ui
 ---

 post1
 */});

var content2 = multiline.stripIndent(function(){/*
 ---
 layout: featured
 title: "Blog 2"
 date: 2013-11-14
 categories: javascript
 tags: code
 ---

 post2
 */});

describe("Using the categories collection", function(){
    var _cache, post1, post2;

    beforeEach(function () {
        crossbow.clearCache();
    });

    it("should loop through and render links to posts in categories", function(done) {

        var index = multiline.stripIndent(function(){/*
{{#each categories}}
<p>{{this.title}}</p>
<ul>
    {{#each this.items}}
    <li>{{this.title}} - {{this.url}}</li>
    {{/each}}
</ul>
{{/each}}
*/});

        var expected = multiline.stripIndent(function () {/*
<p>javascript</p>
<ul>
    <li>Blog 2 - /post2.html</li>
    <li>Blog 1 - /post1.html</li>
</ul>
<p>node js</p>
<ul>
    <li>Blog 1 - /post1.html</li>
</ul>
*/});

        crossbow.addPost("_posts/post1.md", content1, {});
        crossbow.addPost("_posts/post2.md", content2, {});
        crossbow.addPage("index.html",      index,    {});

        crossbow.compileOne("index.html", {siteConfig:{}}, function (err, out) {
            if (err) {
                done(err);
            }
            assert.include(out.compiled, expected);
            done();
        })
    });

    it("should loop through and render links to posts in tags", function(done) {

        var index = multiline.stripIndent(function(){/*
{{#each tags}}
<p>{{this.title}}</p>
<ul>
    {{#each this.items}}
    <li>{{this.title}} - {{this.url}}</li>
    {{/each}}
</ul>
{{/each}}
*/});

        var expected = multiline.stripIndent(function () {/*
<p>code</p>
<ul>
    <li>Blog 2 - /post2.html</li>
    <li>Blog 1 - /post1.html</li>
</ul>
<p>jquery-ui</p>
<ul>
    <li>Blog 1 - /post1.html</li>
</ul>
*/});

        crossbow.addPost("_posts/post1.md", content1, {});
        crossbow.addPost("_posts/post2.md", content2, {});
        crossbow.addPage("index.html",      index,    {});

        crossbow.compileOne("index.html", {siteConfig:{}}, function (err, out) {
            if (err) {
                done(err);
            }
            assert.include(out.compiled, expected);
            done();
        })
    });
});