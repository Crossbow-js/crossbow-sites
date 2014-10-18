var utils = require("../../utils");

/**
 * @param file
 * @param log
 * @param dust
 * @returns {Function}
 */
module.exports = function (file, log, dust) {

    /**
     * This is accessed each time compileOne is called
     */
    return function (data) {

        return function (chunk, context, bodies, params) {

            params = params || {};

            var fileContents;
            var templateName = context.getTemplateName();

            if (!params.src) {
                log("warn", "You need to supply a `src` param for includes", templateName);
                return chunk;
            }

            var partialPath = params.src;//utils.getIncludePath(params.src);
            var sandBox     = utils.prepareSandbox(params, data);

            if (fileContents = file.getFile(partialPath)) {
                if (params.filter) {
                    if (dust.filters[params.filter]) {
                        dust.loadSource(dust.compile(dust.filters[params.filter](fileContents), partialPath + ".compiled"));
                        return chunk.partial(partialPath + ".compiled", dust.makeBase(sandBox));
                    } else {
                        log("warn", "filter not found: " + params.filter, templateName);
                    }
                } else {
                    return chunk.partial(partialPath, dust.makeBase(sandBox));
                }
            } else {
                // Final straw - try to grab ANY file from root
                fileContents = file.getFile(params.src);
                if (fileContents) {
                    return chunk.partial(params.src, dust.makeBase(sandBox));
                } else {
                    log("warn", "Include not found: " + params.src, templateName);
                }
            }
            return chunk;
        };
    };
};