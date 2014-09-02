var utils = require("../utils");

/**
 * Escape code-fences automatically
 * @param out
 * @param data
 * @param config
 * @returns {*|XML|string|void}
 */
function codeFences (out, data, config) {
    return utils.escapeInlineCode(utils.escapeCodeFences(out));
}

module.exports = codeFences;