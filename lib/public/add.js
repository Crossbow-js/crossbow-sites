/**
 * @param {{type: [string], key: string, content: string, stat: [object]}} opts
 */
module.exports = function add (opts) {

    var compiler = this;

    opts.type = opts.type || "page";

    var itemtype = compiler.types[opts.type];

    if (itemtype) {
        var item = itemtype.input(compiler)(opts);
        return item.withMutations(function (item) {
            compiler.itemTransforms.forEach(function (trans) {
                if (trans.when === "before add") {
                    trans.fn({item: item, compiler: compiler});
                }
            });
        });
    }

    compiler.error(new TypeError(opts.type + " does not exist"));
};