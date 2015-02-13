var utils = require("../../utils");

module.exports = function compile(cbUtils) {
    return function (content) {
        return cbUtils.safeCompile(content, cbUtils.data.toJS());
    };
};