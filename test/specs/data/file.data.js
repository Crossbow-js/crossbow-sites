var assert    = require("chai").assert;
var crossbow  = require("../../../index");

describe("Fetching/parsing data files", function() {

    it("JSON: should return the content + parsed data", function(done) {

        var site = crossbow.builder({config: {base: "test/fixtures"}});
        var out  = site.file.getFile({path: "_config.json"});

        assert.equal(out.data.css, "/css/main.css");
        assert.include(out.content, '"css": "/css/main.css"'); // jshint ignore:line

        done();
    });
    it("JSON: should give good errors when parsing not possible", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures",
                errorHandler: function (err) {
                    assert.equal(err._crossbow.file, "test/fixtures/_config-corrupt.json");
                    assert.equal(err._crossbow.line, 0);
                    done();
                }
            }
        });

        var out  = site.file.getFile({path: "_config-corrupt.json"});

        assert.isUndefined(out.data.css);
        assert.include(out.content, '"css": "/css/main.css'); // jshint ignore:line

    });

    it("YAML: should return the content + parsed data", function(done) {

        var site = crossbow.builder({config: {base: "test/fixtures"}});
        var out  = site.file.getFile({path: "_config.yml"});

        assert.equal(out.data.css, "/css/main.css");
        assert.include(out.content, 'css: "/css/main.css"'); // jshint ignore:line

        done();
    });
    it("YAML: should give good errors when parsing not possible", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures",
                errorHandler: function (err) {
                    assert.equal(err._crossbow.file, "test/fixtures/_config-corrupt.yml");
                    assert.equal(err._crossbow.line, 3);
                    done();
                }
            }
        });

        var out  = site.file.getFile({path: "_config-corrupt.yml"});

        assert.isUndefined(out.data.css);
        assert.include(out.content, 'css "/css/main.css"'); // jshint ignore:line
    });
    it("YAML: pickup site data when a string given for site: option", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures"
            }
        });

        site.compile({
            key: "docs.html",
            content: "{{site.css}}",
            data: {
                site: "file:_config.yml"
            },
            cb: function (err, out) {
                assert.equal(out.get("compiled"), "/css/main.css");
                done();
            }
        });

    });
});