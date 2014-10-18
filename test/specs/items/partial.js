var _             = require("lodash");
var assert        = require("chai").assert;
var multiline     = require("multiline");

var Partial = require("../../../lib/partial");

describe("Creating a Partial", function(){
    it("returns an instance", function() {
        var partial = new Partial("/user/shakyshane/_layouts/head.html", "content", {config:{cwd:""}});
        assert.isTrue(partial instanceof Partial);
    });
    it("Creates key properties", function() {
        var partial = new Partial("_includes/blog/head.html", "content", {config:{cwd:""}});
        assert.equal(partial.filePath,   "_includes/blog/head.html");
        assert.equal(partial.shortKey,   "_includes/blog/head.html");
        assert.equal(partial.partialKey, "head");
        assert.equal(partial.content,    "content");
    });
    it("Adds paths", function() {
        var file = {
            config: {
                cwd: "test/fixtures"
            }
        };
        var partial = new Partial("test/fixtures/_includes/blog/head.html", "content", file);
        assert.equal(partial.filePath,   "test/fixtures/_includes/blog/head.html");
        assert.equal(partial.shortKey,   "_includes/blog/head.html");
        assert.equal(partial.partialKey, "head");
        assert.equal(partial.content,    "content");
    });
});