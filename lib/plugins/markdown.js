var marked    = require("marked");
var _         = require("lodash");
var highlight = require("highlight.js");

/**
 * @type {markdownTransform}
 */
module.exports = markdownTransform;
module.exports.highlight = highlightSnippet;

/**
 * Markdown Support
 * @param out
 * @param data
 * @param config
 * @returns {*}
 */
function markdownTransform(out, data, config) {

    var item  = data.item || {};
    var front = item.front || {};

    // Always respect front-matter first
    if (!_.isUndefined(front.markdown)) {
        return front.markdown
            ? processMardownContent(out, config)
            : out;
    }

    // Next check if the filename has .md|.markdown
    if (item.key.match(/\.md|\.markdown$/i)) {
        return processMardownContent(out, config);
    }

    // Don't markdown pages, unless set in front matter
    if (item.type === "page") {
        return out;
    }

    return processMardownContent(out, config);
}


/**
 * @param string
 * @param config
 * @returns {*|exports}
 */
function processMardownContent(string, config) {

    if (!config.highlight) {
        return marked(string);
    }

    marked.setOptions({
        highlight: (function () {
            return config.markdown && config.markdown.highlight
                ? config.markdown.highlight
                : highlightSnippet;
        })()
    });

    return marked(string);
}

/**
 * @param code
 * @param [lang]
 * @returns {*}
 */
function highlightSnippet(code, lang) {

    // Never auto-highlight any block.
    if (_.isUndefined(lang)) {
        return code;
    }

    return highlight.highlight(lang, code).value;
}