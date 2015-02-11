var yaml  = require("../yaml");
var Page  = require("../page");
var utils = require("../utils");
var url   = require("../url");

/**
 * @param {Compiler} compiler
 * @returns {Function}
 */
module.exports = function (compiler) {
    return function addPage (key, string) {
        return compiler.cache.add(
            compiler.preProcess(key, string)
                .withMutations(function (item) {
                    addMissingUrl(item, compiler.config);
                    addMissingTitle(item);
                    addMissingType(item);
                })
        );
    };
};

/**
 * Add a faux title if not in front matter
 * @param item
 */
function addMissingTitle (item) {
    if (!item.getIn(["front", "title"])) {
        item.set("title",
            utils.deslugify(
                url.getBaseName(item.get("url"))
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
    item.set("url", url.makePageUrl(item.get("key"), config).url);
}