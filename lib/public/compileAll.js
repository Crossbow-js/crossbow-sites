var Immutable = require("immutable");

module.exports = function compileAll (opts) {

    var compiler = this;
    var items    = compiler.cache.byType("page");
    var compiled = [];
    var count    = 0;

    items.forEach(function (item) {

        compiler.compile({
            item: item,
            cb: function (err, out) {
                if (err) {
                    opts.cb(err);
                }
                count += 1;
                if (Array.isArray(out)) {
                    compiled.concat(out);
                } else {
                    compiled.push(out);
                }
                if (count === items.size) {
                    opts.cb(null, Immutable.List(compiled));
                }
            }
        });
    });
};
