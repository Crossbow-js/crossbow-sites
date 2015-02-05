var path = require("path");
var _    = require("lodash");

/**
 * @type {{getBaseName: getBaseName, stripExtension: stripExtension, makePostUrl: makePostUrl, extractDateFromKey: extractDateFromKey, makePageUrl: makePageUrl, completeUrl: completeUrl, completePath: completePath}}
 */
module.exports = {
    extractDateFromKey: extractDateFromKey,
    stripExtension:     stripExtension,
    getBaseName:        getBaseName,
    makePostUrl:        makePostUrl,
    makePageUrl:        makePageUrl,
    completeUrl:        completeUrl,
    completePath:       completePath,
    makeShortKey:       makeShortKey
};

/**
 * @param key
 * @returns {*|XML|string|void}
 */
function getBaseName(key) {
    return path.basename(key, path.extname(key));
}

/**
 * Create short keys to be used as unique Identifiers.
 * In:  _posts/post1.md
 * Out: posts/post1.md
 * @param {String} key
 * @returns {String}
 * @param cwd
 */
function makeShortKey(key, cwd) {
    return path.relative(cwd || process.cwd(), key);
}

/**
 * @param key
 * @returns {*}
 */
function stripExtension(key) {
    return key.replace(path.extname(key), "");
}

/**
 * Create a URL based off a short-key.
 *
 * EG: given: posts/js/post1.md
 *     out:   { fileName: "js/post1.html", url: "/js/post1.md" }
 *
 * @param {String} key - Short-key like `posts/js/post1.md` or `includes/footer.html`
 * @param {Object} [config]
 * @param {Array} [categories]
 * @returns {{filePath: string, url: string}}
 */
function makePostUrl(key, config, categories) {

    var split      = extractDateFromKey(getTempUrl(key, config.get("cwd")));
    var formatUrl  = getUrlFormatter(config.get("prettyUrls"));

    if (hasSubDirs(key)) {
        return formatUrl(
            makeSubDirUrl(config.get("postUrlFormat"), split.date, split.url, categories),
            split.date
        );
    }

    return formatUrl(makeTopLevelUrl(split.url, split.url), split.date);
}

/**
 * @param {String} item
 * @returns {*}
 */
function addExtension(item) {
    return item.match(/\.html$/)
        ? item
        : item + ".html";
}

/**
 * @param pretty
 * @returns {Function}
 */
function getUrlFormatter (pretty) {

    return function (item, date) {
        if (pretty) {
            item.filePath = addIndex(item.filePath);
        } else {
            item.filePath = addExtension(item.filePath);
            item.url      = addExtension(item.url);
        }

        // Add date
        if (date) {
            item.date     = date;
        }

        return item;
    };
}

/**
 * @returns {string}
 * @param filePath
 */
function addIndex(filePath) {
    return filePath.match(/\/?index\.html/)
        ? filePath
        : filePath + "/index.html";
}

/**
 * @param key
 * @returns {*}
 */
function hasSubDirs(key){
    return key.match(/(.+)\//);
}

/**
 * @param filePath
 * @param url
 * @returns {{filePath: *, url: *}}
 */
function makeTopLevelUrl(filePath, url) {
    return {
        filePath: completePath(filePath),
        url: completeUrl(url),
        baseName: path.basename(filePath)
    };
}
/**
 * @param format
 * @param date
 * @param title
 * @param categories
 */
function makeSubDirUrl(format, date, title, categories) {

    var filePath = title + ".html";
    var url      = title + ".html";
    var ext      = ".html";

    if (format) {
        filePath = replaceSections(format, title, getReplacers(date, title, categories));
        url = filePath;
    }

    return makeTopLevelUrl(filePath, url);
}
/**
 * @param key
 * @param cwd
 * @returns {*}
 */
function getTempUrl (key, cwd) {

    key = key.replace(cwd, "");
    key = key.replace(/^\/?_?posts\//, "");

    return stripExtension(key);
}

/**
 *
 * @param date
 * @param title
 * @param categories
 * @returns {{pretty: *}}
 */
function getReplacers (date, title, categories) {

    var obj = {
        ":title":      title,
        ":filename":   title
    };

    if (date) {
        obj[":month"] = getMonth(date);
        obj[":year"]  = getYear(date);
        obj[":day"]   = getDay(date);
    }

    if (categories && categories.length) {
        obj[":categories"] = getCategories(categories);
        obj[":category"]   = getCategories(categories);
    }

    return obj;
}

/**
 * Remove any url sections that don't exist
 * EG: /blog/:kats/:title -> /blog/:title
 * @param template
 * @param replacers
 * @returns {string}
 */
function filterReplacements(template, replacers) {
    return template.split("/").filter(function (item) {
        if (item.match(/^:/)) {
            return replacers[item];
        } else {
            return item.length;
        }
    }).join("/");
}

/**
 * @param template
 * @param initial
 * @param replacers
 * @returns {*}
 */
function replaceSections(template, initial, replacers) {

    template = filterReplacements(template, replacers);

    _.each(replacers, function (value, key) {
        template = template.replace(key, value);
    });

    return template;
}

function getMonth(key) {
    return key.split("-")[1];
}
function getDay(key) {
    return key.split("-")[2];
}
function getYear(key) {
    return key.split("-")[0];
}
function getCategories (items) {
    return items.map(function (item) {
        return item.slug;
    }).join("/");
}

/**
 * Remove a date from front of key.
 * Format: YYYY-MM-DD
 * EG:     2014-06-21-post1 -> {date: 2014-06-21, url: post1}
 * @param {String} url
 * @returns {{date: string, url: string}|string}
 */
function extractDateFromKey(url) {

    var match = url.match(/^(\d{4}-\d{2}-\d{2})-(.+)/);

    var date;
    var tempUrl = url;

    if (match && match.length) {
        date = match[1];
        tempUrl = match[2];
    }

    return {
        date: date,
        url: tempUrl
    };
}

/**
 * @param key
 * @param [config]
 * @returns {*}
 */
function makePageUrl(key, config) {

    if (_.isString(config.get("cwd"))) {
        key = key.replace(config.get("cwd"), "");
    }

    var filePath = stripExtension(key);
    var url      = stripExtension(key);

    if (hasIndex(key) && config.get("prettyUrls")) {
        filePath = filePath + ".html";
        url      = stripIndex(key);
    }

    if (isIndex(key)) {
        filePath = "index.html";
        url      = "index.html";
    }

    return getUrlFormatter(config.get("prettyUrls"))(
        makeTopLevelUrl(filePath, url)
    );
}

function stripIndex(key){
    return key.replace(/\/index\.(html|md|markdown)$/, "");
}
function isIndex(key) {
    return key.match(/^\/?index\.(html|md|markdown)$/);
}
function hasIndex(key) {
    return key.match(/(.+)\/index\.(html|md|markdown)$/);
}

/**
 * Add forward slash if it doesn't yet exist.
 * @param current
 * @returns {*}
 */
function completeUrl(current) {
    return current.match(/^\//)
        ? current
        : "/" + current;
}

/**
 * Remove any forward slashes from file-paths
 * @param current
 * @returns {*}
 */
function completePath(current) {
    return current.replace(/^\//, "");
}


