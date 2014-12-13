var _           = require("lodash");
var multiline   = require("multiline");
var sinon       = require("sinon");
var fs          = require("fs");
var assert      = require("chai").assert;
var crossbow    = require("../../../index");

describe("@inc helper", function(){

    beforeEach(function () {
        crossbow.clearCache();
    });

    it("Can do simple includes with CWD", function(done) {

        var index = multiline.stripIndent(function(){/*

         Button: {{ inc src="button.html" }}

         */});

        var page = crossbow.addPage("index.html", index, {});

        var config = {
            siteConfig:{},
            cwd: "test/fixtures"
        };

        crossbow.compileOne(page, config, function (err, out) {
            if (err) {
                done(err);
            }
            assert.include(out.compiled, "<button>");
            done();
        });
    });
    it("Can do simple includes with CWD, custom includes path & custom layout paths", function(done) {

        var index = multiline.stripIndent(function(){/*
         ---
         layout: main.html
         ---
         Button: {{ inc src="button.html" }}

         */});

        var page = crossbow.addPage("index.html", index, {});
        crossbow.populateCache("templates/main.html", "::{{content}}::");

        var config = {
            siteConfig:{},
            cwd: "test/fixtures",
            dirs: {
                layouts: "templates",
                includes: "alt"
            }
        };

        crossbow.compileOne(page, config, function (err, out) {
            if (err) {
                done(err);
            }
            assert.include(out.compiled, "::Button: <button>Button from ALT</button>::");
            done();
        });
    });
});