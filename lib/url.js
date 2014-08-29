var path = require("path");

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
 */
function makeShortKey(key) {
    return key.replace(/(.+?)?_((includes|layouts|snippets|posts|pages|data)(.+))/, "$2");
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
 * @returns {{filePath: string, url: string}}
 */
function makePostUrl(key, config) {

    var tempUrl = stripExtension(
        key.replace(/^posts\//, "")
    );

    var split = extractDateFromKey(tempUrl);
    tempUrl = split.url;

    var filePath = tempUrl;
    var url = tempUrl;

    if (key.match(/(.+)\//)) {

        if (config && config.postUrlFormat) {

            tempUrl = config.postUrlFormat
                .replace(":pretty", tempUrl);

            filePath = tempUrl + "/index.html";
            url = tempUrl;

        } else {
            filePath = tempUrl + ".html";
            url = tempUrl + ".html";
        }
    }

    return {
        filePath: completePath(filePath),
        url: completeUrl(url)
    };
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

    var basename = getBaseName(key);
    var url = key;
    var finalFilePath;
    var finalUrl;

    if (key.match(/^\/?index\.html/)) {
        return {
            "filePath": "index.html",
            "url": "/index.html"
        };
    }

    if (key.match(/(.+)\//)) { // sub dirs

        url = key.replace(/\.html$/, "");

        // check if it's an index file.
        var isIndex = url.match(/(.+?)\/index$/);

        if (isIndex) {
            finalFilePath = key;
            finalUrl = isIndex[1];
        } else {
            finalFilePath = url + "/index.html";
            finalUrl = url;
        }
    } else {

        finalFilePath = basename + "/index.html";
        finalUrl = basename;
    }

    return {
        filePath: completePath(finalFilePath),
        url: completeUrl(finalUrl)
    };
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
