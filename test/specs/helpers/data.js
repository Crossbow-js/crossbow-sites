var _           = require("lodash");
var multiline   = require("multiline");
var sinon       = require("sinon");
var fs          = require("fs");
var assert      = require("chai").assert;
var crossbow    = require("../../../index");

describe("@data helper", function(){

    beforeEach(function () {
        crossbow.clearCache();
    });

    it("can use an external data file", function(done) {

        var index = multiline.stripIndent(function(){/*
        Before:
        {@data src="data/author.yml"}
        {author.name} - {site.title}
        {/data}
        :After

         */});

        var data = multiline.stripIndent(function(){/*
        name: Shane Osbourne
         */});



        var page = crossbow.addPage("index.html", index, {});

        crossbow.populateCache("data/author.yml", data, "data");

        crossbow.compileOne(page, {siteConfig:{title: "shakyshane"}}, function (err, out) {
            assert.include(out.compiled, "Shane Osbourne - shakyshane");
            done();
        });
    });
    it("can use an external data file with scope set to file basename", function(done) {

        var index = multiline.stripIndent(function(){/*
         Before:
         {@data src="data/author.yml"}
         {author.name}
         {/data}
         :After

         */});

        var data = multiline.stripIndent(function(){/*
         name: Shane Osbourne
         */});

        var page = crossbow.addPage("index.html", index, {});

        crossbow.populateCache("data/author.yml", data, "data");

        crossbow.compileOne(page, {siteConfig:{title: "shakyshane"}}, function (err, out) {
            assert.include(out.compiled, "Shane Osbourne");
            done();
        });
    });
    it("can use an external data file with different scope", function(done) {

        var index = multiline.stripIndent(function(){/*
        ---
        title: "Data test"
        button: "primary"
        ---
        Before:
        {@data src="data/author.yml" as="author"}
        {author.name} - {site.title} - {page.title} - {page.button}
        {/data}
        :After

         */});

        var data = multiline.stripIndent(function(){/*
        name: Shane Osbourne
         */});

        var page = crossbow.addPage("index.html", index, {});

        crossbow.populateCache("data/author.yml", data, "data");

        crossbow.compileOne(page, {siteConfig:{title: "shakyshane"}}, function (err, out) {
            assert.include(out.compiled, "Shane Osbourne - shakyshane - Data test - primary");
            done();
        });
    });

    it("can access the disk for data file", function(done) {

        var index = multiline.stripIndent(function(){/*
         Before:
         {@data src="_data/author.yml"}
         {name} - {site.title}
         {/data}
         :After

         */});

        var data = multiline.stripIndent(function(){/*
         name: Shane Osbourne
         */});

        var existsStub = sinon.stub(fs, "existsSync");
        var fsStub     = sinon.stub(fs, "readFileSync").returns(data);
        existsStub.withArgs("_data/author.yml").returns(true);


        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{title: "shakyshane"}}, function (err, out) {
            assert.include(out.compiled, "Shane Osbourne - shakyshane");
            existsStub.restore();
            fsStub.restore();
            done();
        });
    });
});