var _           = require("lodash");
var multiline   = require("multiline");
var dlog        = require("d-logger");
var sinon       = require("sinon");
var fs          = require("fs");
var assert      = require("chai").assert;
var crossbow    = require("../../../index");

describe.only("@inc helper - formatting tests", function() {

    beforeEach(function () {
        crossbow.clearCache();
        crossbow.populateCache("button.html", "<button>Sign up</button>");
    });

    it("Can do simple includes without fucking the formatting", function(done) {

        var index = multiline(function(){/*
Before
{{ inc src="button.html" }}
After
         */});
        var expected = multiline(function(){/*
Before
<button>Sign up</button>
After
         */});

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            assert.equal(out.compiled, expected);
            done();
        });
    });
    it("Can do simple includes without fucking the formatting", function(done) {

        var index = multiline(function(){/*
Before
{{ inc src="button.html" }} After
         */});
        var expected = multiline(function(){/*
Before
<button>Sign up</button> After
         */});

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            assert.equal(out.compiled, expected);
            done();
        });
    });
    it("Can do simple includes without fucking the formatting", function(done) {

        var index = multiline(function(){/*
<ul>
    {{#site.links}}
    <li>{{.}}</li>
    {{/site.links}}
</ul>
         */});
        var expected = multiline(function(){/*
<ul>
    <li>Link 1</li>
    <li>Link 2</li>
</ul>
         */});

        var page = crossbow.addPage("index.html", index, {});
        var links = ["Link 1", "Link 2"];

        crossbow.compileOne(page, {siteConfig: {links: links}}, function (err, out) {
            dlog(out.compiled);
            assert.equal(out.compiled, expected);
            done();
        });
    });
});