var assert      = require("chai").assert;
var Immutable   = require("immutable");
var url         = require("../../../lib/url");
var makePostUrl = url.makePostUrl;

describe("Creating Post URLS from keys", function () {

    describe("when NO `postUrlFormat` config provided", function(){

        it("replaces filename, 1 level deep", function () {

            var actual = makePostUrl("posts/post1.md", Immutable.Map({}));

            assert.deepEqual(actual.filePath, "post1.html");
            assert.deepEqual(actual.url, "/post1.html");
        });
        it("replaces filename, 2 levels deep", function () {

            var actual = makePostUrl("posts/js/post1.md", Immutable.Map({}));

            assert.equal(actual.filePath, "js/post1.html");
            assert.equal(actual.url, "/js/post1.html");
        });
        it("replaces filename, 5 levels deep", function () {

            var actual = makePostUrl("posts/js/node/javascript/cats/post1.md", Immutable.Map({}));

            assert.deepEqual(actual.filePath, "js/node/javascript/cats/post1.html");
            assert.deepEqual(actual.url, "/js/node/javascript/cats/post1.html");
        });
    });

    describe("Using & Removing date prefix", function () {

        it("always extracts the date from front of key", function(){

            var actual = makePostUrl("posts/2014-06-21-post1.md", Immutable.Map({}));

            assert.deepEqual(actual.filePath, "post1.html");
            assert.deepEqual(actual.url, "/post1.html");
        });
        it("Can use the title as part of URL structure", function(){

            var config = Immutable.Map({
                postUrlFormat: "/blog/:title",
                prettyUrls: false
            });

            var actual = makePostUrl("posts/2014-06-12-post1.md", config);

            assert.deepEqual(actual.filePath, "blog/post1.html");
            assert.deepEqual(actual.url, "/blog/post1.html");
        });
        it("Can use the date as part of URL structure + Pretty", function(){

            var config = Immutable.Map({
                postUrlFormat: "/blog/:year/:month/:day/:title",
                prettyUrls: true
            });

            var actual = makePostUrl("posts/2014-06-12-post1.md", config);

            assert.deepEqual(actual.filePath, "blog/2014/06/12/post1/index.html");
            assert.deepEqual(actual.url, "/blog/2014/06/12/post1");
        });
    });

    describe("when `:pretty` given in postUrlFormat", function(){

        it("Replaces filename with pretty, 1 level deep", function () {

            var config = Immutable.Map({
                postUrlFormat: "/:title",
                prettyUrls: true
            });

            var actual = makePostUrl("posts/post1.md", config);

            assert.equal(actual.filePath, "post1/index.html");
            assert.equal(actual.url, "/post1");
        });
        it("Replaces filename with pretty, 2 levels deep", function () {

            var config = Immutable.Map({
                postUrlFormat: "/:title",
                prettyUrls: true
            });

            var actual = makePostUrl("posts/js/post1.md", config);

            assert.equal(actual.filePath, "js/post1/index.html");
            assert.equal(actual.url, "/js/post1");
        });
        it("Uses prefixes given in `postUrlFormat` option", function () {

            var config = Immutable.Map({
                postUrlFormat: "/blog/:title",
                prettyUrls: true
            });

            var actual = makePostUrl("posts/js/post1.md", config);

            assert.equal(actual.filePath, "blog/js/post1/index.html");
            assert.equal(actual.url, "/blog/js/post1");

        });
    });
});