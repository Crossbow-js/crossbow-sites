/**
 * @module crossbow
 * @method transform
 * Add a content or data transform
 *
 * ```
 * var site = crossbow.builder();
 * site.transform({type: "content", when: "before templates", fn: function (opts) {
 *     return opts.content + " Kittie";
 * }});
 * ```
 *
 * @param {{fn: function, when: string, type: string}} opts
 */
module.exports = function (opts) {

    var compiler = this;

    if (opts.type === "content") {
        compiler.contentTransforms.push(opts);
    }

    if (opts.type === "item") {
        compiler.itemTransforms.push(opts);
    }

    return compiler;
};