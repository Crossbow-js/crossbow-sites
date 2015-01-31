
var _         = require("lodash");
var assert    = require("chai").assert;
var multiline = require("multiline");
var sinon     = require("sinon");
var fs        = require("fs");
var crossbow = require("../../../index");

describe("Simple mode", function(){

    it("highlights a block of code", function(done) {

        var page1 = multiline(function(){/*
 {{#hl lang="js"}}
 var shane = "awesome";
 {{/hl}}
         */});

        crossbow.compile({content: page1, cb: function (err, out) {
            if (err) {
                done(err);
            }
            require("d-logger")(out);
            done();
            //assert.include(out.compiled, "<pre><code class=\"js\"><span class=\"hljs-keyword\">var</span>");
        }});
    });
});