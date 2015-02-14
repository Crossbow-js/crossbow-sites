var tasklist    = require("./async-task-list").tasklist;
var Immutable   = require("immutable");

/**
 * Return a compiling function
 * @param compiler
 * @returns {Function}
 */
function getCompiler (compiler) {

    return function (opts) {

        compiler.item = addItem(opts, compiler);
        compiler.data = addData(opts, compiler);

        require("async").eachSeries(
            tasklist,
            require("./taskRunner")(compiler),
            tasksComplete
        );

        function tasksComplete (err) {
            if (!err) {
                return opts.cb(null, compiler.item);
            }
            opts.cb(err);
            compiler.error(err);
        }
    };
}

/**
 * @param compiler
 * @returns {Function}
 */
module.exports.plugin = function (compiler) {
    return getCompiler(compiler);
};

/**
 * Add site data.
 * If given as a string, read the file, or anything else, us as is. (for example, an object)
 * @param opts
 * @param compiler
 * @returns {any}
 */
function addData (opts, compiler) {

    opts.data = opts.data || {};

    Object.keys(opts.data).forEach(function (key) {

        var value = opts.data[key];

        if (typeof value === "string" && value.match(/^file:/)) {
            var filepath = value.replace(/^file:/, "");
            compiler.frozen[key] = compiler.file.getFile({path: filepath}).data;
        } else {
            compiler.frozen[key] = opts.data[key];
        }

    });

    compiler.frozen.page  = compiler.item.toJS();

    //compiler.frozen.pages = compiler.item.toJS();


    //return compiler.defaultData.mergeDeep(out).withMutations(function (item) {
    //
    //    /**
    //     * Set the default page
    //     */
    //    item.set("page", compiler.item);
    //
    //    /**
    //     * Set the "pages" global
    //     */
    //    item.set("pages", compiler.cache.byType("page"));
    //
    //    /**
    //     * If any top-level data objects have file:<filename> syntax,
    //     * load them  upfront
    //     */
    //    item.forEach(function (value, key) {
    //        if (typeof value === "string" && value.match(/^file:/)) {
    //            var filepath = value.replace(/^file:/, "");
    //            item.set(key, compiler.file.getFile({path: filepath}).data);
    //        }
    //    });
    //});
}

/**
 * Get the to-be-compiled item
 * @param opts
 * @param compiler
 * @returns {*}
 */
function addItem (opts, compiler) {
    if (opts.item) {
        return opts.item;
    }
    var out = compiler.add(opts);
    compiler.freeze();
    return out;
}