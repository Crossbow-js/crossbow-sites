var utils = require("../../utils");

module.exports = function loopHelper (cbUtils) {
    return function (var1, options) {
        return var1.reduce(function (all, item) {
            return all + options.fn(utils.prepareSandbox(item, cbUtils.data));
        }, "");
    };
};