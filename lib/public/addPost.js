var yaml  = require("../yaml");
var utils = require("../utils");
var url   = require("../url");
var path  = require("../core/path");

const TYPE = "post";
const TYPE_KEY = "type:post";

/**
 * @type {{types: {name: string, input: input}}}
 */
module.exports.hooks = {
    "types": {
        name:  TYPE,
        input: input
    },
    "config": {
        dirs: {
            "type:post": "_posts"
        },
        urlFormat: {
            "type:post": "/blog/:filename"
        }
    }
};

/**
 * Handle page input
 */
function input (compiler) {
    return function addPage (opts) {
        return compiler.cache.add(
            compiler.preProcess(opts.key, opts.content)
                .withMutations(function (item) {
                    promoteFrontVars(item, compiler.config);
                    updateFilePaths(item, compiler.config);
                    addMissingUrl(item, compiler.config);
                    addMissingTitle(item);
                    addMissingType(item);
                })
        );
    };
}

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
        item.set("type", TYPE);
    }
}

/**
 * Default to a type of "page"
 * @param item
 * @param config
 */
function addMissingUrl (item, config) {
    var url = replaceSections(item, config);
    item.set("url", replaceSections(item, config));
    item.set("filepath", url.slice(1));
}

/**
 * @param item
 * @param config
 * @returns {string}
 */
function replaceSections (item, config) {

    return "/" + config.getIn(["urlFormat", TYPE_KEY])
            .split(path.sep)
            .filter(function (item) {
                return item !== "";
            })
            .map(function (section) {
                if (section[0] !== ":") {
                    return section;
                }
                return item.get(section.slice(1));
            })
            .join("/");
}

/**
 * @param item
 * @param config
 */
function updateFilePaths (item, config) {

    var dir      = config.getIn(["dirs", TYPE_KEY]);
    var filepath = path.relative(dir, item.get("filepath"));

    item.set("filename", path.basename(filepath));

    item.set("filepath", filepath);
}