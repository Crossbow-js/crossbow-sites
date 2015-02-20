/**
 * @param {{type: [string], key: string, content: string, stat: [object]}} opts
 */
module.exports = function add (opts) {

    var compiler = this;

    opts.type = opts.type || "page";

    var item = compiler.types[opts.type];

    if (item) {
        return item.input(compiler)(opts);
    }

    compiler.error(new TypeError(opts.type + " does not exist"));
};