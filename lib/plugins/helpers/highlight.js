var utils     = require("../../utils");
var markdown  = require("../markdown");

/**
 * @param chunk
 * @param context
 * @param bodies
 * @param params
 * @returns {*}
 */
module.exports = function (chunk, context, bodies, params) {
    if (bodies.block) {
        return chunk.capture(bodies.block, context, function (string, chunk) {
            chunk.end(
                utils.wrapCode(markdown.highlight(string, params.lang), params.lang)
            );
        });
    }
    // If there's no block, just return the chunk
    return chunk;
};