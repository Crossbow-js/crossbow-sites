var markdown      = require("../markdown");
var path          = require("path");
var utils         = require("../../utils");

module.exports = {

    "hl": function (content, params) {

        var lang = params.lang
            || path.extname(params.src).replace(".", "");

        return utils.wrapCode(
            markdown.highlight(content, lang), lang
        )
    }
}