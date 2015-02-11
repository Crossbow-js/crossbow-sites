var _         = require("lodash");
var assert    = require("chai").assert;
var multiline = require("multiline");
var sinon     = require("sinon");
var fs        = require("fs");
var crossbow = require("../../../index");

describe("Working with the cache", function() {

    it("should add/retrieve cache items", function() {

        var site = crossbow.builder();

        var item = site.preProcess("index.html", "<button>Click me</button>");

        console.log(item.toJS());
    });

    it("should add/retrieve cache items with page semantics", function() {

        var site = crossbow.builder();

        site.addPage("index.html", "<button>Click me</button>");

        var out  = site.cache.byKey("index.html");

        assert.equal(out.get("content"),  "<button>Click me</button>");

        site.addPage("index.html", "<button>Click me again!</button>");

        out = site.cache.byKey("index.html");

        assert.equal(out.get("content"),  "<button>Click me again!</button>");
    });
});