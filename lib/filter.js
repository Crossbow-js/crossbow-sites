/**
 * Apply a filter if it exists
 * @param {Compiler} compiler
 * @returns {Object}
 */
module.exports.plugin = function (compiler) {

    var filter = {
        /**
         * @param {{content: string, name: string, params: object}} opts
         * @returns {*}
         */
        apply: function (opts) {
            var fn = compiler.filters[opts.name];
            if (fn) {
                return fn(opts, compiler);
            }
            return opts.content;
        }
    };

    return filter;
};
