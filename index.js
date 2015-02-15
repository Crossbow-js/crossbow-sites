var crossbow  = require("./lib/crossbow");
var Immutable = require("immutable");
var merge     = require("./lib/config").merge;
var noKey     = 0;

/**
 * Simple compiler with no state
 * @returns {*}
 */
function compile (opts) {

    opts.config            = opts.config || {};
    opts.config.simpleMode = true;
    opts.cb                = opts.cb || function () { /*noop*/ };

    if (!opts.key) {
        opts.key = "crossbow-item-" + noKey;
        noKey += 1;
    }

    return crossbow.
        Compiler(merge(opts.config))
        .compile(opts);
}

module.exports.compile = compile;

/**
 * Builder.
 * var site = crossbow.builder();
 * site.addPage("index.html", "some content")
 */
function builder (opts) {

    opts        = opts        || {};
    opts.config = opts.config || {};
    opts.data   = opts.data   || {};
    opts.cb     = opts.cb     || function () { /*noop*/ };

    var site = crossbow.Compiler(opts.config);

    site.defaultData = Immutable.fromJS(opts.data);

    return site;
}

module.exports.builder = builder;

module.exports.stream  = require("./plugins/stream");
