var crossbow  = require("../../../plugins/stream");
var through   = require("through2");
var assert    = require("chai").assert;
var fs        = require("vinyl-fs");
var path      = require("path");

describe("Site config: inline OBJ given", function() {
    var files = [];
    before(function (done) {
        crossbow.clearCache();
        fs.src("test/fixtures/index.html")
            .pipe(crossbow({
                cwd: "test/fixtures",
                siteConfig: {
                    css: "css/main.css"
                }
            }))
            .pipe(through.obj(function (file, enc, next) {
                files.push(file);
                next();
            }, function (cb) {
                cb();
                done();
            }));
    });
    it("should have access to vars from siteConfig", function() {
        var string = files[0]._contents.toString();
        assert.equal(files.length, 1);
        assert.equal(files[0].path, "index.html");
        assert.include(string, 'href="css/main.css"'); //jshint ignore:line
    });
});

describe("Site config: JSON file path given", function() {
    var files = [];
    before(function (done) {
        crossbow.clearCache();
        fs.src("test/fixtures/index.html")
            .pipe(crossbow({
                cwd: "test/fixtures",
                siteConfig: "test/fixtures/_config.json"
            }))
            .pipe(through.obj(function (file, enc, next) {
                files.push(file);
                next();
            }, function (cb) {
                cb();
                done();
            }));
    });
    it("should have access to vars from siteConfig", function() {
        var string = files[0]._contents.toString();
        assert.equal(files.length, 1);
        assert.equal(files[0].path, "index.html");
        assert.include(string, 'href="css/main.css"'); //jshint ignore:line
    });
});

describe("Site config: YML file path given", function() {
    var files = [];
    before(function (done) {
        crossbow.clearCache();
        fs.src("test/fixtures/index.html")
            .pipe(crossbow({
                cwd: "test/fixtures",
                siteConfig: "test/fixtures/_config.yml"
            }))
            .pipe(through.obj(function (file, enc, next) {
                files.push(file);
                next();
            }, function (cb) {
                cb();
                done();
            }));
    });
    it("should have access to vars from siteConfig", function() {
        var string = files[0]._contents.toString();
        assert.equal(files.length, 1);
        assert.equal(files[0].path, "index.html");
        assert.include(string, 'href="css/main.css"'); //jshint ignore:line
    });
});