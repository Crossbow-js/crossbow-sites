/**
 * Freeze internal data, further mutations are not permitted
 * to any data following the calling of this function.
 */
module.exports = function freeze () {

    var compiler = this;

    if (compiler.defaultData.toJS) {
        compiler.defaultData = compiler.defaultData.toJS();
    }

    compiler.logger.warn("Freezing data");
    compiler.frozen = {};

    Object.keys(compiler.types).forEach(function (type) {

        /**
         * Apply per-type filters, if any
         */
        var items  = compiler.cache.byType(type, compiler.config.getIn(["filters", "type:" + type])).toJS();

        /**
         * Apply per-type sorting, if any
         */
        if (compiler.types[type].sort) {
            items = compiler.types[type].sort(items);
        }

        /**
         * Now apply the plural name as a property - for example: pages, posts etc.
         */
        compiler.frozen[type + "s"] = items;
    });

    /**
     *
     */
    compiler.mergeData(compiler.defaultData, compiler.frozen);

    /**
     * Transform Global data
     */
    compiler.globalData = transFormGlobalData({
        scope: "before templates",
        compiler: compiler,
        item: compiler.item,
        transforms: compiler.dataTransforms
    });

    compiler.frozen = transFormFrozenData({
        scope: "before templates",
        compiler: compiler,
        frozen: compiler.frozen,
        item: compiler.item,
        transforms: compiler.frozenTransforms
    });

    /**
     *
     */
    return compiler.frozen;
};

/**
 *
 * @param {{compiler: Compiler, scope: string, item: Compiler.item}} opts
 * @returns {*}
 */
function transFormGlobalData (opts) {

    Object.keys(opts.transforms).forEach(function (key) {
        if (opts.transforms[key].when === opts.scope) {
            opts.compiler.globalData = opts.transforms[key].fn(opts);
        }
    });

    return opts.compiler.globalData;
}

/**
 * @param {{compiler: Compiler, scope: string, item: Compiler.item}} opts
 * @returns {*}
 */
function transFormFrozenData (opts) {

    opts.transforms.forEach(function (transforms) {
        transforms.forEach(function (item) {
            if (item.when === opts.scope) {
                opts.compiler.frozen = item.fn(opts);
            }
        });
    });

    return opts.compiler.frozen;
}

/**
 * todo: dupe code
 * @param opts
 * @returns {*}
 */
function itemTransforms (opts) {
    opts.transforms.forEach(function (transforms) {
        transforms.forEach(function (item) {
            if (item.when === opts.scope) {
                opts.item = item.fn(opts);
            }
        });
    });
    return opts.item;
}

module.exports.itemTransforms = itemTransforms;