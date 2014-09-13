var utils     = require("../../utils");
var markdown  = require("../markdown");
var url       = require("../../url");
var path      = require("path");
var dust      = require("dustjs-helpers");
var merge     = require("opt-merger").merge;


module.exports = function (getFile, log) {

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
            var sandbox;

            if (params.src) {

                if (file = getFile(params.src)) {

                    sandbox = getSandbox(params["as"], file, params.src, data);
                    return bodies.block(chunk, dust.makeBase(sandbox));

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

/**
 * @param as
 * @param file
 * @param data
 * @returns {*}
 * @param src
 */
function getSandbox(as, file, src, data) {

    var base = {};

    if (as) {
        base[as] = file;
        return utils.prepareSandbox(base, data);
    }

    base[url.getBaseName(src)] = file;

    return utils.prepareSandbox(merge(base, file), data);
}