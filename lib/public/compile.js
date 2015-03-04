var utils      = require("../utils");

/**
 * @param {{data: [object], key: string, content: string, cb: [function]}} opts
 * @returns {Function}
 */
module.exports = function compile(opts) {

    var compiler = this;
    var frozen   = compiler.frozen;

    /**
     * Freeze data if not done already
     */
    if (!frozen) {
        frozen = compiler.freeze();
    }

    /**
     * Use item passed, or create one
     * @type {*}
     */
    opts.item = addItem(opts, compiler);

    /**
     * Save reference to current item.
     * This is to allow helpers & transforms
     * to do with with item context
     * @type {*}
     */
    compiler.item = opts.item;

    /**
     * Add The individual item's data to the compiler
     * @type {any}
     */
    compiler.data = addItemData(opts, compiler);

    /**
     * Done callback
     * @param content
     * @returns {*}
     */
    function end(content) {
        var updated = opts.item.set("compiled", content);
        compiler.cache.add(updated);
        return opts.cb(null, updated);
    }

    var content = opts.item.get("content");

    /**
     * First round of transforms, before any templating takes place
     */
    content = utils.runContentTransforms({
        transforms: compiler.contentTransforms,
        scope:      "before templates",
        compiler:   compiler,
        item:       opts.item,
        content:    content
    });

    /**
     * Compile templates
     */
    compiler.safeCompile(content, frozen, afterCompile);

    /**
     * Handle output of template compiling
     * @param err
     * @param out
     * @returns {*}
     */
    function afterCompile(err, out) {

        if (err) {
            return compiler.error(err);
        }

        /**
         * Is a string or obj returned
         */
        content = utils.isString(out) ? out : out.string || "";

        /**
         * Run second round of transforms, before the layouts
         */
        content = utils.runContentTransforms({
            transforms: compiler.contentTransforms,
            scope:      "before layouts",
            compiler:   compiler,
            item:       opts.item,
            content:    content
        });

        /**
         * Add the data for the first {{content}} block
         */
        compiler.template.addContent({
            content: content,
            config:  compiler.config,
            context: frozen
        });

        /**
         * Get any layouts
         */
        var layoutPath = compiler.config.get("defaultLayout");
        var itemlayout = opts.item.getIn(["front", "layout"]);

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
            content:  content,
            layout:   layoutPath,
            item:     opts.item,
            cb:       function (err, out) {
                if (err) {
                    compiler.error(err);
                }
                return end(out.content);
            }
        });
    }
};

/**
 * Add site data.
 * If given as a string, read the file, or anything else, us as is. (for example, an object)
 * @param opts
 * @param compiler
 * @returns {any}
 */
function addItemData(opts, compiler) {

    opts.data = opts.data || {};
    compiler.mergeData(opts.data, compiler.frozen);
    var item = opts.item.toJS();
    item.compiled = item.content;
    compiler.frozen[item.type] = item;
    compiler.frozen["page"] = item;
}

/**
 * Get the to-be-compiled item
 * @param opts
 * @param compiler
 * @returns {*}
 */
function addItem(opts, compiler) {
    if (opts.item) {
        return opts.item;
    }
    return compiler.add(opts);
}
