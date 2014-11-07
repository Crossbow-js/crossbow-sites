var markdown      = require("../markdown");
var path          = require("path");
var utils         = require("../../utils");

var filters = {

    "hl": function (content, params) {

        var lang = params.lang
            || path.extname(params.src).replace(".", "");

        return utils.wrapCode(
            markdown.highlight(content, lang), lang
        )
    }
}

module.exports.filters = filters;

var applyFilters = function (params, out, emitter) {

    var filter = params.filter;

    if (!filter) {
        return out;
    }

    if (filters[filter]) {
        return filters[filter](out, params)
    }

    if (!filters[filter]) {
        emitter.emit("log", {
            type: "warn",
            msg:  "Filter does not exist: " + filter
        });
    }

    return out;
}
module.exports.applyFilters = applyFilters;