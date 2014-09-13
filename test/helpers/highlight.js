
var _         = require("lodash");
var assert    = require("chai").assert;
var multiline = require("multiline");
var sinon     = require("sinon");
var fs        = require("fs");

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
    it("escapes output when no lang given", function(done){

        var page1 = multiline.stripIndent(function(){/*

         {@hl}
         <button></button>
         {/hl}

         */});

        crossbow.addPage("projects/about-us.html", page1);

        crossbow.compileOne("projects/about-us.html", {siteConfig:{}}, function (err, out) {
            assert.include(out.compiled, "<pre><code>&lt;button&gt;&lt;/button&gt;");
            done();
        });
    });
    it("escapes output from include inside block", function(done){

        var page1 = multiline.stripIndent(function(){/*

         {@hl}
         {@inc src="button.html" /}
         {/hl}

         */});

        crossbow.addPage("projects/about-us.html", page1);
        crossbow.populateCache("button.html", "<button></button>");

        crossbow.compileOne("projects/about-us.html", {siteConfig:{}}, function (err, out) {
            assert.include(out.compiled, "<pre><code>&lt;button&gt;&lt;/button&gt;");
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
    it("just wraps block (and escapes) when `lang` not given", function(done){

        var page1 = multiline.stripIndent(function(){/*

         {@hl}
         var shane = "awesome";
         {/hl}

         */});

        crossbow.addPage("projects/about-us.html", page1);

        crossbow.compileOne("projects/about-us.html", {siteConfig:{}}, function (err, out) {
            assert.include(out.compiled, "<pre><code>var shane = &quot;awesome&quot;;");
            done();
        });
    });
    it("highlights an external file", function(done) {

        var existsStub = sinon.stub(fs, "existsSync");
        var fsStub     = sinon.stub(fs, "readFileSync").returns(".body { color: red; } ");
        existsStub.withArgs("_scss/main.scss").returns(true);


        var index = multiline.stripIndent(function(){/*

         Before:
         {@hl lang="scss" src="_scss/main.scss" /}
         :After

         */});

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {}, function (err, out) {

            existsStub.restore();
            fsStub.restore();

            assert.include(out.compiled, "<pre><code class=\"scss\"><span class=\"hljs-class\">.body</span>");
            done();
        });
    });
    it("gives a good error when an external file not found", function(done) {

        var existsStub = sinon.stub(fs, "existsSync");
        var fsStub     = sinon.stub(fs, "readFileSync").returns(".body { color: red; } ");
        existsStub.withArgs("_scss/main.scss").returns(true);


        var index = multiline.stripIndent(function(){/*

         {@hl lang="scss" src="_scssss/main.scss" /}

         */});

        crossbow.emitter.on("log", function (msg) {
            assert.equal(msg.type, "warn");
            assert.include(msg.msg, "_scssss/main.scss");
            done();
        });

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {}, function (err, out) {
            existsStub.restore();
            fsStub.restore();
        });
    });
    it("uses file extension for highlight lang if params.lang not given", function(done){

        var page1 = multiline.stripIndent(function(){/*

         {@hl src="js/function.js" /}

         */});

        crossbow.populateCache("js/function.js", "var shane = 'developer';");
        crossbow.addPage("projects/about-us.html", page1);

        crossbow.compileOne("projects/about-us.html", {siteConfig:{}}, function (err, out) {
            assert.include(out.compiled, "<pre><code class=\"js\"><span class=\"hljs-keyword\">var</span> shane =");
            done();
        });
    });
    it("ignores the file extension if params.lang is given", function(done){

        var page1 = multiline.stripIndent(function(){/*

         {@hl src="js/function.js" lang="ruby" /}

         */});

        crossbow.populateCache("js/function.js", "var shane = 'developer';");
        crossbow.addPage("projects/about-us.html", page1);

        crossbow.compileOne("projects/about-us.html", {siteConfig:{}}, function (err, out) {
            assert.include(out.compiled, "<pre><code class=\"ruby\">var shane =");
            done();
        });
    });
});