var _             = require("lodash");
var multiline     = require("multiline");
var assert        = require("chai").assert;
var crossbow = require("../../index");

describe("@inc helper", function(){

    beforeEach(function () {
        crossbow.clearCache();
    });

    it("Can do simple includes with file extension", function(done) {

        var index = multiline.stripIndent(function(){/*

        Button: {@inc src="button.html" /}

         */});

        crossbow.populateCache("_includes/button.html", "<button>Sign up</button>");

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            assert.include(out.compiled, "<button>Sign up</button>");
            done();
        });
    });
    it("Can do simple includes with NO file extension", function(done) {

        var index = multiline.stripIndent(function(){/*

         Button: {@inc src="button" /}

         */});

        crossbow.populateCache("_includes/button.html", "<button>Sign up</button>");

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            assert.include(out.compiled, "<button>Sign up</button>");
            done();
        });
    });
    it("Can do simple includes in nested dirs", function(done) {

        var index = multiline.stripIndent(function(){/*

         Button: {@inc src="elems/button" /}

         */});

        crossbow.populateCache("_includes/elems/button.html", "<button>Sign up</button>");

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            assert.include(out.compiled, "<button>Sign up</button>");
            done();
        });
    });
    it("Can do simple includes in nested dirs (2)", function(done) {

        var index = multiline.stripIndent(function(){/*

         Button: {@inc src="elems/1/2/3/4/5/button" /}

         */});

        crossbow.populateCache("_includes/elems/1/2/3/4/5/button.html", "<button>Sign up</button>");

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            assert.include(out.compiled, "<button>Sign up</button>");
            done();
        });
    });
    it("Can do simple includes in separate DIRS", function(done) {

        var index = multiline.stripIndent(function(){/*

         Button: {@inc src="elems/button" /}
         Button: {@inc src="button" /}

         */});

        crossbow.populateCache("_includes/elems/button.html", "<button>Sub Dir</button>");
        crossbow.populateCache("_includes/button.html", "<button>Top level</button>");

        var page = crossbow.addPage("index.html", index, {});

        crossbow.compileOne(page, {siteConfig:{}}, function (err, out) {
            assert.include(out.compiled, "<button>Sub Dir</button>");
            assert.include(out.compiled, "<button>Top level</button>");
            done();
        });
    });
    it("Can do simple includes in loops", function(done) {

        var index = multiline.stripIndent(function(){/*

         {#site.names}
            {@inc src="button" name=. prefix="btn" /}{@sep}<br/>{/sep}{/site.names}

         */});

        crossbow.populateCache("_includes/button.html", "<button>{prefix}-{name}</button>");

        var page = crossbow.addPage("index.html", index, {});

        var config = {
            siteConfig: {
                names: ['shane', 'kittie'],
                title: "oh yeah"
            }
        };

        crossbow.compileOne(page, config, function (err, out) {
            assert.include(out.compiled, "<button>btn-shane</button><br/>");
            assert.include(out.compiled, "<button>btn-kittie</button>");
            assert.notInclude(out.compiled, "<button>btn-kittie</button><br/>");
            done();
        });
    });
});