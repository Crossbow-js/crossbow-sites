var _           = require("lodash");
var multiline   = require("multiline");
var sinon       = require("sinon");
var fs          = require("fs");
var assert      = require("chai").assert;
var crossbow    = require("../../../index");

describe("@content helper", function() {

    beforeEach(function () {
        crossbow.clearCache();
    });

    it("replaces {{content}} with page content", function(done) {

        var layout = multiline.stripIndent(function(){/*
<html>
{{content}}
</html>
         */});
        var index = multiline.stripIndent(function(){/*
---
layout: "default.hbs"
---
Some content
         */});

        crossbow.populateCache("_layouts/default.hbs", layout);

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            if (err) {
                done(err);
            }
            assert.equal(out.compiled, "<html>\nSome content\n</html>");
            done();
        });
    });
    it("replaces {{content}} with page content without fucking the formatting", function(done) {

        var layout = multiline.stripIndent(function(){/*
<html>
    {{content}}
</html>
         */});
        var index = multiline.stripIndent(function(){/*
---
layout: "default.hbs"
---
Some
    content
Here
         */});
        var expected = multiline.stripIndent(function(){/*
<html>
    Some
        content
    Here
</html>
         */});

        crossbow.populateCache("_layouts/default.hbs", layout);

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            if (err) {
                done(err);
            }
            //require("d-logger")(out.compiled);
            assert.equal(out.compiled, expected);
            done();
        });
    });
});