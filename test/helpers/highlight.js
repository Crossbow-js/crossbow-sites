
var _             = require("lodash");
var assert        = require("chai").assert;
var multiline     = require("multiline");

var Post     = require("../../lib/post");
var crossbow = require("../../index");

describe("@highlight + @hl", function(){

    beforeEach(function () {
        crossbow.clearCache();
    });

    it("highlights a block of code", function(done){

        var page1 = multiline.stripIndent(function(){/*

         {@hl lang="js"}
         var shane = "awesome";
         {/hl}

         */});

        crossbow.addPage("projects/about-us.html", page1);

        crossbow.compileOne("projects/about-us.html", {siteConfig:{}}, function (err, out) {
            assert.include(out.compiled, "<pre><code class=\"js\"><span class=\"hljs-keyword\">var</span>");
            done();
        });
    });
    it("highlights a block of code using lang param", function(done){

        var page1 = multiline.stripIndent(function(){/*

         {@hl lang="ruby"}
         var shane = "awesome";
         {/hl}

         */});

        crossbow.addPage("projects/about-us.html", page1);

        crossbow.compileOne("projects/about-us.html", {siteConfig:{}}, function (err, out) {
            assert.include(out.compiled, "<pre><code class=\"ruby\">var shane");
            done();
        });
    });
    it("just wraps block when `lang` not given", function(done){

        var page1 = multiline.stripIndent(function(){/*

         {@hl}
         var shane = "awesome";
         {/hl}

         */});

        crossbow.addPage("projects/about-us.html", page1);

        crossbow.compileOne("projects/about-us.html", {siteConfig:{}}, function (err, out) {
            assert.include(out.compiled, "<pre><code>var shane = \"awesome\";");
            done();
        });
    });
});