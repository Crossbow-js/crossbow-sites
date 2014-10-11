var utils     = require("../../utils");
var markdown  = require("../markdown");
var dust      = require("dustjs-helpers");
var path      = require("path");

/**
 * @param getFile
 * @param log
 */
module.exports = function (getFile, log) {

    /**
     * @param chunk
     * @param context
     * @param bodies
     * @param params
     * @returns {*}
     */
    return function (chunk, context, bodies, params) {

        var file;
        var lang    = params.lang;
        var templateName = context.getTemplateName();
        var out;

        if (params.src) {
            if (file = getFile(params.src)) {
                if (!params.lang) {
                    lang = path.extname(params.src).replace(".", "");
                }
                return chunk.write(
                    utils.wrapCode(
                        markdown.highlight(file, lang), lang
                    )
                );
            } else {
                log("warn", "File not found: " + params.src, templateName);
            }
        } else {

            if (bodies.block) {
                return chunk.capture(
                    bodies.block,
                    context,
                    captureBlock.bind(null, params.lang)
                );
            }
        }

        // If there's no block, just return the chunk
        return chunk;
    };
};

/**
 *
 * @param string
 * @param chunk
 * @param lang
 * @returns {*}
 */
function captureBlock(lang, string, chunk) {

    var out;
    // If no lang, just escape the content and wrap in pre+code
    if (!lang) {
        out = dust.filters["h"](string);
    } else {
        out = markdown.highlight(string, lang);
    }

    // If a lang, just highlight it
    chunk.end(
        utils.wrapCode(
            out, lang
        )
    );
}