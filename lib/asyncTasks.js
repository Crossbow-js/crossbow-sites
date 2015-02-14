var utils   = require("./utils");
var layouts = require("./layouts");

module.exports.tasks = {
    /**
     * Data transformations before an item is parsed
     * @param compiler
     * @param done
     */
    prepareFrontVars: function (compiler, done) {

        done(null, {
            item: {
                compiled: compiler.item.get("content")
            }
        });
    },
    /**
     * Data transformations before an item is parsed
     * @param compiler
     * @param done
     */
    transformData: function (compiler, done) {

        done(null, {
            globalData: runDataTransforms({
                compiler: compiler,
                item:     compiler.item,
                scope:    "before item parsed"
            })
        });
    },
    /**
     * Content transformations before an item is parsed
     * @param compiler
     * @param done
     */
    transformContent: function (compiler, done) {

        done(null, {
            item: {
                compiled: runContentTransforms({
                    compiler: compiler,
                    item: compiler.item,
                    scope: "before item parsed"
                })
            }
        });
    },

    /**
     * @param compiler
     * @param item
     * @param done
     * @returns {*}
     */
    handleSimpleMode: function (compiler, item, done) {

        if (compiler.config.get("simpleMode")) {
            return done(null, {
                globalData: utils.prepareSandbox(item.data, compiler.globalData)
            });
        }

        done();
    },
    /**
     * @param compiler
     * @param done
     */
    flattenBeforeTransforms: function (compiler, done) {

        compiler.hb.renderTemplate(compiler.item.get("compiled"), compiler.data.toJS(), function (err, out) {

            if (err) {
                return done(err);
            }

            done(null, {
                item: {
                    compiled: out
                }
            });
        });
    },
    /**
     * @param compiler
     * @param done
     */
    beforeRenderHooks: function (compiler, done) {

        done(null, {
            item: {
                compiled: runContentTransforms({
                    compiler: compiler,
                    item:     compiler.item,
                    content:  compiler.item.get("compiled"),
                    scope:    "before item render"
                })
            }
        });
    },
    /**
     * @param compiler
     * @param done
     */
    addInitialContent: function (compiler, done) {

        /**
         * Set the scene for the first occurrence of {{content}}
         */
        compiler.hb.addContent({
            content: compiler.item.get("compiled"),
            config:  compiler.config,
            context: compiler.data.toJS()
        });

        done();
    },
    /**
     * Data transformations before an item is parsed
     * @param compiler
     * @param done
     */
    buildLayouts: function (compiler, done) {

        var layoutPath = compiler.config.get("defaultLayout");
        var itemlayout = compiler.item.getIn(["front","layout"]);

        /**
         * If no layout specified in front-matter
         * & no default layout file, exit early and don't modify item content
         */
        if (!itemlayout && !layoutPath) {
            return done();
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
        layouts(compiler, layoutPath, compiler.item, function (err, out) {
            done(null, {
                item: {
                    compiled: out.content
                }
            });
        });
    }
};

/**
 * @param opts
 * @returns {data|*}
 */
function runDataTransforms (opts) {

    var transforms = opts.compiler.pluginManager.hook("dataTransforms", opts.compiler);

    require("lodash").each(transforms, function (plugin) {
        if (plugin.when === opts.scope) {
            opts.compiler.globalData = plugin.fn(opts);
        }
    });

    return opts.compiler.globalData;
}

module.exports.runTransforms = runDataTransforms;

/**
 * @param opts
 * @returns {*}
 */
function runContentTransforms(opts) {

    var transforms = opts.compiler.pluginManager.hook("contentTransforms", opts.compiler);

    require("lodash").each(transforms, function (plugin) {
        if (plugin.when === opts.scope) {
            opts.item.content = plugin.fn(opts);
        }
    });

    return opts.item.content;
}
