/**
 * @type {{sep: "sep"}}
 */
module.exports = {
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