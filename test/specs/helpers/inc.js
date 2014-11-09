var _           = require("lodash");
var multiline   = require("multiline");
var sinon       = require("sinon");
var fs          = require("fs");
var assert      = require("chai").assert;
var crossbow    = require("../../../index");

describe("@inc helper", function(){

    beforeEach(function () {
        crossbow.clearCache();
    });

    it("Can do simple includes with file extension", function(done) {

        var index = multiline.stripIndent(function(){/*
        Button: {{ inc src="button.html" }}
         */});

        crossbow.populateCache("button.html", "<button>Sign up</button>");

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            if (err) {
                done(err);
            }
            require("d-logger")(out.compiled);
            assert.include(out.compiled, "<button>Sign up</button>");
            done();
        });
    });
    it("Can do simple includes in nested dirs", function(done) {

        var index = multiline.stripIndent(function(){/*

         Button: {{ inc src="elems/button.html" }}

         */});

        crossbow.populateCache("elems/button.html", "<button>Sign up</button>");

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            assert.include(out.compiled, "<button>Sign up</button>");
            done();
        });
    });
    it("Can do simple includes in nested dirs (2)", function(done) {

        var index = multiline.stripIndent(function(){/*

         Button: {{ inc src="elems/1/2/3/4/5/button.html" }}

         */});

        crossbow.populateCache("elems/1/2/3/4/5/button.html", "<button>Sign up</button>");

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            assert.include(out.compiled, "<button>Sign up</button>");
            done();
        });
    });
    it("Can do simple includes in separate DIRS", function(done) {

        var index = multiline.stripIndent(function(){/*
         Button: {{ inc src="elems/button.html" }}
         Button: {{ inc src="button2.html" }}
         */});

        crossbow.populateCache("elems/button.html", "<button>Sub Dir</button>");
        crossbow.populateCache("button2.html", "<button>Top level</button>");

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            if (err) {
                done(err);
            }
            assert.include(out.compiled, "<button>Sub Dir</button>");
            assert.include(out.compiled, "<button>Top level</button>");
            require("d-logger")(out.compiled);
            done();
        });
    });
    it("Can do simple includes in other DIRS", function(done) {

        var existsStub = sinon.stub(fs, "existsSync");
        var fsStub     = sinon.stub(fs, "readFileSync").returns("hi");
        existsStub.withArgs("_scss/main.scss").returns(true);


        var index = multiline.stripIndent(function(){/*

         {{ inc src="_scss/main.scss" }}

         */});

        crossbow.emitter.on("log", function (err) {
//            console.log(err);
        });

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {}, function (err, out) {

            assert.include(out.compiled, "hi");
            fs.existsSync.restore();
            fs.readFileSync.restore();
            done();
        });
    });
    it("Can do simple includes in loops", function(done) {

        var index = multiline(function(){/*
{{#site.names}}
{{ inc src="button.html" name=. prefix="btn" }}
{{/site.names}}
*/});

        crossbow.populateCache("button.html", "<button>{{prefix}}-{{name}}</button>");

        var page = crossbow.addPage("index.html", index, {});

        var config = {
            siteConfig: {
                names: ["shane", "kittie"],
                title: "oh yeah"
            }
        };

        crossbow.compileOne(page, config, function (err, out) {
            if (err) {
                done(err);
            }
            require("d-logger")(out.compiled);
            assert.include(out.compiled, "<button>btn-shane</button>");
            assert.include(out.compiled, "<button>btn-kittie</button>");
            done();
        });
    });
    it("Can do simple includes in loops with $idx", function(done) {

        var index = multiline(function(){/*
{{#each site.names}}
{{ inc src="{{tmpl}}.html" name=. prefix="btn" number="Example: {{$idx1}}" }}
{{/each}}
*/});

        crossbow.populateCache("button.html", "<button>{{prefix}}-{{name}} {{number}}</button>");

        var page = crossbow.addPage("index.html", index, {});

        var config = {
            siteConfig: {
                names: ["shane", "kittie"],
                title: "oh yeah",
                tmpl: "button"
            }
        };

        crossbow.compileOne(page, config, function (err, out) {
            if (err) {
                done(err);
            }
            require("d-logger")(out.compiled);
            assert.include(out.compiled, "<button>btn-shane Example: 1</button>");
            assert.include(out.compiled, "<button>btn-kittie Example: 2</button>");
            done();
        });
    });
});