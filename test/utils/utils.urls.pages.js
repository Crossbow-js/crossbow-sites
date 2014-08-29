var assert      = require("chai").assert;
var _           = require("lodash");
var makePageUrl = require("../../lib/url").makePageUrl;
var tests = [
    {
        key:           "index.html",
        config: {
            postUrlFormat: "pretty"
        },
        expected: {
            filePath:  "index.html",
            url:       "/index.html"
        },
        message:       "Homepage"
    },
    {
        item: {},
        key:           "about.html",
        config: {
            postUrlFormat: "pretty"
        },
        expected: {
            filePath:  "about/index.html",
            url:       "/about"
        },
        message:       "any html files in root"
    },
    {
        item: {},
        key:           "ports/page1.html",
        config: {
            postUrlFormat: "pretty"
        },
        expected: {
            filePath:  "ports/page1/index.html",
            url:       "/ports/page1"
        },
        message:       "any html files in sub-dir"
    },
    {
        item: {},
        key:           "projects/shane/index.html",
        config: {
            postUrlFormat: "pretty"
        },
        expected: {
            filePath:  "projects/shane/index.html",
            url:       "/projects/shane"
        },
        message:       "any index html files in sub-dir"
    },
    {
        item: {},
        key:           "projects/shane/kittie/monks.html",
        config: {
            postUrlFormat: "pretty"
        },
        expected: {
            filePath:  "projects/shane/kittie/monks/index.html",
            url:       "/projects/shane/kittie/monks"
        },
        message:       "any index html files in sub-dir"
    },
    {
        item: {},
        key:           "projects/shane/kittie/index.html",
        config: {
            postUrlFormat: "pretty"
        },
        expected: {
            filePath:  "projects/shane/kittie/index.html",
            url:       "/projects/shane/kittie"
        },
        message:       "any index html files in sub-dir"
    }
];


describe("Creating urls for pages", function(){
    tests.forEach(function (item) {
        it(item.message, function(){
            var actual   = makePageUrl(item.key, item.config);
            assert.deepEqual(actual, item.expected, item.message);
        });
    });
});

