var _         = require("lodash");
var assert    = require("chai").assert;
var multiline = require("multiline");
var sinon     = require("sinon");
var fs        = require("fs");
var crossbow  = require("../../../index");

describe("Adding a partial", function() {

    it("Add & update 1 partial", function(done) {

        var site = crossbow.builder();

        var content  = "<p>{{itemTitle}} is rad, {{page.url}}, {{site.title}}</p>";
        var content2 = content + "<span>another</span>";
        var key      = "lay/default.hbs";

        var index = site.addPartial("lay/default.hbs", content);

        assert.equal(index.get("type"), "partial");
        assert.equal(index.get("key"), key);
        assert.equal(index.get("content"), content);

        index = site.addPartial(key, content2);

        assert.equal(index.get("content"), content2);

        assert.deepEqual(site.cache.byType("partial").size, 1);

        assert.equal(site.cache.byType("partial").get(key).get("content"), content2);

        done();

    });
});