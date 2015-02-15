var utils      = require("../../utils");
var markdown   = require("../markdown");
var url        = require("../../url");
var Handlebars = require("handlebars");
var _          = require("lodash");
var merge      = require("opt-merger").merge;
var errors     = require("../../errors").inline;


module.exports = function dataHelper(compiler) {

    return function () {

        var fileHelper   = compiler.fileHelper;
        var inlineErrors = compiler.config.get("inlineErrors");

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
            required: ["src", "as"],
            error:    "You must provide both `src` & `as` parameters to the data helper",
            type:     "data:params"
        });

        if (!params && inlineErrors) {
            return new Handlebars.SafeString(errors["data:as"]());
        }

        var fileout = fileHelper.retrieveFile({
            options: options,
            params: params
        });

        if (fileout.inlineError && inlineErrors) {
            return new Handlebars.SafeString(fileout.inlineError);
        }

        var data = fileHelper.retrieveFile({options: options, params: params}).data;

        var sandbox = _.cloneDeep(compiler.frozen);

        sandbox[params.as] = data;

        /**
         * Attempt to get a file from cache, or wherever
         */
        return options.fn(sandbox);
    };
};
