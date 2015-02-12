var utils         = require("../../utils");
var path          = require("path");
var _             = require("lodash");
var errors        = require("../../errors").inline;

var Handlebars    = require("handlebars");

/**
 * @returns {Function}
 */
module.exports = function includeHelper (compiler) {

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
            options:  options,
            required: ["src"],
            error:    "You must provide a `src` parameter to the include helper",
            type:     "include:src"
        });

        /**
         * Attempt to get a file from cache, or wherever
         */
        var fileout = fileHelper.retrieveFile({options: options, params: params});

        /**
         * Allow inline errors or empty
         */
        if (!fileout.content) {
            return fileout.inlineError || "";
        }

        var content = fileout.compiled;

        if (params.filter) {
            content = compiler.filter.apply({
                name: params.filter,
                content: fileout.compiled,
                params: params
            });
        } else {
            /**
             * If pretty markup in config, pad lines
             */
            if (compiler.config.get("prettyMarkup")) {
                return new Handlebars.SafeString(fileout.padded || "");
            }
        }

        /**
         * Just return compiled
         */
        return new Handlebars.SafeString(content || "");
    };
};

