var yaml  = require("../yaml");
var utils = require("../utils");
var url   = require("../url");

/**
 * @param {Compiler} compiler
 * @returns {Function}
 */
module.exports = function (compiler) {
    return function addPartial (key, string) {
        return compiler.cache.add(
            compiler.preProcess(key, string)
                .withMutations(function (item) {
                    addMissingType(item);
                })
        );
    };
};

/**
 * Default to a type of "partial"
 * @param item
 */
function addMissingType (item) {
    item.set("type", "partial");
}