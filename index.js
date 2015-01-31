var crossbow = require("./lib/_crossbow");
var merge    = require("./lib/config").merge;

/**
 * Simple compiler with no state
 * @returns {*}
 */
function compile (opts) {

    opts.config            = opts.config || {};
    opts.config.simpleMode = true;
    opts.cb                = opts.cb || function () { /*noop*/ };

    return crossbow.
        Compiler(merge(opts.config))
        .compile(opts);
}

module.exports.compile = compile;

/**
 *
 */
function builder (opts) {
    opts        = opts        || {};
    opts.config = opts.config || {};
    opts.cb     = opts.cb     || function () { /*noop*/ };

    return crossbow.
        Compiler(merge(opts.config));
}

module.exports.builder = builder;
