var utils  = require("../../lib/utils");
var pad    = utils.paddLines;
var assert = require("chai").assert;

describe("Padding content", function() {
    it("does not padd with empty string", function() {
        var input  = "line 1\nline 2";
        var actual =  pad({content: input, count: 0});
        assert.equal(input, actual);
    });
    it("Does NOT padd the first line", function() {
        var input    = "line 1\nline 2";
        var actual   =  pad({content: input, count: 4});
        var expected = "line 1\n    line 2";
        assert.equal(expected, actual);
    });
    it("Pads multi lines", function () {
        var input    = "line 1\nline 2\nline3";
        var actual   =  pad({content: input, count: 4});
        var expected = "line 1\n    line 2\n    line3";
        assert.equal(expected, actual);
    });
    it("Does not stip extra new lines by default", function () {
        var input    = "line 1\nline 2\n\nline3";
        var actual   =  pad({content: input, count: 4});
        var expected = "line 1\n    line 2\n\n    line3";
        assert.equal(actual, expected);
    });
    it("Does stip extra new lines when given in config", function () {
        var input    = "line 1\nline 2\n\nline3";
        var actual   =  pad({content: input, count: 4, stripNewLines: true});
        var expected = "line 1\n    line 2\n    line3";
        assert.equal(actual, expected);
    });
});