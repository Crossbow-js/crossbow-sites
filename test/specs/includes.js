var assert    = require("chai").assert;
var crossbow  = require("../../index");

describe("Doing includes", function() {

    it("Add 1 page & compile with includes", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures"
            },
            errorHandler: function (err) {
                console.log(err);
            }
        });

        var item = site.add({key: "src/docs/index.html", content: "{{inc src='button.html' name='kittie'}}"});

        site.freeze();

        site.compile({
            item: item,
            cb: function (err, out) {
                assert.include(out.get("compiled"), "<button>kittie Button</button>");
                done();
            }
        });
    });

    it("Add 1 page & compile with includes in simple mode", function(done) {

        crossbow.compile({
            config: {
                base: "test/fixtures"
            },
            key: "src/docs/index.html",
            content: "{{inc src='button.html' name='kittie'}}",
            cb: function (err, out) {
                assert.include(out.get("compiled"), "<button>kittie Button</button>");
                done();
            }
        });
    });

    it("Add 1 page & compile without markdown", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures"
            },
            errorHandler: function (err) {
                console.log(err);
            }
        });

        var item = site.add({key: "src/docs/index.html", content: "This is not a P"});

        site.freeze();

        site.compile({
            item: item,
            cb: function (err, out) {
                assert.notInclude(out.get("compiled"), "<p>This is not a P</p>");
                assert.include(out.get("compiled"), "This is not a P");
                done();
            }
        });
    });

    it("Does an include with a HL filter", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures"
            }
        });

        var item = site.add({key: "src/docs/index.html", content: "{{inc src='_includes/button.html' filter='hl'}}"});

        site.freeze();

        site.compile({
            item: item,
            cb: function (err, out) {
                assert.include(out.get("compiled"), '<code class="html"><span class="hljs-tag">&lt;<span'); // jshint ignore:line
                done();
            }
        });
    });
    it("Does an include with a MD filter", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures",
                errorHandler: function (err) {
                    console.log(err);
                }
            }
        });

        var item = site.add({key: "src/docs/index.html", content: "{{inc src='markdown' filter='md'}}"});

        site.freeze();

        site.compile({
            item: item,
            cb: function (err, out) {
                if (err) {
                    return done(err);
                }
                //console.log(out.get("compiled"));
                //assert.include(out.get("compiled"), 'This is a title</h2>'); // jshint ignore:line
                done();
            }
        });
    });
    it("includes with correct context", function (done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures"
            },
            data: {
                buttons: ["one", "two"],
                site: {
                    title: "Crossbow"
                }
            }
        });

        var item = site.add({key: "src/docs/index.html", content: ":{{#each buttons}}{{inc src='context.html' title='Param title'}}{{/each}}:"});

        site.freeze();

        site.compile({
            item: item,
            cb: function (err, out) {
                var compiled = out.get("compiled");
                assert.include(compiled, "Site Title: Crossbow");
                assert.include(compiled, "Page Url: /src/docs/index.html");
                assert.include(compiled, "Param Title: Param title");
                done();
            }
        });
    });
});