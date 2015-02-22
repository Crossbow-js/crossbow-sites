var assert    = require("chai").assert;
var crossbow  = require("../../../index");

describe("Doing Highlight includes", function() {

    it("Can highlight an external file", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures"
            }
        });

        var item = site.add({key: "src/docs/index.html", content: "{{hl src='_includes/button.html'}}"});

        site.freeze();

        site.compile({
            item: item,
            cb: function (err, out) {
                assert.include(out.get("compiled"), '<code class="html"><span class="hljs-tag">&lt;<span'); // jshint ignore:line
                done();
            }
        });
    });

    it("Can highlight a block", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures"
            }
        });

        var item = site.add({key: "src/docs/index.html", content: "Highlight: {{{{hl lang=\"js\"}}}}<button>{{showme}}</button>{{{{/hl}}}}"});

        site.freeze();

        site.compile({
            item: item,
            cb: function (err, out) {
                assert.include(out.get("compiled"), '{{showme}}'); // jshint ignore:line
                done();
            }
        });
    });

    it("Does not blow up if language not available", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures"
            }
        });

        var item = site.add({key: "_posts/docs/layout.md", content: "``` whtevs\nvar shane;\n```"});

        site.freeze();

        site.compile({
            item: item,
            cb: function (err, out) {
                //console.log(out.get("compiled"));
                assert.include(out.get("compiled"), '<pre><code class="lang-whtevs">var shane;'); // jshint ignore:line
                done();
            }
        });
    });
    it("Gives good errors if language not available", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures",
                errorHandler: function (err) {
                    assert.equal(err._crossbow.file, "_posts/docs/layout.md");
                    assert.include(err.message, "Language `whtevs` not supported by Highlight.js");
                    site.logger.error(site.getErrorString(err));
                    done();
                }
            }
        });

        var item = site.add({key: "_posts/docs/layout.md", content: "``` whtevs\nvar shane;\n```"});

        site.freeze();

        site.compile({
            item: item,
            cb: function (err, out) {}
        });
    });

    it("Gives good errors if language not available via filter", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures",
                errorHandler: function (err) {
                    console.log(err);
                    assert.equal(err._crossbow.file, "index.html");
                    assert.include(err.message, "Language `whtevs` not supported by Highlight.js");
                    return done();
                }
            }
        });

        var item = site.add({key: "index.html", content: "{{#hl lang='whtevs'}}\nvar shane;\n{{/hl}}"});

        site.freeze();

        site.compile({
            item: item,
            cb: function (err, out) {}
        });
    });
});