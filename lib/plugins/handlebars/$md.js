var utils = require("../../utils");
var markdown = require("../markdown");

module.exports = function mdHelper(compiler) {
    return function (options) {
        if (options.hash && options.hash.inlinesrc) {

            var out = new compiler.Handlebars.SafeString(markdown.processMardownContent({content:
                options.hash.inlinesrc
            }, compiler));

            return new compiler.Handlebars.SafeString(compiler.safeCompile(out.string, compiler.frozen));
        }
        return "";
    };
};