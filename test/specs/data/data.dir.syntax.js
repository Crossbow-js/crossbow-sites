var assert    = require("chai").assert;
var crossbow  = require("../../../index");

describe("Inline file data helper (dir)", function() {

    it("should put in a file when dir:data syntax", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures"
            },
            data: {
                staff: "dir:data/staff"
            }
        });

        var string = ":{{#each staff}}{{this.name}}{{/each}}:";

        var page = site.add({key: "index.html", content: string});

        site.freeze();

        site.compile({
            item: page,
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                assert.equal(out.get("compiled"), ":Shane OsbourneSimon Clarke:");
                done();
            }
        });
    });
});
