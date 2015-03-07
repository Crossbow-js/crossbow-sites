var utils = require("../utils");
var url   = require("../url");

/**
 * @type {{types: {name: string, input: input}}}
 */
module.exports.hooks = {
    "frozenTransforms": [
        {
            when: "before freeze",
            fn: function () {}
        }
    ],
    "types": {
        name:  "page",
        input: input
    }
};

function createPage(opts, compiler) {
    return compiler.preProcess(opts)
        .withMutations(function (item) {
            promoteFrontVars(item, compiler.config);
            addMissingUrl(item, compiler.config);
            addMissingTitle(item);
            addMissingType(item);
        });
}

/**
 * Handle page input
 */
function input (compiler) {
    return function addPage (opts) {
        return compiler.cache.add(
            createPage(opts, compiler)
        );
    };
}

/**
 * @param item
 */
function promoteFrontVars(item) {
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