var _         = require("lodash");
var assert    = require("chai").assert;
var multiline = require("multiline");
var sinon     = require("sinon");
var path      = require("../../../lib/core/path");
var fs        = require("fs");
var crossbow = require("../../../index");

describe("Fetching/parsing data files", function() {

    it("should return the content + parsed data", function(done) {

        var site = crossbow.builder({config: {cwd: "test/fixtures", logLevel: "debug"}});
        var out  = site.file.getFile({path: "_config.json"});

        assert.equal(out.data.css, "/css/main.css");
        assert.include(out.content, '"css": "/css/main.css"'); // jshint ignore:line

        done();
    });
    it("should give good errors when parsing not possible", function(done) {

        var site = crossbow.builder({
            config: {
                cwd: "test/fixtures",
                errorHandler: function (err) {
                    assert.equal(err._crossbow.file, "test/fixtures/_config-corrupt.json");
                    assert.equal(err._crossbow.line, 0);
                    site.logger.error(site.getErrorString(err));
                    done();
                }
            }
        });

        var out  = site.file.getFile({path: "_config-corrupt.json"});

        assert.isUndefined(out.data.css);
        assert.include(out.content, '"css": "/css/main.css'); // jshint ignore:line

    });
});