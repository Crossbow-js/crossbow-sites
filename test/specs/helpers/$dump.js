var _           = require("lodash");
var multiline   = require("multiline");
var sinon       = require("sinon");
var fs          = require("fs");
var assert      = require("chai").assert;
var crossbow    = require("../../../index");

describe("$dump helper", function() {

    beforeEach(function () {
        crossbow.clearCache();
    });

    it.skip("can dump current item", function(done) {

        var index = multiline.stripIndent(function(){/*
         {{ $dump site }} ok
         */});

        crossbow.populateCache("button.html", "<button>Sign up</button>");

        var page = crossbow.addPage("index.html", index, {});
        var config = {
            siteConfig: {
                names: ["Shane", "kittie"]
            }
        };
        crossbow.compileOne(page, config, function (err, out) {
            if (err) {
                done(err);
            }
            assert.include(out.compiled, "class=\"hljs-string\">\"Shane\"</span>");
            done();
        });
    });
});