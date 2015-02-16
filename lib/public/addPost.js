var yaml   = require("../yaml");
var utils  = require("../utils");
var moment = require("moment");
var url    = require("../url");
var path   = require("../core/path");

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

function input (compiler) {
    return function addPage (opts) {
        return compiler.cache.add(
            compiler.preProcess(opts)
                .withMutations(function (item) {
                    promoteFrontVars(item, compiler.config);
                    updateFilePaths(item, compiler.config);
                    addDate(item);
                    finaliseUrlsAndPaths(item, compiler.config);
                    addMissingTitle(item);
                    addMissingType(item);
                })
        );
    };
}

/**
 * Handle page input
 */
function addDate(item) {
    if (item.get("date")) {
        item.set("timestamp", item.get("date").getTime());
    } else {
        var stat = item.get("stat");
        if (stat) {
            item.set("date", stat.get("ctime"));
            item.set("timestamp", stat.get("ctime").getTime());
        } else {
            var date = new Date();
            item.set("date", date);
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
        item.set("date", date);
        basename = match[2];
        item.setIn(["path", "name"], basename);
    }

    item.set("filename", basename);
    item.set("filepath", filepath);
}