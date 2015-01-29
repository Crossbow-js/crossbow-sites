var _           = require("lodash");
var multiline   = require("multiline");
var sinon       = require("sinon");
var fs          = require("fs");
var assert      = require("chai").assert;
var crossbow    = require("../../../index");

describe("#md helper", function() {

    beforeEach(function () {
        crossbow.clearCache();
    });

    it.only("can render md blocks with page content", function(done) {

        var layout = multiline.stripIndent(function(){/*
{{ content }}
         */});
        var index = multiline.stripIndent(function(){/*
---
layout: "default.hbs"
---
{{#md}}
#title
{{/md}}
##Not a title
         */});

        crossbow.populateCache("_layouts/default.hbs", layout);

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            if (err) {
                done(err);
            }
            assert.include(out.compiled, "<h1 id=\"title\">title</h1>");
            assert.include(out.compiled, "##Not a title");
            done();
        });
    });
});