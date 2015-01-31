var utils = require("../utils");

/**
 * Escape code-fences automatically
 * @param out
 * @param {Immutable.map} config
 * @returns {*|XML|string|void}
 */
function codeFences (out, item, config) {
    return utils.escapeInlineCode(utils.escapeCodeFences(out));
}

module.exports = codeFences;