var path = require("./core/path");
var utils = require("./utils");
var util = exports;

/**
 * @param filepath
 * @param config
 */
util.makeFilepath = function (filepath, config) {

    var parsed = path.parse(filepath);
    var base    = config.get("base");

    /**
     * Strip leading /
     */
    if (parsed.dir.match(/^\//)) {
        parsed.dir  = parsed.dir.slice(1);
        parsed.root = "";
    }

    /**
     * Strip base
     */
    if (utils.isString(base)) {
        var replaced   = parsed.dir.replace(base, "");
        parsed.dir = replaced.replace(/^\//, "");
    }

    /**
     * Add ext
     * @type {string}
     */
    parsed.ext  = ".html";

    /**
     * Add base
     */
    parsed.base = parsed.name + parsed.ext;

    if (config.get("prettyUrls")) {
        if (parsed.base !== "index.html") {
            parsed.dir = path.join(parsed.dir, parsed.name);
            parsed.base = "index.html";
        }
    }

    return path.format(parsed);
};

/**
 * @param filepath
 * @param config
 */
util.makeUrlpath = function (filepath, config) {

    var parsed = path.parse(filepath);
    var out;

    if (config.get("prettyUrls")) {
        if (parsed.base === "index.html") {
            out = parsed.dir;
        } else {
            out = [parsed.dir, parsed.name].join("/");
        }
    } else {
        out = [parsed.dir, parsed.base].join("/");
    }

    return out.charAt(0) === "/" ? out : "/" + out;
};

/**
 * @param key
 * @param config
 * @returns {*}
 */
util.keyToUrl = function (key, config) {
    return util.makeUrlpath(util.makeFilepath(key, config), config);
};

/**
 * Create short keys to be used as unique Identifiers.
 * In:  _posts/post1.md
 * Out: posts/post1.md
 * @param {String} key
 * @returns {String}
 * @param base
 */
util.makeShortKey = function (key, base) {
    return path.relative(base || process.cwd(), key);
};


/**
 *
 * @param date
 * @param title
 * @param categories
 * @returns {{pretty: *}}
 */
//util.getReplacers = function (date, title, categories) {
//
//    var obj = {
//        ":title":      title,
//        ":filename":   title
//    };
//
//    if (date) {
//        obj[":month"] = getMonth(date);
//        obj[":year"]  = getYear(date);
//        obj[":day"]   = getDay(date);
//    }
//
//    if (categories && categories.length) {
//        obj[":categories"] = getCategories(categories);
//        obj[":category"]   = getCategories(categories);
//    }
//
//    return obj;
//};
//
///**
// * Remove any url sections that don't exist
// * EG: /blog/:kats/:title -> /blog/:title
// * @param template
// * @param replacers
// * @returns {string}
// */
//util.filterReplacements = function (template, replacers) {
//    return template.split("/").filter(function (item) {
//        if (item.match(/^:/)) {
//            return replacers[item];
//        } else {
//            return item.length;
//        }
//    }).join("/");
//};

///**
// * @param template
// * @param initial
// * @param replacers
// * @returns {*}
// */
//function replaceSections(template, initial, replacers) {
//
//    template = filterReplacements(template, replacers);
//
//    _.each(replacers, function (value, key) {
//        template = template.replace(key, value);
//    });
//
//    return template;
//}
//
//function getMonth(key) {
//    return key.split("-")[1];
//}
//function getDay(key) {
//    return key.split("-")[2];
//}
//function getYear(key) {
//    return key.split("-")[0];
//}
//function getCategories (items) {
//    return items.map(function (item) {
//        return item.slug;
//    }).join("/");
//}

/**
 * Remove a date from front of key.
 * Format: YYYY-MM-DD
 * EG:     2014-06-21-post1 -> {date: 2014-06-21, url: post1}
 * @param {String} url
 * @returns {{date: string, url: string}|string}
 */
//util.extractDateFromKey = function (url) {
//
//    var match = url.match(/^(\d{4}-\d{2}-\d{2})-(.+)/);
//
//    var date;
//    var tempUrl = url;
//
//    if (match && match.length) {
//        date = match[1];
//        tempUrl = match[2];
//    }
//
//    return {
//        date: date,
//        url: tempUrl
//    };
//};

///**
// * Add forward slash if it doesn't yet exist.
// * @param current
// * @returns {*}
// */
//function completeUrl(current) {
//    return current.match(/^\//)
//        ? current
//        : "/" + current;
//}

///**
// * Remove any forward slashes from file-paths
// * @param current
// * @returns {*}
// */
//function completePath(current) {
//    return current.replace(/^\//, "");
//}