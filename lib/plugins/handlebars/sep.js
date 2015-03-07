/**
 * $sep helper. Provide a separator in between lists (omitting the last)
 * Given: posts = [{title: "Hello"}, {title: "World"}]
 * Template:
 *
 *  {{#each posts}}
 *      {{this.title}}{{$sep " - "}}
 *  {{/each}}
 *
 * Output:
 * hello - world
 *
 * @param sep
 * @param options
 * @returns {string}
 */
module.exports = function (sep, options) {
    if (require("../../utils").isUndefined(options.data.last)) {
        return "";
    }
    return options.data.last ? "" : sep;
};