var assert    = require("chai").assert;
var crossbow = require("../../../index");

describe("Working with the cache", function() {

    it("should add/retrieve cache items manually", function() {

        var site = crossbow.builder();

        var item = site.preProcess("index.html", "<button>Click me</button>");

        site.cache.add(item);

        var out = site.cache.byKey("index.html");

        assert.isUndefined(out.get("title"));
        assert.equal(out.get("filepath"), "index.html");
        assert.equal(out.get("content"), "<button>Click me</button>");
    });

    it("should add/retrieve cache items with page semantics", function() {

        var site = crossbow.builder();

        site.add({key: "index.html", content: "<button>Click me</button>"});

        var out  = site.cache.byKey("index.html");

        assert.equal(out.get("content"),  "<button>Click me</button>");

        site.add({key: "index.html", content: "<button>Click me again!</button>"});

        out = site.cache.byKey("index.html");

        assert.equal(out.get("content"),  "<button>Click me again!</button>");
    });
});