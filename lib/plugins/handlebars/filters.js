var markdown      = require("../markdown");
var path          = require("path");
var utils         = require("../../utils");

var filters = {

    "hl": function (content, params) {

        var lang = utils.getLang(params);

        var highlighted = markdown.highlight(content, lang);

        if (lang === "") {
            highlighted = utils.escapeHtml(highlighted);
        }

        return utils.wrapCode(
            highlighted, lang
        );
    }
};

module.exports.filters = filters;

var applyFilters = function (params, out, emitter) {

    var filter = params.filter;

    if (!filter) {
        return out;
    }

    if (filters[filter]) {
        return filters[filter](out, params);
    }

    if (!filters[filter]) {
        emitter.emit("_error", {
            _type: "filter",
            msg:  "Filter does not exist: " + filter
        });
    }

    return out;
};

module.exports.applyFilters = applyFilters;

function getFilter (name) {

    if (filters[name]) {
        return filters[name];
    }

    // return a noop
    return function (content) {
        return content;
    };
}

module.exports.getFilter = getFilter;