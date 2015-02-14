/**
 * @param compiler
 * @returns {Function}
 */
module.exports = function currentHelper (compiler) {
    return function (var1, options) {
        if (var1 === compiler.frozen.page.url) {
            return options.fn(this);
        }
        return options.inverse(this);
    };
};