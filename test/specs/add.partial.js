var assert    = require("chai").assert;
var crossbow  = require("../../index");

describe("Adding a partial", function() {

    it("Add & update 1 partial", function(done) {

        var site = crossbow.builder();

        var content  = "<p>{{itemTitle}} is rad, {{page.url}}, {{site.title}}</p>";
        var content2 = content + "<span>another</span>";
        var key      = "lay/default.hbs";

        var index = site.add({type: "partial", key: key, content: content});

        assert.equal(index.get("type"), "partial");
        assert.equal(index.get("key"), key);
        assert.equal(index.get("content"), content);

        index = site.add({type: "partial", key: key, content: content2});

        assert.equal(index.get("content"), content2);

        assert.deepEqual(site.cache.byType("partial").size, 1);

        assert.equal(site.cache.byType("partial").get(0).get("content"), content2);

        done();

    });
});