var _             = require("lodash");
var multiline     = require("multiline");
var sinon         = require("sinon");
var fs            = require("fs");
var assert        = require("chai").assert;
var dust          = require("dustjs-linkedin");
dust.cache        = {};
dust.isDebug = true;
dust.optimizers.format = function(ctx, node) { return node; };

var coderBlog = require("../../index");

var layout = multiline.stripIndent(function(){/*
{#content /}
*/});

var yml = multiline.stripIndent(function(){/*
- name: Parker Moore
  github: parkr

- name: Liu Fengyun
  github: liufengyun
*/});


describe("Processing a DATA", function(){

    var fsStub;

    before(function () {
        fsStub = sinon.stub(fs, "readFileSync");
    });
    after(function () {
        fsStub.restore();
    });
    afterEach(function () {
        fsStub.reset();
    });

    beforeEach(function () {

        coderBlog.clearCache();

        // Add layouts to cache
        coderBlog.populateCache("_layouts/test.html", layout);
    });

    it("Can use site variables", function(done) {

        var page1 = multiline.stripIndent(function(){/*
         ---
         layout: test
         title: "Homepage"
         date: 2013-11-13
         ---

         {#site.data.members}
         {name}
         {/site.data.members}

         */});

        coderBlog.addPage("index.html", page1, {});

        coderBlog.populateCache("_data/members.yml", yml, "data");

        coderBlog.compileOne("index.html", {siteConfig: {}}, function (err, out) {
            assert.include(out.compiled, "Parker Moore");
            assert.include(out.compiled, "Liu Fengyun");
            done();
        });
    });
});