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
            error:    "You must provide a `src` parameter to the hash helper",
            type:     "hash:src"
        });

        /**
         * Attempt to get a file from cache, or wherever
         */

        /**
         * File content only
         * @type {string}
         */
        var file        = compiler.file.getFile({path: params.src});

        /**
         * Return early if not retrievable
         */
        if (!file) {
            return {
                inlineError: new Handlebars.SafeString(errors["file:notfound"](params.src))
            };
        }

        const crypto = require('crypto');
        const hash = crypto.createHash('sha256').update(file.content).digest("hex");

        /**
         * Just return compiled
         */
        return new Handlebars.SafeString(hash.slice(0, 20));
    };
};

