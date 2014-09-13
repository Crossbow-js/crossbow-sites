var utils     = require("../../utils");
var markdown  = require("../markdown");
var path      = require("path");

/**
 * @param getFile
 * @param emitter
 * @returns {Function}
 */
module.exports = function (getFile, emitter) {

    /**
     * @param chunk
     * @param context
     * @param bodies
     * @param params
     * @returns {*}
     */
    return function (chunk, context, bodies, params) {

        var file;
        var lang = params.lang;

        if (params.src) {
            if (file = getFile(params.src)) {
                if (!params.lang) {
                    lang = path.extname(params.src).replace(".", "");
                }
                return chunk.write(utils.wrapCode(markdown.highlight(file, lang), lang));
            } else {
                emitter.emit("log", {
                    type: "warn",
                    msg: "File not found: " + params.src,
                    context: context.getTemplateName()
                });
            }
        }

        if (bodies.block) {
            return chunk.capture(bodies.block, context, function (string, chunk) {
                chunk.end(
                    utils.wrapCode(markdown.highlight(string, params.lang), params.lang)
                );
            });
        }
        // If there's no block, just return the chunk
        return chunk;
    }
};