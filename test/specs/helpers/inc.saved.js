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

    it.only("Can do simple includes with file extension", function(done) {

        var index = multiline.stripIndent(function(){/*

        {@save src="button.html" name="shane"/}
        
        {@inc src="saved:button.html" /}
        
         */});

        crossbow.populateCache("button.html", "<button>{name}</button>");

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            if (err) {
                done(err);
            }
            assert.include(out.compiled, "<button>shane</button>");
            done();
        });
    });
});