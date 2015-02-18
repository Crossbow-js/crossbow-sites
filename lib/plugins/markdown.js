var marked     = require("marked");
var _          = require("lodash");
var highlight  = require("highlight.js");
var utils      = require("../utils");
var codeFences = require("../plugins/code-fences");

/**
 * Markdown Support
 * @param {{item: Map}} opts
 * @returns {*}
 */
var markdownTransform = function (opts, compiler) {

    var item    = opts.item;
    var content = item.get("compiled");
    var front   = item.get("front").toJS() || {};

    /**
     * Always look at front-matter args first
     */
    if (!_.isUndefined(front.markdown)) {
        return front.markdown
            ? processMardownContent({content: content}, compiler)
            : content;
    }

    /**
     * Has the flag been set to false in global config?
     */
    if (!compiler.config.get("markdown")) {
        return content;
    }

    /**
     * Finally, has this file got an MD/markdown filename?
     */
    if (item.getIn(["path", "ext"]).match(/\.md|\.markdown$/i)) {
        return processMardownContent({content: content}, compiler);
    }

    return content;
};

/**
 * @type {markdownTransform}
 */
module.exports           = markdownTransform;

/**
 * @param {{content: string}} opts
 * @param {Compiler} compiler
 * @returns {string}
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

/**
 * @param {{params: object, content: string}} opts
 * @returns {string}
 */
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
