var Immutable = require("immutable");

/**
 * @param {{cb: function}} opts
 */
module.exports = function compileAll (opts) {

    var compiler = this;
    opts.collection = compiler.cache.byType("page");
    compiler.compileMany(opts);
};
