var Immutable = require("immutable");

module.exports = function compileMany (opts) {

    var compiler = this;
    var items    = opts.collection;
    if (Array.isArray(items)) {
        items = Immutable.List(items);
    }
    var compiled = [];
    var count    = 0;

    /**
     * Run with first item
     */
    runAgain(items.get(count));

    function runAgain(item) {
        compiler.compile({
            item: item,
            cb: function (err, out) {
                if (err) {
                    return opts.cb(err);
                }
                count += 1;
                compiled.push(out);
                if (count === items.size) {
                    opts.cb(null, Immutable.List(compiled));
                } else {
                    /**
                     * Keep compiling with next item
                     */
                    runAgain(items.get(count));
                }
            }
        });
    }
};
