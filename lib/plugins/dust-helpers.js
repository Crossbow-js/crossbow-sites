var utils = require("../utils");
/**
 * @type {{sep: "sep"}}
 */
module.exports = function (getFile, emitter, dust) {

    var log = function (type, msg, context) {
        // Error if this is reached
        emitter.emit("log", {
            type: type,
            msg: msg,
            context: context
        });
    };

    return {
        /**
         * @param chunk
         * @param context
         * @param bodies
         * @returns {*}
         */
        "sep": function (chunk, context, bodies) {
            var body = bodies.block;
            if (context.stack.index === undefined ){
                return chunk;
            }
            if (context.stack.index === context.stack.of - 1) {
                return chunk;
            }
            if(body) {
                return bodies.block(chunk, context);
            }
            else {
                return chunk;
            }
        },
        /**
         * @param chunk
         * @param context
         * @param bodies
         * @param params
         * @returns {*}
         */
        "inc": function (chunk, context, bodies, params) {

            params = params || {};

            var file;
            var templateName = context.getTemplateName();

            if (!params.src) {
                log("warn", "You need to supply a `src` param for includes", templateName);
                return chunk;
            }

            var partialPath = utils.getIncludePath(params.src);
            var sandBox     = utils.prepareSandbox(params, context.stack.head);

            if (file = getFile(partialPath)) {

                if (params.filter) {

                    if (dust.filters[params.filter]) {
                        dust.loadSource(dust.compile(dust.filters[params.filter](file), partialPath + ".compiled"));
                        return chunk.partial(partialPath + ".compiled", dust.makeBase(sandBox));
                    } else {
                        log("warn", "filter not found: " + params.filter, templateName);
                    }
                } else {
                    return chunk.partial(
                        partialPath,
                        dust.makeBase(sandBox)
                    );
                }
            } else {
                log("warn", "Include not found: " + params.src, templateName);
            }
            return chunk;
        }
    }
};
