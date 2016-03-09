var assert    = require("chai").assert;
var crossbow  = require("../../../index");

describe("Inline file data helper (all)", function() {

    it("should put in a file when all:config.yml syntax", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures"
            },
            data: {
                site: "all:data"
            }
        });

        var string = ":{{site.home.filename}}:";

        var page = site.add({key: "index.html", content: string});

        site.freeze();

        site.compile({
            item: page,
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.equal(out.get("compiled"), ":home:");
                done();
            }
        });
    });
    it("should put in a file when all:config.yml syntax when nested", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures"
            },
            data: {
                site: "all:data"
            }
        });

        var string = ":{{site.about.about.filename}}:";

        var page = site.add({key: "index.html", content: string});

        site.freeze();

        site.compile({
            item: page,
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.equal(out.get("compiled"), ":about:");
                done();
            }
        });
    });
});
