var assert    = require("chai").assert;
var path      = require("../../../lib/core/path");
var crossbow  = require("../../../index");

describe("Inline file data helper", function() {

    it("should put in a file when file:config.yml syntax", function(done) {

        var site = crossbow.builder({
            config: {
                cwd: "test/fixtures"
            },
            data: {
                site: "file:_config.yml"
            }
        });

        var string = ":{{site.css}}:";

        var page = site.add({key: "index.html", content: string});

        site.freeze();

        site.compile({
            item: page,
            cb: function (err, out) {
                if (err) {
                    done(err);
                }
                assert.equal(out.get("compiled"), ":/css/main.css:");
                done();
            }
        });
    });
    it("should put any file when file:config.yml syntax", function(done) {

        var site = crossbow.builder({
            config: {
                cwd: "test/fixtures"
            },
            data: {
                cats: "file:_config.yml",
                site: "file:_config.json"
            }
        });

        var string = ":{{cats.css}}:{{site.css}}";

        var page = site.add({key: "index.html", content: string});

        site.freeze();

        site.compile({
            item: page,
            cb: function (err, out) {
                assert.equal(out.get("compiled"), ":/css/main.css:/css/main.css");
                done();
            }
        });
    });
    it("should put any file when file:config.yml syntax", function(done) {

        var site = crossbow.builder({
            config: {
                cwd: "test/fixtures"
            },
            data: {
                cats: "file:_config.yml"
            }
        });

        var string = ":{{cats.css}}:{{site.css}}";

        var page = site.add({key: "index.html", content: string});

        site.freeze();

        site.compile({
            item: page,
            data: {
                site: "file:_config.json"
            },
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.equal(out.get("compiled"), ":/css/main.css:/css/main.css");
                done();
            }
        });
    });
});