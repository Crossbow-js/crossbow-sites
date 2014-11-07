var _             = require("lodash");
var multiline     = require("multiline");
var assert        = require("chai").assert;
var crossbow = require("../../../index");

describe("@inc helper errors", function(){

    beforeEach(function () {
        crossbow.clearCache();
    });

    it("emits an error when src missing", function(done) {

        var index = multiline(function(){/*
Before {{ inc }}After
*/});

        crossbow.emitter.on("log", function (data) {
            console.log(data);
            assert.equal(data.type, "warn");
            done();
        });

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            assert.include(out.compiled, "Before After");
        });
    });
    it("emits an error when file does not exist", function(done) {

        var index = multiline.stripIndent(function(){/*

         Before {{ inc src="nothing.html" }}After

         */});

        crossbow.emitter.on("log", function (data) {
            console.log(data);
            assert.equal(data.type, "warn");
            done();
        });

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            if (err) {
                done(err);
            }
            assert.include(out.compiled, "Before After");
        });
    });
    it("emits an error about missing filter", function(done) {

        var index = multiline.stripIndent(function(){/*

         Button: {{ inc src="_includes/button.html" text="shane-{{site.text}}" filter="edede" }}

         */});

        crossbow.emitter.on("log", function (data) {
            assert.equal(data.type, "warn");
            done();
        });

        crossbow.populateCache("_includes/button.html", "<button>{{text}}</button>");

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{text:"Hi there"}}, function (err, out) {
            require("d-logger")(out.compiled);
        });
    });
});