var utils  = require("../utils");
var moment = require("moment");
var _ = require("lodash");
var path   = require("../core/path");
var Immutable   = require("immutable");

const TYPE = "post";
const TYPE_KEY = "type:post";

/**
 * @type {{types: {name: string, input: input}}}
 */
module.exports.hooks = {
    "frozenTransforms": [
        {
            when: "before templates",
            fn: function (opts) {
                /**
                 * Combine categories for all posts
                 * Add to global 'categories' variable
                 * @type {array}
                 */
                var metaGroup = opts.compiler.config.getIn(["groupBy", "type:post"]);
                metaGroup.forEach(function (meta) {
                    opts.frozen[meta] = utils.groupByArrayProperty(opts.compiler.frozen.posts, "_" + meta);
                });
                return opts.frozen;
            }
        },
        {
            when: "before item compile",
            fn: function (opts) {

                /**
                 * Add `categories` property to each item
                 */
                var item = opts.item;
                var metaGroup = opts.compiler.config.getIn(["groupBy", "type:post"]);

                metaGroup.forEach(function (meta) {
                    if (item.get(meta)) {
                        return;
                    }
                    item = item.set(meta, getItemGroupings({
                        item: opts.item,
                        collection: opts.compiler.frozen[meta],
                        id: "_" + meta
                    }));
                });

                return item;
            }
        }
    ],
    "types": {
        name:   TYPE,
        input:  input,
        sort:   sortByTimestamp
    },
    "config": {
        dirs: {
            "type:post": "_posts"
        },
        urlFormat: {
            "type:post": "/blog/:filename"
        },
        filters: {
            "type:post": filterDrafts
        },
        groupBy: {
            "type:post": ["categories", "tags"]
        }
    }
};

function getItemGroupings (opts) {
    /**
     * Map saved categories to each item
     * @type {array}
     */
    if (!opts.item.get(opts.id) || !opts.collection) {
        return opts.item;
    }

    var cats = [];

    opts.collection.forEach(function (cat) {
        var _cats = opts.item.get(opts.id);
        if (Immutable.List.isList(_cats)) {
            if (_cats.contains(cat.name)) {
                cats.push(cat);
            }
        } else {
            if (Array.isArray(_cats)) {
                if (_.contains(_cats, cat.name)) {
                    cats.push(cat);
                }
            }
        }
    });

    return cats;
}

/**
 *
 * @param item
 * @returns {*}
 */
function filterDrafts (item) {
    if (item.getIn(["path", "name"])[0] === "_") {
        return false;
    }
    if (item.getIn(["front", "published"]) === false) {
        return false;
    }
    return true;
}

/**
 * @param items
 * @returns {*}
 */
function sortByTimestamp (items) {
    if (items.length) {
        return items.sort(function (a, b) {
            return b.timestamp > a.timestamp;
        });
    }
    return items;
}

/**
 * @param compiler
 * @returns {Function}
 */
function input (compiler) {
    return function addPage (opts) {
        return compiler.cache.add(
            compiler.preProcess(opts)
                .withMutations(function (item) {
                    promoteFrontVars(item, compiler.config);
                    updateFilePaths(item, compiler.config);
                    addDate(item);
                    makePrettyDate(item, compiler.config);
                    finaliseUrlsAndPaths(item, compiler.config);
                    addMissingTitle(item);
                    addMissingType(item);

                    var metaGroup = compiler.config.getIn(["groupBy", "type:post"]);

                    metaGroup.forEach(function (meta) {
                        convertFrontMeta(item, meta);
                    });
                })
        );
    };
}

/**
 *
 */
function convertFrontMeta (item, key) {
    var collection = item.getIn(["front", key]);
    if (collection) {
        item.set("_" + key,
            Immutable.List(
                collection
                    .split(",")
                    .map(function (item) {
                        return item.trim();
                    })
            )
        );
    }
}

/**
 * @param item
 * @param config
 */
function makePrettyDate(item, config) {
    item.set("date", require("moment")(item.get("dateObj")).format(config.get("dateFormat")));
}

/**
 * Handle page input
 */
function addDate(item) {

    var frontDate = item.get("date");

    /**
     * has date front front matter
     */
    if (frontDate) {

        item.set("timestamp", frontDate.getTime());
        item.set("dateObj", frontDate);

    } else if (item.get("dateObj")) { // date set elsewhere

        item.set("timestamp", item.get("dateObj").getTime());

    } else {

        var stat = item.get("stat");

        if (stat) {

            item.set("dateObj", stat.get("ctime"));
            item.set("timestamp", stat.get("ctime").getTime());

        } else {

            var date = new Date();
            item.set("dateObj", date);
            item.set("timestamp", date.getTime());
        }
    }
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
        item.set("type", TYPE);
    }
}

/**
 * Default to a type of "page"
 * @param item
 * @param config
 */
function finaliseUrlsAndPaths (item, config) {

    var url      = replaceSections(item, config);
    var filepath = url.slice(1);

    item.set("url", replaceSections(item, config));

    if (config.get("prettyUrls")) {
        filepath = [filepath, "index.html"].join("/");
    }

    item.set("filepath", filepath);
}

/**
 * @param item
 * @param config
 * @returns {string}
 */
function replaceSections (item, config) {

    var out = config.getIn(["urlFormat", TYPE_KEY])
            .split(path.sep)
            .filter(function (item) {
                return item !== "";
            })
            .map(function (section) {

                if (section[0] !== ":") {
                    return section;
                }

                if (section === ":filename" && config.get("prettyUrls")) {
                    return item.getIn(["path", "name"]);
                }

                return item.get(section.slice(1));
            });

    return "/" + out.join("/");

}

/**
 * @param item
 * @param config
 */
function updateFilePaths (item, config) {

    var dir      = config.getIn(["dirs", TYPE_KEY]);

    var itempath = item.get("filepath");

    var filepath = path.relative(dir, itempath);

    var basename = path.basename(filepath);

    var match = basename.match(/^(\d{4}-\d{2}-\d{2})-(.+)/);

    if (match) {
        var date = moment(match[1])._d;
        item.set("dateObj", date);
        basename = match[2];
        item.setIn(["path", "name"], basename);
    }

    item.set("filename", basename);
    item.set("filepath", filepath);
}