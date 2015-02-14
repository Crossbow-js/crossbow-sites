var yaml  = require("../yaml");
var utils = require("../utils");
var url   = require("../url");

/**
 *
 */
function input (compiler) {
    return function addPage (opts) {
        return compiler.cache.add(
            compiler.preProcess(opts.key, opts.content)
                .withMutations(function (item) {
                    promoteFrontVars(item, compiler.config);
                    addMissingUrl(item, compiler.config);
                    addMissingTitle(item);
                    addMissingType(item);
                })
        );
    };
}

/**
 * @param {Compiler} compiler
 * @returns {Function}
 */
module.exports = function (compiler) {
    return function addPage (key, string) {
        return compiler.cache.add(
            compiler.preProcess(key, string)
                .withMutations(function (item) {
                    promoteFrontVars(item, compiler.config);
                    addMissingUrl(item, compiler.config);
                    addMissingTitle(item);
                    addMissingType(item);
                })
        );
    };
};

module.exports.hooks = {
    "types": {
        name: "page",
        input: input
    }
};

/**
 * @param item
 */
function promoteFrontVars(item, config) {
    item.mergeDeep(item.get("front"));
}

/**
 * Add a faux title if not in front matter
 * @param item
 */
function addMissingTitle (item) {
    if (!item.getIn(["front", "title"])) {
        item.set("title",
            utils.deslugify(
                item.getIn(["path", "name"])
            )
        );
    }
}

/**
 * Default to a type of "page"
 * @param item
 */
function addMissingType (item) {
    if (!item.getIn(["front", "type"])) {
        item.set("type", "page");
    }
}

/**
 * Default to a type of "page"
 * @param item
 * @param config
 */
function addMissingUrl (item, config) {
    item.set("url", url.keyToUrl(item.get("key"), config));
}