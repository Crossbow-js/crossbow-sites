var utils = require("../../utils");

module.exports = function ifNotEqHelper(cbUtils) {
    return function (a, b, options) {
        if (a !== b) {
            return options.fn(utils.prepareSandbox(this, cbUtils.data.toJS()));
        }
        return options.inverse(utils.prepareSandbox(this, cbUtils.data.toJS()));
    };
};