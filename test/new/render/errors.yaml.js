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
    it("YAML errors in front matter", function(done) {

        var site = crossbow.builder({
            config: {
                errorHandler: function (err) {
                    assert.equal(err._crossbow.line, 4);
                    assert.equal(err._crossbow.file, "index.html");
                    done();
                }
            }});

        var input = multiline.stripIndent(function (){/*
         ---
         name: "shane"
         testing: "errors"
         testing: "errors
         ---
         Testing Yaml Errors
         */});

        var page = site.addPage("index.html", input);
    });
    it("YAML errors in front matter (2)", function(done) {

        var site = crossbow.builder({
            config: {
                errorHandler: function (err) {
                    assert.equal(err._crossbow.line, 10);
                    assert.equal(err._crossbow.file, "index.html");
                    done();
                }
            }});

        var input = multiline.stripIndent(function (){/*
         ---
         name: "shane"
         testing: "errors"
         testing: "errors"
         testing: "errors"
         testing: "errors"
         testing: "errors"
         testing: "errors"
         testing: "errors"
         testing: "errors
         ---
         Testing Yaml Errors
         */});

        var page = site.addPage("index.html", input);
    });
});