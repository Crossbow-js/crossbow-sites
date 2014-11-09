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

         Button: {{ inc src="_includes/button.html" }}

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
            //require("d-logger")(out.compiled);
            assert.include(out.compiled, "<button>");
            done();
        });
    });
});