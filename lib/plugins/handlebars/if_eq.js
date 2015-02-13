var utils = require("../../utils");

module.exports = function ifeqHelper(compiler) {
    return function (a, b, options) {
        if (a === b) {
            return options.fn(utils.prepareSandbox(this, compiler.data.toJS()));
        }
        return options.inverse(utils.prepareSandbox(this, compiler.data.toJS()));
    };
};