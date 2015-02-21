var utils = require("../utils");

/**
 * Escape code-fences automatically
 * @param out
 * @param {Immutable.map} config
 * @returns {*|XML|string|void}
 */
function codeFences (opts) {
    return utils.escapeInlineCode(utils.escapeCodeFences(opts.content));
}

module.exports = codeFences;