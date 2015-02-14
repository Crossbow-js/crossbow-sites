var utils = require("../../utils");
var markdown = require("../markdown");

module.exports = function mdHelper(compiler) {

    return function (options) {
        return markdown.processMardownContent({content:
            options.fn(utils.prepareSandbox(this, compiler.frozen))
        }, compiler);
    };
};