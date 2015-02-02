var _         = require("lodash");
var assert    = require("chai").assert;
var multiline = require("multiline");
var sinon     = require("sinon");
var fs        = require("fs");
var crossbow = require("../../../index");

describe("Markdown render", function(){
    it("does not screw code", function(done) {
        crossbow.compile({
            key: "docs.md",
            content: "#{{title}}",
            data: {
                title: "Shane"
            },
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.include(out.compiled, "<h1 id=\"shane\">Shane</h1>");
                done();
            }
        });
    });
    it("Has access to site info", function(done) {
        crossbow.compile({
            key: "docs.html",
            content: "<h1>{{site.title}}</h1>",
            data: {
                site: {
                    title: "BrowserSync.io"
                }
            },
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.include(out.compiled, "<h1>BrowserSync.io</h1>");
                done();
            }
        });
    });
});