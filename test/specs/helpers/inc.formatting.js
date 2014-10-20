var _           = require("lodash");
var multiline   = require("multiline");
var dlog        = require("d-logger");
var sinon       = require("sinon");
var fs          = require("fs");
var assert      = require("chai").assert;
var crossbow    = require("../../../index");

describe("@inc helper - formatting tests", function() {

    beforeEach(function () {
        crossbow.clearCache();
        crossbow.populateCache("button.html", "<button>Sign up</button>");
    });

    it("Can do simple includes without fucking the formatting", function(done) {
        
        var index = multiline(function(){/*
Before
{@inc src="button.html" /}
After
         */});
        var expected = multiline(function(){/*
Before
<button>Sign up</button>
After
         */});
        
        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            dlog(out.compiled);
            assert.equal(out.compiled, expected);
            done();
        });
    });
//    it("Can do simple includes without fucking the formatting", function(done) {
//        
//        var index = multiline(function(){/*
//Before
//{@inc src="button.html" /} After
//         */});
//        var expected = multiline(function(){/*
//Before
//<button>Sign up</button> After
//         */});
//        
//        var page = crossbow.addPage("index.html", index, {});
//
//        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
//            dlog(out.compiled);
//            assert.equal(out.compiled, expected);
//            done();
//        });
//    });
//
//    it("Can do simple includes without fucking the formatting", function(done) {
//
//        var index = multiline(function(){/*
//Before
//{@section name="shane"}
//This is content
//{/section}
//After
//         */});
//        var expected = multiline(function(){/*
//Before
//After
//         */});
//
//        var page = crossbow.addPage("index.html", index, {});
//
//        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
//            dlog(out.compiled);
//            assert.equal(out.compiled, expected);
//            done();
//        });
//    });
});