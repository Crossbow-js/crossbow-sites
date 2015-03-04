var marked     = require("marked");
var highlight  = require("highlight.js");
var utils      = require("../utils");
var codeFences = require("../plugins/code-fences");

/**
 * Markdown Support
 * @param {{item: Map}} opts
 * @returns {*}
 */
var markdownTransform = function (opts) {

    var item     = opts.item;
    var content  = opts.content;
    var compiler = opts.compiler;
    var front    = item.get("front").toJS() || {};

    /**
     * Always look at front-matter args first
     */
    if (!utils.isUndefined(front.markdown)) {
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
                : function (code, lang) {
                    return highlightSnippet(code, lang, compiler);
                };
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
function highlightSnippet (code, language, compiler) {

    // Never auto-highlight any block.
    if (utils.isUndefined(language) || language === "") {
        return code;
    }

    var supportedLang = highlight.getLanguage(language);

    if (!supportedLang) {
        var msg = "Language `"+language+"` not supported by Highlight.js. ";
        msg    += "You should ask them to support it - https://github.com/isagalaev/highlight.js";
        var err = new Error(msg);
        err._type = "highlight:type";
        err._crossbow = {
            file: compiler.item.get("key"),
            message: msg
        };
        compiler.error(err);
        return code;
    }

    return highlight.highlight(language, code).value;
}

/**
 * @param {{params: object, content: string}} opts
 * @returns {string}
 */
function highlightString (opts, compiler) {

    var lang = utils.getLang(opts.params);

    var highlighted = highlightSnippet(
        opts.content,
        lang,
        compiler
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
            when: "before layouts",
            fn:   markdownTransform
        },
        {
            when: "before templates",
            fn:   codeFences
        }
    ],
    filters: {
        "md": processMardownContent,
        "hl": highlightString
    }
};
