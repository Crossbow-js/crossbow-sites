var _             = require("lodash");
var multiline     = require("multiline");
var assert        = require("chai").assert;
var crossbow = require("../../../index");

describe("@inc helper + params", function(){

    beforeEach(function () {
        crossbow.clearCache();
    });

    it("Can do simple includes with params", function(done) {

        var index = multiline.stripIndent(function(){/*

         Button: {@inc src="button.html" text="Cancel" /}

         */});

        crossbow.populateCache("_includes/button.html", "<button>{text}</button>");

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            assert.include(out.compiled, "<button>Cancel</button>");
            done();
        });
    });
    it("Can do simple includes with interpolated params in config", function(done) {

        var index = multiline.stripIndent(function(){/*

         Button: {@inc src="button.html" text="{site.text}" /}

         */});

        crossbow.populateCache("_includes/button.html", "<button>{text}</button>");

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{text:"Cancel"}}, function (err, out) {
            assert.include(out.compiled, "<button>Cancel</button>");
            done();
        });
    });
    it("Can do simple includes with interpolated params front Front Matter", function(done) {

        var index = multiline.stripIndent(function(){/*
         ---
         text: "Sign up"
         ---

         Button: {@inc src="button.html" text="{page.text}" /}

         */});

        crossbow.populateCache("_includes/button.html", "<button>{text}</button>");

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            assert.include(out.compiled, "<button>Sign up</button>");
            done();
        });
    });
    it("Can do simple includes with a filter", function(done) {

        var index = multiline.stripIndent(function(){/*

         {@inc src="button" text="Unfiltered"/}
         {@inc src="button" text="Filtered" filter="h"/}

         */});

        crossbow.populateCache("_includes/button.html", "<button>{text}</button>");

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            assert.include(out.compiled, "<button>Unfiltered</button>");
            assert.include(out.compiled, "&lt;button&gt;Filtered&lt;/button&gt;");
            done();
        });
    });
});