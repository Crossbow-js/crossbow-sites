var _          = require("lodash");

module.exports = function (sep, options) {
    if (_.isUndefined(options.data.last)) {
        return "";
    }
    return options.data.last ? "" : sep;
};