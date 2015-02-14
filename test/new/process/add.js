var assert    = require("chai").assert;
var crossbow  = require("../../../index");

describe("Adding a page", function() {

    it("Add 1 page & compile", function() {

        var site = crossbow.builder();

        var index = site.add({
            key:     "src/docs/index.html",
            content: "<p>{{itemTitle}} is rad, {{page.url}}, {{site.title}}</p>"
        });
    });
});