var assert    = require("chai").assert;
var crossbow = require("../../index");

describe("Working with the cache", function() {

    it("should add/retrieve cache items manually", function() {

        var site = crossbow.builder();

        var item = site.preProcess({key: "index.html", content: "<button>Click me</button>"});

        site.cache.add(item);

        var out = site.cache.byKey("index.html");

        assert.isUndefined(out.get("title"));
        assert.equal(out.get("filepath"), "index.html");
        assert.equal(out.get("content"), "<button>Click me</button>");
    });

    it("should accept a filter function when retrieving by type", function() {

        var site = crossbow.builder();

        var post  = site.add({type: "post", key: "about.md",  content: "<button>Click me</button>"});
        var draft = site.add({type: "post", key: "_about.md", content: "<button>Click me</button>"});

        site.cache.add(post);
        site.cache.add(draft);

        var out = site.cache.byType("post", function (item) {
            return item.getIn(["path", "name"])[0] !== "_";
        });

        assert.equal(out.size, 1);
        assert.equal(out.get(0).get("title"), "About");
        assert.equal(out.get(0).get("key"), "about.md");
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