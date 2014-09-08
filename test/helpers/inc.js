var _             = require("lodash");
var multiline     = require("multiline");
var assert        = require("chai").assert;
var crossbow = require("../../index");

describe("Processing a file", function(){

    beforeEach(function () {
        crossbow.clearCache();
    });

    it("Can do simple includes", function(done) {

        var index = multiline.stripIndent(function(){/*

        {@inc src="button.html" /}

         */});

        crossbow.populateCache("_includes/button.html", "button");

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {

            console.log(out.compiled);
//            var compiled = out.compiled;
//            assert.include(compiled, "<button>Sign Up</button>");
            done();
        });
    });
});