var utils         = require("../../utils");
var markdown      = require("../markdown");
var hbFilters     = require("./filters");
var path          = require("path");
var _             = require("lodash");

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
            : _.isFunction(options.fn) ? options.fn() : "";

        /**
         * Run the content through the HL filter
         */
        return new Handlebars.SafeString(hbFilters.getFilter("hl")("content", params));
    };
};

