/**
 * @param sections
 * @returns {Function}
 */
module.exports = function (sections) {
    return function (chunk, context, bodies, params) {
        var sec = sections[params.name];
        if (sec && sec.length) {
            return chunk.write(sec.join(""));
        }
        return chunk;
    };
};