var assert        = require("chai").assert;
var getCategories = require("../../../lib/utils").getCategories;
var tests = [
    {
        tags:     "code, jquery-ui, How to guide",
        expected: [
            {
                name: "code",
                slug: "code"
            },
            {
                name: "jquery-ui",
                slug: "jquery-ui"
            },
            {
                name: "How to guide",
                slug: "how-to-guide"
            }
        ],
        message:  "Multiple tags"
    },
    {
        tags:     "code",
        expected: [
            {
                name: "code",
                slug: "code"
            }
        ],
        message:  "Multiple tags"
    }
];


describe("Creating tag object with slugs + original", function(){
    tests.forEach(function (item, i) {
        it(item.message, function(){
            var actual   = getCategories(item.tags, item.config);
            assert.deepEqual(actual, item.expected, "test: " + i + " - " + item.message);
        });
    });
});

