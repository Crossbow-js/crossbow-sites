/**
 * @param {{cb: function}} opts
 */
module.exports = function compileAll (opts) {

    var compiler = this;
    opts.collection = compiler.cache.withoutType("partial");
    compiler.compileMany(opts);
};
