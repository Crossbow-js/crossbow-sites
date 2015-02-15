var assert    = require("chai").assert;
var path      = require("../../../lib/core/path");
var crossbow  = require("../../../index");

describe("Inline data helper", function() {

    it("should allow access to some date via a file", function(done) {

        var site = crossbow.builder({
            config: {
                cwd: "test/fixtures"}
        });

        var string = ":{{#data src='_config.yml' as='config'}}{{config.css}}{{/data}}:{{config.css}}";

        var page = site.add({key: "index.html", content: string});

        site.freeze();

        site.compile({
            item: page,
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                //require("d-logger")(out.get("compiled"));
                assert.equal(out.get("compiled"), ":/css/main.css:");
                done();
            }
        });
    });
    it("should give good errors if params missing", function(done) {

        var site = crossbow.builder({
            config: {
                cwd: "test/fixtures",
                errorHandler: function (err) {
                    assert.equal(err._crossbow.line, 1);
                    assert.equal(err._crossbow.column, 1);
                    site.logger.error(site.getErrorString(err));
                }
            }
        });

        var string = ":{{#data src='_config.yml'}}{{config.css}}{{/data}}:";

        var page = site.add({key: "index.html", content: string});

        site.freeze();

        site.compile({
            item: page,
            cb: function (err, out) {
                assert.include(out.get("compiled"), "Crossbow WARNING:");
                done();
            }
        });
    });

    it("should give good errors if file is missing", function(done) {

        var site = crossbow.builder({
            config: {
                cwd: "test/fixtures"
            }
        });

        var string = ":{{#data src='_sconfig.yml' as='config'}}{{config.css}}{{/data}}:";

        var page = site.add({key: "index.html", content: string});

        site.freeze();

        site.compile({
            item: page,
            cb: function (err, out) {
                assert.include(out.get("compiled"), "Include not found: _sconfig.yml");
                done();
            }
        });
    });
});