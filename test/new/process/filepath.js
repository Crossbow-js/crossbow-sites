var _         = require("lodash");
var path      = require("../../../lib/core/path");
var assert    = require("chai").assert;
var multiline = require("multiline");
var sinon     = require("sinon");
var fs        = require("fs");
var crossbow  = require("../../../index");
var url       = require("../../../lib/url");
var merge     = require("../../../lib/config").merge;

function testfn (filepath, config) {
    return url.makeFilepath(filepath, merge(config));
}

describe.only("Resolving filepaths", function() {

    it("remove cwd", function() {
        var filepath = "_src/app/index.html";
        assert.equal(testfn(filepath, {cwd: "_src"}),  "app/index.html");
        assert.equal(testfn(filepath, {cwd: ""}),      "_src/app/index.html");
        assert.equal(testfn(filepath, {cwd: "."}),     "_src/app/index.html");
        assert.equal(testfn(filepath, {cwd: "./"}),    "_src/app/index.html");
    });
    it("remove cwd", function() {
        //assert.equal(url.makeFilepath("_src/app/index.hbs", site.config),  "app/index.html");
        //assert.equal(url.makeFilepath("_src/app/index.hbs", site2.config), "_src/app/index.html");
    });
});