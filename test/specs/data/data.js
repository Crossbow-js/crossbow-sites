var _             = require("lodash");
var multiline     = require("multiline");
var sinon         = require("sinon");
var fs            = require("fs");
var assert        = require("chai").assert;

var crossbow = require("../../index");

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

        crossbow.clearCache();

        // Add layouts to cache
        crossbow.populateCache("_layouts/test.html", layout);
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

        crossbow.addPage("index.html", page1, {});

        crossbow.populateCache("_data/members.yml", yml, "data");

        crossbow.compileOne("index.html", {siteConfig: {}}, function (err, out) {
            assert.include(out.compiled, "Parker Moore");
            assert.include(out.compiled, "Liu Fengyun");
            done();
        });
    });
});