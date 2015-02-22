var assert    = require("chai").assert;
var crossbow = require("../../index");

describe("Updating an item from the cache", function() {

    it("should update an item in the cache without creating dupes", function(done) {

        var site = crossbow.builder();

        var post1  = site.add({type: "post", key: "about.md",  content: "About page"});
        var post2  = site.add({type: "post", key: "blog.md",   content: "Blog page"});

        site.cache.add(post1);
        site.cache.add(post2);

        var collection = site.cache.byType("post");

        assert.equal(collection.get(0).get("content"), "About page");
        assert.equal(collection.get(1).get("content"), "Blog page");

        site.cache.add(post1.set("shane", "awesome"));

        collection = site.cache.byType("post");
        assert.equal(collection.size, 2);

        assert.equal(collection.get(0).get("content"), "About page");
        assert.equal(collection.get(0).get("shane"),   "awesome");
        assert.equal(collection.get(1).get("content"), "Blog page");

        done();
    });
});