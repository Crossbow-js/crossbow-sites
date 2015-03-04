var lang             = require("lodash/lang");
var Handlebars    = require("handlebars");

/**
 * @returns {Function}
 */
module.exports = function highlightHelper (compiler) {

    return function () {

        var fileHelper = compiler.fileHelper;

        /**
         * Process options
         * @type {BrowserSync.options|*}
         */
        var options    = fileHelper.getOptions(arguments);

        /**
         * Process/verify params
         */
        var params     = fileHelper.processParams({
            options:  options
        });

        /**
         * Use src for retrieving a file, or process the block.
         */
        var content    = params.src
            ? fileHelper.retrieveFile({options: options, params: params}).content
            : lang.isFunction(options.fn) ? options.fn() : "";

        if (!content) {
            return;
        }

        /**
         * Run the content through the HL filter
         */
        return new Handlebars.SafeString(
            compiler.filter.apply({
                name: "hl",
                content: content,
                params: params
            })
        );
    };
};
