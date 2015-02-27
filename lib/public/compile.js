var layouts     = require("../layouts");
var Immutable   = require("immutable");
var _           = require("lodash");
var utils       = require("../utils");

/**
 * @param {{data: [object], key: string, content: string, cb: [function]}} opts
 * @returns {Function}
 */
module.exports = function compile (opts) {

    var compiler = this;

    //if (!compiler.frozen) {
        compiler.freeze();
    //}

    opts.item     = addItem(opts, compiler);

    compiler.item = opts.item;

    compiler.data = addData(opts, compiler);

    var content   = opts.item.get("content");
    var transform = require("../utils").streams.transform;
    var template  = compiler.template;
    var rs        = require("../utils").streams.readable();

    rs.push(content);

        rs
        /**
         * Before template transforms
         */
        .pipe(template.transform({scope: "before templates", item: opts.item}))
        /**
         * Process Templates
         */
        .pipe(template.stream(compiler.frozen))
        /**
         * Before layouts transforms
         */
        .pipe(template.transform({scope: "before layouts", item: opts.item}))
        /**
         * Add content to first {{content}} block
         */
        .pipe(template.addContentStream())
        /**
         * Flatten layouts
         */
        .pipe(template.buildLayouts({item: opts.item}))
        /**
         * Finish, update cache, call user cb function
         */
        .pipe(transform(function (body) {
            var updated = opts.item.set("compiled", body.toString());
            compiler.cache.add(updated);
            opts.cb(null, updated);
            this.push(null);
        }));
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
    var item = opts.item.toJS();
    item.compiled              = item.content;
    compiler.frozen[item.type] = item;
    compiler.frozen["page"]    = item;
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
    return out;
}
