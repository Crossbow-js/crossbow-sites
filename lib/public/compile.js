var utils      = require("../utils");

/**
 * @param {{data: [object], key: string, content: string, cb: [function]}} opts
 * @returns {Function}
 */
module.exports = function compile(opts) {

    var compiler = this;
    var frozen   = compiler.frozen;

    /**
     * Freeze data if not done already.
     * This is the secret speed-sauce.
     * After all items are items are added to the cache, the heavy-lifting data
     * transforms are done within the .freeze() method. So for 1000 items this means
     * for 999 the heavy lifting is skipped and this results in huge speed wins.
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
    compiler.item = compiler.freeze.itemTransforms({
        item: opts.item,
        compiler: compiler,
        frozen: frozen,
        scope: "before item compile",
        transforms: compiler.frozenTransforms
    });

    /**
     * Add The individual item's data to the compiler
     * @type {any}
     */
    compiler.data = addItemData(opts, compiler);

    /**
     * All ready now to convert item to JS
     * @type {any|*}
     */
    var item = compiler.item.toJS();

    /**
     * Set the compiled value
     */
    item.compiled = item.content;

    /**
     * Set simple global var such as post.
     * Always set `page` for easier access in templates/layouts etc
     * @type {any|*}
     */
    compiler.frozen[item.type] = item;
    compiler.frozen["page"]    = item;

    /**
     * Save reference to compiled content
     */
    var content = item.compiled;

    /**
     * Done callback
     * @param content
     * @returns {*}
     */
    function end(content) {
        var updated = compiler.item.set("compiled", content);
        compiler.cache.add(updated);
        return opts.cb(null, updated);
    }


    /**
     * First round of transforms, before any templating takes place
     */
    content = utils.runContentTransforms({
        transforms: compiler.contentTransforms,
        scope:      "before templates",
        compiler:   compiler,
        item:       compiler.item,
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
            item:       compiler.item,
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
        var itemlayout = compiler.item.getIn(["front", "layout"]);

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
            item:     compiler.item,
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
