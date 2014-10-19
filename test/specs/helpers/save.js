//var _           = require("lodash");
//var multiline   = require("multiline");
//var sinon       = require("sinon");
//var fs          = require("fs");
//var assert      = require("chai").assert;
//var crossbow    = require("../../../index");
//
//describe("@data helper", function(){
//
//    beforeEach(function () {
//        crossbow.clearCache();
//    });
//
//    it("can use an external data file", function(done) {
//
//        var index = multiline.stripIndent(function(){/*
//        
//        Before:
//        {@data src="data/author.yml"}
//        {author.name} - {site.title}
//        {/data}
//        :After
//
//         */});
//
//        var data = multiline.stripIndent(function(){/*
//        name: Shane Osbourne
//         */});
//
//
//
//        var page = crossbow.addPage("index.html", index, {});
//
//        crossbow.populateCache("data/author.yml", data, "data");
//
//        crossbow.compileOne(page, {siteConfig:{title: "shakyshane"}}, function (err, out) {
//            assert.include(out.compiled, "Shane Osbourne - shakyshane");
//            done();
//        });
//    });
//});