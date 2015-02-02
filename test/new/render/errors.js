var _         = require("lodash");
var assert    = require("chai").assert;
var multiline = require("multiline");
var sinon     = require("sinon");
var fs        = require("fs");
var crossbow  = require("../../../index");
var errors    = require("../../../lib/errors").fails;

describe("Sending good errors", function(){
    it("Syntax errors", function(done) {

        var site = crossbow.builder();

        var input = multiline.stripIndent(function (){/*
        ---
        name: "shane"
        testing: "errors"
        testing: "errors"
        ---

        {{inc src=kittie.html"}}
        */});

        var page = site.addPage("index.html", input);

        site.compile({
            item: page,
            cb: function (err, out) {
                assert.equal(err._crossbow.line, 7);
                assert.equal(err._crossbow.file, "index.html");
                done();
            }
        });
    });
    it.only("YAML errors", function() {

        var site = crossbow.builder();

        var input = multiline.stripIndent(function (){/*
         ---
         name: "shane"
         testing: "errors"
         testing: "errors
         ---
         Testing Yaml Errors
         */});

        var page = site.addPage("index.html", input);

        //
        //site.compile({
        //    item: page,
        //    cb: function (err, out) {
        //
        //        console.log(err);
        //        //assert.equal(err._crossbow.line, 7);
        //        //assert.equal(err._crossbow.file, "index.html");
        //        //site.logger.warn(site.getErrorString(err));
        //        done();
        //    }
        //});
    });
});