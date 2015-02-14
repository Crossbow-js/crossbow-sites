var utils      = require("../../utils");
var markdown   = require("../markdown");
var url        = require("../../url");
var Handlebars = require("handlebars");
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

        compiler.frozen[params.as] = fileHelper.retrieveFile({options: options, params: params}).data;

        /**
         * Attempt to get a file from cache, or wherever
         */
        return options.fn(compiler.frozen);
    };
};

/**
 * @param _as
 * @param file
 * @param data
 * @returns {*}
 * @param src
 */
function getSandbox(_as, file, src, data) {

    var base = {};

    if (_as) {
        base[_as] = file;
        return utils.prepareSandbox(base, data);
    }

    base[url.getBaseName(src)] = file;

    return utils.prepareSandbox(merge(base, file || {}), data);
}