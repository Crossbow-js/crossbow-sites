var assert    = require("chai").assert;
var crossbow = require("../../index");

describe("Current helper", function() {

    it("Outputs a match", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures"
            },
            data: {
                urls: ["/index.html", "/about.html"]
            }
        });

        var item = site.add({key: "index.html", content: ":{{#current '/index.html'}}Should{{/current}}: {{page.url}}"});

        site.freeze();

        site.compile({
            item: item,
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.include(out.get("compiled"), ':Should:'); // jshint ignore:line
                done();
            }
        });
    });
    it("Does not output when not match", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures"
            },
            data: {
                urls: ["/index.html", "/about.html"]
            }
        });

        var item = site.add({key: "index.html", content: ":{{#current '/about.html'}}Should{{/current}}: {{page.url}}"});

        site.freeze();

        site.compile({
            item: item,
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.include(out.get("compiled"), '::'); // jshint ignore:line
                done();
            }
        });
    });
});