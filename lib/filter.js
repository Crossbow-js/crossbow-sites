var utils    = require("./utils");
var url      = require("./url");
var markdown = require("./plugins/markdown");

var filters = {

    "hl": function (opts) {

        var lang = utils.getLang(opts.params);

        var highlighted = markdown.highlight(
            opts.content,
            lang
        );

        if (lang === "") {
            highlighted = utils.escapeHtml(highlighted);
        }

        return utils.wrapCode(
            highlighted, lang
        );
    }
};

/**
 * @param {Compiler} compiler
 * @returns {Object}
 */
module.exports = function (compiler) {

    var filter = {
        apply: function (opts) {
            var fn = filters[opts.name];
            if (fn) {
                return fn(opts);
            }
        }
    };

    return filter;
};
