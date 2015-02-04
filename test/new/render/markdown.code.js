var _         = require("lodash");
var assert    = require("chai").assert;
var multiline = require("multiline");
var sinon     = require("sinon");
var fs        = require("fs");
var crossbow = require("../../../index");

describe("Markdown render with code", function() {

    it("Can render with snippets", function(done) {

        var site = crossbow.builder();

        var page1 = site.addPage("index.md", "{{#hl lang='js'}}var shane = 'site/**/*'{{/hl}}");

        site.compile({
            item: page1,
            data: {
                site: "hello",
                kittie: "Hello from the homepage"
            },
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                require("d-logger")(out.compiled);
                assert.include(out.compiled, '<code class="js"><span class="hljs-keyword">var</span> shane = <span class="hljs-string">\'site/**/*\'</span></code>'); // jshint ignore:line
                done();
            }
        });
    });
});