
var _         = require("lodash");
var assert    = require("chai").assert;
var multiline = require("multiline");
var sinon     = require("sinon");
var fs        = require("fs");
var crossbow = require("../../../index");

describe("Simple mode", function(){

    it("Replaces Vars", function(done) {

        var page1 = multiline(function(){/*
{{#md}}
#shane is awesome, kittie is a {{kittie}}
{{/md}}
         */});

        crossbow.compile({
            key: "docs.html",
            content: page1,
            data: {
                kittie: "cat"
            },
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.include(out.compiled, "shane is awesome, kittie is a cat");
                done();
            }
        });
    });
});