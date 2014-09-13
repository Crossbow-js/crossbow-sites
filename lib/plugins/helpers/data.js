var utils     = require("../../utils");
var markdown  = require("../markdown");
var path      = require("path");

module.exports = function (getFile, log, dust) {

    return function (data) {

        /**
         * @param chunk
         * @param context
         * @param bodies
         * @param params
         * @returns {*}
         */
        return function (chunk, context, bodies, params) {

            var file;
            var templateName = context.getTemplateName();
            var base;

            if (params.src) {

                if (file = getFile(params.src)) {

                    if (params["as"]) {
                        base = {};
                        base[params["as"]] = file;
                        base = utils.prepareSandbox(base, data);
                    } else {
                        base = utils.prepareSandbox(file, data);
                    }

                    return bodies.block(chunk, dust.makeBase(base));

                } else {
                    log("warn", "File not found: " + params.src, templateName);
                }
            }

            log("warn", "You need to provide a `src` attribute: ", templateName);
            // If there's no block, just return the chunk
            return chunk;
        };
    };


};