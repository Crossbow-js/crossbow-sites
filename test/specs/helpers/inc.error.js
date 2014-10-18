var _             = require("lodash");
var multiline     = require("multiline");
var assert        = require("chai").assert;
var crossbow = require("../../../index");

describe("@inc helper errors", function(){

    beforeEach(function () {
        crossbow.clearCache();
    });

    it("emits an error when src missing", function(done) {

        var index = multiline.stripIndent(function(){/*

        Before {@inc /}After

         */});

        crossbow.emitter.on("log", function (data) {
            assert.equal(data.type, "warn");
            assert.equal(data.context, "index.html");
            done();
        });

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            assert.include(out.compiled, "Before After");
        });
    });
    it("emits an error when file does not exist", function(done) {

        var index = multiline.stripIndent(function(){/*

         Before {@inc src="nothing.html" /}After

         */});

        crossbow.emitter.on("log", function (data) {
            assert.equal(data.type, "warn");
            assert.equal(data.context, "index.html");
            done();
        });

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            assert.include(out.compiled, "Before After");
        });
    });
    it("emits an error about missing filter", function(done) {

        var index = multiline.stripIndent(function(){/*

         Button: {@inc src="button.html" text="{page.text}" filter="edede"/}

         */});

        crossbow.emitter.on("log", function (data) {
            assert.equal(data.type, "warn");
            assert.equal(data.context, "index.html");
            done();
        });

        crossbow.populateCache("_includes/button.html", "<button>{site.text}</button>");

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{text:"'"}}, function () {});
    });
});