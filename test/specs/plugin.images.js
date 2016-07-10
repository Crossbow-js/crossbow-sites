var assert    = require("chai").assert;
var crossbow  = require("../../index");

describe("#imgs plugin", function() {

    it("works with relative dir", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures"
            },
            errorHandler: function (err) {
                console.log(err);
            }
        });

        var item = site.add({key: "output.html", content: `
<h1>Images</h1>
{{#imgs src="dir:images"}}
<img src="{{this.src}}">
{{/imgs}}
`});

        site.freeze();

        site.compile({
            item: item,
            cb: function (err, out) {
                console.log(out.get("compiled"));
                // assert.include(out.get("compiled"), "<img src=\"/images/favicon.png\">");
                done();
            }
        });
    });
    it("works with nested dir + width/height", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures"
            },
            errorHandler: function (err) {
                console.log(err);
            }
        });

        var item = site.add({key: "output.html", content: `
<h1>Images</h1>
{{#imgs src="dir:images/nested"}}
<img src="{{this.src}}" width="{{this.width}}" height="{{this.height}}" alt="{{this.parsed.name}}">
{{/imgs}}
`});

        site.freeze();

        site.compile({
            data: {
                items: ['kittie', 'jimbo']
            },
            item: item,
            cb: function (err, out) {
                assert.include(out.get("compiled"), '<h1>Images</h1>\n<img src="/images/nested/favicon2.png" width="32" height="32" alt="favicon2">');
                done();
            }
        });
    });
    it("Shows errors when directory not found", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures"
            },
            errorHandler: function (err) {
                console.log(err);
            }
        });

        var item = site.add({key: "output.html", content: `
<h1>Images</h1>
{{#imgs src="dir:nope"}}
<img src="{{this.src}}" width="{{this.width}}" height="{{this.height}}" alt="{{this.parsed.name}}">
{{/imgs}}
`});

        site.freeze();

        site.compile({
            data: {
                items: ['kittie', 'jimbo']
            },
            item: item,
            cb: function (err, out) {
                assert.include(out.get("compiled"), 'Directory not found: nope');
                done();
            }
        });
    });
    it("Shows errors when directory found, but no matching images were found", function(done) {

        var site = crossbow.builder({
            config: {
                base: "test/fixtures"
            },
            errorHandler: function (err) {
                console.log(err);
            }
        });

        var item = site.add({key: "output.html", content: `
<h1>Images</h1>
{{#imgs src="dir:images/no-images"}}
<img src="{{this.src}}" width="{{this.width}}" height="{{this.height}}" alt="{{this.parsed.name}}">
{{/imgs}}
`});

        site.freeze();

        site.compile({
            data: {
                items: ['kittie', 'jimbo']
            },
            item: item,
            cb: function (err, out) {
                assert.include(out.get("compiled"), 'No images found in images/no-images');
                done();
            }
        });
    });
});
