var utils = require("../../utils");
module.exports = function (sep, options) {
    if (utils.isUndefined(options.data.last)) {
        return "";
    }
    return options.data.last ? "" : sep;
};