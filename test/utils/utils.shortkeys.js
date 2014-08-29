var assert      = require("chai").assert;
var _           = require("lodash");
var makeShortKey = require("../../lib/url").makeShortKey;
var tests = [
    {
        key:        "posts/post1.md",
        expected:   "posts/post1.md",
        message:    "from relative"
    },
    {
        key:        "/posts/post1.md",
        expected:   "/posts/post1.md",
        message:    "from relative"
    },
    {
        key:        "index.html",
        expected:   "index.html",
        message:    "from relative"
    },
    {
        key:        "about-us.html",
        expected:   "about-us.html",
        message:    "from relative"
    },
    {
        key:        "projects/about-us.html",
        expected:   "projects/about-us.html",
        message:    "with sub-dir"
    },
    {
        key:        "_includes/head.html",
        expected:   "includes/head.html",
        message:    "includes: default dir"
    },
    {
        key:        "_includes/more/head.html",
        expected:   "includes/more/head.html",
        message:    "includes: two levels deep"
    },
    {
        key:        "_snippets/func.js",
        expected:   "snippets/func.js",
        message:    "includes: default snippet dir"
    },
    {
        key:        "_snippets/js/func.js",
        expected:   "snippets/js/func.js",
        message:    "includes: default snippet dir"
    },
    {
        key:        "_posts/post_de_.md",
        expected:   "posts/post_de_.md",
        message:    "post in default dir"
    },
    {
        key:        "_posts/js/post.md",
        expected:   "posts/js/post.md",
        message:    "post in sub-dir"
    }
];


describe("Creating shortkeys", function(){
    tests.forEach(function (item, i) {
        it(item.message, function(){
            var actual   = makeShortKey(item.key, item.config);
            assert.deepEqual(actual, item.expected, "test: " + i + " - " + item.message);
        });
    });
});

