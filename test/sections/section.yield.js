var _             = require("lodash");
var assert        = require("chai").assert;
var multiline     = require("multiline");

var Post     = require("../../lib/post");
var crossbow = require("../../index");

describe("Yielding sections ", function(){

    beforeEach(function () {
        crossbow.clearCache();
    });

    it("allows sections with names:", function(done){

        var layout = multiline.stripIndent(function(){/*
        <html>
        <head>

        {#yield name="head-css" /}
        </head>

        </html>
        */});
        var page1 = multiline.stripIndent(function(){/*
         ---
         layout: test
         title: "Homepage"
         ---

         Page 1

         {#section name="head-css"}.body { background: red }{/section}

         {#section name="head-js"}<script>alert("hey yo");</script>{/section}

         */});

        crossbow.populateCache("_layouts/test.html", layout);

        crossbow.addPage("projects/about-us.html", page1);

        crossbow.compileOne("projects/about-us.html", {}, function (err, out) {
            assert.include(out.compiled, ".body { background: red }");
            assert.notInclude(out.compiled, "<script>alert(\"hey yo\");</script>");
            done();
        });
    });
});