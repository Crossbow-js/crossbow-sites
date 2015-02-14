var marked     = require("marked");
var _          = require("lodash");
var highlight  = require("highlight.js");
var utils      = require("../utils");
var codeFences = require("../plugins/code-fences");

/**
 * Markdown Support
 * @returns {*}
 */
//var markdownTransform = function (out, item, config) {
var markdownTransform = function (opts) {

    var item    = opts.item;
    var content = item.get("compiled");
    var front   = item.get("front").toJS() || {};

    // Always respect front-matter first
    if (!_.isUndefined(front.markdown)) {
        return front.markdown
            ? processMardownContent(content, config)
            : content;
    }

    // Next check if the filename has .md|.markdown
    if (item.getIn(["path", "ext"]).match(/\.md|\.markdown$/i)) {
        return processMardownContent(content, config);
    }

    return content;
};

/**
 * @type {markdownTransform}
 */
module.exports           = markdownTransform;
module.exports.highlight = highlightSnippet;

/**
 * @param string
 * @param config
 * @returns {*|exports}
 */
function processMardownContent(opts, compiler) {

    var config = compiler.config;

    if (!config.get("highlight")) {
        marked.setOptions({highlight: false});
        return marked(opts.content);
    }

    marked.setOptions({
        highlight: (function () {
            return config.markdown && config.markdown.highlight
                ? config.markdown.highlight
                : highlightSnippet;
        })()
    });

    return marked(opts.content);
}

module.exports.processMardownContent = processMardownContent;

/**
 * @param code
 * @param [lang]
 * @returns {*}
 */
function highlightSnippet(code, lang) {

    // Never auto-highlight any block.
    if (_.isUndefined(lang) || lang === "") {
        return code;
    }

    return highlight.highlight(lang, code).value;
}

function highlightString (opts) {

    var lang = utils.getLang(opts.params);

    var highlighted = highlightSnippet(
        opts.content,
        lang
    );

    if (lang === "") {
        highlighted = utils.escapeHtml(highlighted);
    }

    return utils.wrapCode(
        highlighted, lang
    );
}

module.exports.plugin = function (compiler) {
    return {};
};

module.exports.hooks = {
    contentTransforms: [
        {
           when: "before item render",
           fn:   markdownTransform
        },
        {
            when: "before item parsed",
            fn:   codeFences
        }
    ],
    filters: {
        "md": processMardownContent,
        "hl": highlightString
    }
};
