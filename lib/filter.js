var utils    = require("./utils");
var url      = require("./url");
var markdown = require("./plugins/markdown");

var filters = {

    /**
     * @param {{content: string, name: string, params: object}} opts
     * @param {Compiler} [compiler]
     * @returns {*}
     */
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
    },
    /**
     * @param {{content: string, name: string, params: object}} opts
     * @param compiler
     * @returns {*}
     */
    "md": function (opts, compiler) {
        return markdown.processMardownContent(opts.content, compiler.config);
    }
};

/**
 * @param {Compiler} compiler
 * @returns {Object}
 */
module.exports.plugin = function (compiler) {

    var filter = {
        /**
         * @param {{content: string, name: string, params: object}} opts
         * @returns {*}
         */
        apply: function (opts) {
            var fn = filters[opts.name];
            if (fn) {
                return fn(opts, compiler);
            }
            return opts.content;
        }
    };

    return filter;
};
