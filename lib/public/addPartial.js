var yaml  = require("../yaml");
var utils = require("../utils");
var url   = require("../url");

/**
 * @type {{types: {name: string, input: input}}}
 */
module.exports.hooks = {
    "types": {
        name:  "partial",
        input: input
    }
};

/**
 * @param {Compiler} compiler
 * @returns {Function}
 */
function input (compiler) {
    return function addPartial (opts) {
        return compiler.cache.add(
            compiler.preProcess(opts)
                .withMutations(function (item) {
                    addMissingType(item);
                })
        );
    };
}

/**
 * Default to a type of "partial"
 * @param item
 */
function addMissingType (item) {
    item.set("type", "partial");
}