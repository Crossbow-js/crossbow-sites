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
    compiler.mergeData(opts.data, compiler.frozen);
    var item = compiler.item.toJS();
    compiler.frozen[item.type] = item;
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