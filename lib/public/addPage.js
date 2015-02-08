var yaml        = require("../yaml");
var Page        = require("../page");

/**
 * @param {Compiler} compiler
 * @returns {Function}
 */
module.exports = function (compiler) {

    return function addPage (key, string) {
        return compiler.cache.add(compiler.preProcess(key, string));
    };
};