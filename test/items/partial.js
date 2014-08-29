var _             = require("lodash");
var assert        = require("chai").assert;
var multiline     = require("multiline");

var Partial = require("../../lib/partial");

describe("Creating a Partial", function(){
    it("returns an instance", function() {
        var partial = new Partial("/user/shakyshane/_layouts/head.html", "content");
        assert.isTrue(partial instanceof Partial);
    });
    it("Create key properties", function() {

        var partial = new Partial("_includes/blog/head.html", "content");

        assert.equal(partial.shortKey,   "includes/blog/head.html");
        assert.equal(partial.partialKey, "head");
        assert.equal(partial.content,    "content");
    });
});