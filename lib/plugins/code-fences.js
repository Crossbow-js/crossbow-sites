var utils = require("../utils");

/**
 * Escape code-fences automatically
 * @param out
 * @param {Immutable.map} config
 * @returns {*|XML|string|void}
 */
function codeFences (content, item, config) {
    return utils.escapeInlineCode(utils.escapeCodeFences(content));
}

module.exports = codeFences;