var assert      = require("chai").assert;
var url         = require("../../lib/url");
var makePostUrl = url.makePostUrl;

describe("Creating Post URLS from keys", function () {

    describe("when NO `postUrlFormat` config provided", function(){

        it("replaces filename, 1 level deep", function () {

            var config = {};

            var actual = makePostUrl("posts/post1.md", config);

            var expected = {
                filePath: "post1.html",
                url: "/post1.html"
            };

            assert.deepEqual(actual, expected);
        });
        it("replaces filename, 2 levels deep", function () {

            var config = {};

            var actual = makePostUrl("posts/js/post1.md", config);

            var expected = {
                filePath: "js/post1.html",
                url: "/js/post1.html"
            };

            assert.deepEqual(actual, expected);
        });
        it("replaces filename, 5 levels deep", function () {

            var config = {};

            var actual = makePostUrl("posts/js/node/javascript/cats/post1.md", config);

            var expected = {
                filePath: "js/node/javascript/cats/post1.html",
                url: "/js/node/javascript/cats/post1.html"
            };

            assert.deepEqual(actual, expected);
        });
    });

    describe("Using & Removing date prefix", function () {

        it("always extracts the date from front of key", function(){

            var config = {};

            var actual = makePostUrl("posts/2014-06-21-post1.md", config);

            var expected = {
                filePath: "post1.html",
                url: "/post1.html"
            };

            assert.deepEqual(actual, expected);
        });
        it.skip("Can use the date as part of URL structure", function(){

            var config = {};

            var actual = makePostUrl("posts/2014-06-12-post1.md", config);

            var expected = {
                filePath: "post1.html",
                url: "/post1.html"
            };

            assert.deepEqual(actual, expected);
        });
    });

    describe("when `:pretty` given in postUrlFormat", function(){

        it("Replaces filename with pretty, 1 level deep", function () {

            var config = {
                postUrlFormat: "/:pretty"
            };

            var actual = makePostUrl("posts/post1.md", config);

            var expected = {
                filePath: "post1/index.html",
                url: "/post1"
            };

            assert.deepEqual(actual, expected);
        });
        it("Replaces filename with pretty, 2 levels deep", function () {

            var config = {
                postUrlFormat: "/:pretty"
            };

            var actual = makePostUrl("posts/js/post1.md", config);

            var expected = {
                filePath: "js/post1/index.html",
                url: "/js/post1"
            };

            assert.deepEqual(actual, expected);
        });
        it("Uses prefixes given in `postUrlFormat` option", function () {

            var config = {
                postUrlFormat: "/blog/:pretty"
            };

            var actual = makePostUrl("posts/js/post1.md", config);

            var expected = {
                filePath: "blog/js/post1/index.html",
                url: "/blog/js/post1"
            };

            assert.deepEqual(actual, expected);
        });
    });
});