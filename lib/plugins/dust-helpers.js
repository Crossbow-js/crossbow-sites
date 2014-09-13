var utils     = require("../utils");
var sections  = require("./helpers/sections")();
var highlight = require("./helpers/highlight");

/**
 * @param {Function} getFile
 * @param {Object} emitter
 * @param {Object} dust
 * @returns {{section: *, yield: *, highlight: (*|function(): chunk|exports), sep: "sep", inc: "inc"}}
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
         * Add a section of code, to be output up the stack
         * EG: {@section name="head-css"}.body { background: red} {/section}
         */
        "section": sections.section,

        /**
         * Yield a section
         * {@yield name="head-css" /}
         */
        "yield": sections["yield"],

        /**
         * Highlight a Block of code
         */
        "highlight": highlight,

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
         * @returns {*}
         * @param data
         */
        "inc": function (data) {

            return function (chunk, context, bodies, params) {

                params = params || {};

                var file;
                var templateName = context.getTemplateName();

                if (!params.src) {
                    log("warn", "You need to supply a `src` param for includes", templateName);
                    return chunk;
                }

                var partialPath = utils.getIncludePath(params.src);
                var sandBox     = utils.prepareSandbox(params, data);

                if (file = getFile(partialPath)) {
                    if (params.filter) {
                        if (dust.filters[params.filter]) {
                            dust.loadSource(dust.compile(dust.filters[params.filter](file), partialPath + ".compiled"));
                            return chunk.partial(partialPath + ".compiled", dust.makeBase(sandBox));
                        } else {
                            log("warn", "filter not found: " + params.filter, templateName);
                        }
                    } else {
                        return chunk.partial(partialPath, dust.makeBase(sandBox));
                    }
                } else {
                    // Final straw - try to grab ANY file from root
                    file = getFile(params.src);
                    if (file) {
                        return chunk.partial(params.src, dust.makeBase(sandBox));
                    } else {
                        log("warn", "Include not found: " + params.src, templateName);
                    }
                }
                return chunk;
            };
        }
    };
};
