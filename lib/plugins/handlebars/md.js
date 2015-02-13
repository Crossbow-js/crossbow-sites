var utils = require("../../utils");
var markdown = require("../markdown");

module.exports = function mdHelper(cbUtils) {

    return function (options) {
        return markdown.processMardownContent(options.fn(utils.prepareSandbox(this, cbUtils.data.toJS())), cbUtils.config);
    };
};