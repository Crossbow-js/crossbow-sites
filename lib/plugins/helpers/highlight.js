var utils     = require("../../utils");
var markdown  = require("../markdown");
var path      = require("path");

/**
 * @param getFile
 * @param emitter
 * @returns {Function}
 */
module.exports = function (getFile, log, dust) {

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

                return chunk.capture(bodies.block, context, function (string, chunk) {
                    // If no lang, just escape the content and wrap in pre+code
                    if (!params.lang) {
                        return chunk.end(
                            utils.wrapCode(
                                dust.filters["h"](string)
                            )
                        );
                    }

                    // If a lang, just highlight it
                    return chunk.end(
                        utils.wrapCode(
                            markdown.highlight(string, params.lang), params.lang
                        )
                    );
                });
            }
        }

        // If there's no block, just return the chunk
        return chunk;
    };
};