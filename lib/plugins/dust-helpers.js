var utils     = require("../utils");
var sections  = require("./helpers/sections")();
var highlight = require("./helpers/highlight");
var includes  = require("./helpers/includes");
var data      = require("./helpers/data");

/**
 * @param {Function} getFile
 * @param {Object} emitter
 * @param {Object} dust
 * @returns {{section: *, yield: *, highlight: (*|function(): chunk|exports), sep: "sep", inc: "inc"}}
 */
module.exports = function (file, emitter, dust) {

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
        "highlight": highlight(file, log, dust),

        /**
         *
         */
        "includes": includes(file, log, dust),

        /**
         * Data helper.
         * {@data src="data/file.yml"} ....  {/data}
         */
        "data": data(file, log, dust),

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
        }
    };
};
