/**
 * @returns {{section: section}}
 */
module.exports = function () {

    var sections = {};

    return {
        section: function (chunk, context, bodies, params) {
            var output = "";
            chunk.tap(function (data) {
                output += data;
                return "";
            }).render(bodies.block, context).untap();
            sections[params.name] = [output];
            return chunk;
        },
        "yield": require("./yield")(sections)
    };
};