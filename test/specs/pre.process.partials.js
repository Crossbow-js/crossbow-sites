var assert   = require("chai").assert;
var crossbow = require("../../index");

describe("Pre-processing a random partial", function() {

    it("should return the key", function(done) {

        var site = crossbow.builder();
        var item = site.preProcess({key: "_layouts/main.html", content: "Content: {{content}}"});

        assert.equal(item.get("key"),  "_layouts/main.html");
        assert.equal(item.get("content"),  "Content: {{content}}");

        assert.isUndefined(item.get("type"));

        var page = site.add({key: "main.html", content: "Hello from main"});

        assert.equal(page.get("url"), "/main.html");
        assert.equal(page.get("key"), "main.html");
        assert.equal(page.get("filepath"), "main.html");
        assert.equal(page.get("title"), "Main");

        site.freeze();

        site.compile({
            item: page,
            cb: function (err, out) {
                assert.equal(out.get("compiled"), "Hello from main");
                done();
            }
        });
    });
});