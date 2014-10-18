var _           = require("lodash");
var multiline   = require("multiline");
var dlog        = require("d-logger");
var sinon       = require("sinon");
var fs          = require("fs");
var assert      = require("chai").assert;
var crossbow    = require("../../index");

describe("@inc helper", function(){

    beforeEach(function () {
        crossbow.clearCache();
    });

    it("Can do simple includes with file extension", function(done) {

        var index = 'Button: {@inc src="button.html" /}';

        crossbow.populateCache("_includes/button.html", "<button>Sign up</button>");

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            assert.equal(out.compiled, "Button: <button>Sign up</button>");
            done();
        });
    });
});