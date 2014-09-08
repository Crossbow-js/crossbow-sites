/**
 * @type {{sep: "sep"}}
 */
module.exports = function (getFile) {
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
        "inc": function (chunk, context, bodies, params) {
            console.log(getFile(params.src));
            return chunk;
        }
    }
};
