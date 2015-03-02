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

    if (!compiler.frozen) {
        compiler.freeze();
    }

    opts.item     = addItem(opts, compiler);

    function end (content) {
        return opts.cb(null, opts.item.set("compiled", content));
    }

    compiler.item = opts.item;

    compiler.data = addData(opts, compiler);

    var content   = opts.item.get("content");

    content = utils.runContentTransforms({
        transforms: compiler.contentTransforms,
        scope: "before templates",
        compiler: compiler,
        item: opts.item,
        content: content
    });

    compiler.safeCompile(content, compiler.frozen, function (err, out) {

        if (err) {
            return compiler.error(err);
        }

        content = require("lodash").isString(out) ? out : out.string || "";

        content = utils.runContentTransforms({
            transforms: compiler.contentTransforms,
            scope: "before layouts",
            compiler: compiler,
            item: opts.item,
            content: content
        });

        compiler.template.addContent({
            content: content,
            config:  compiler.config,
            context: compiler.frozen
        });


        var layoutPath = compiler.config.get("defaultLayout");
        var itemlayout = opts.item.getIn(["front","layout"]);

        /**
         * If no layout specified in front-matter
         * & no default layout file, exit early and don't modify item content
         */
        if (!itemlayout && !layoutPath) {
            return end(content);
        }

        /**
         * If a layout was specified in the item, use that instead
         */
        if (itemlayout) {
            layoutPath = itemlayout;
        }

        /**
         * Recursively add layouts
         */
        require("../layouts")({
            compiler: compiler,
            content: content,
            layout: layoutPath,
            item: opts.item,
            cb: function (err, out) {
                if (err) {
                    compiler.error(err);
                }
                return end(out.content);
            }
        });
    });
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
