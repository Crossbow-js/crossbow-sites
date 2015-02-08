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
                site: compiler.data.site || {},
                compiled: compiler.item.get("content")
            }
        });
    },
    /**
     * Data transformations before an item is parsed
     * @param compiler
     * @param item
     * @param done
     */
    transformData: function (compiler, item, done) {

        done(null, {
            globalData: runDataTransforms({
                compiler: compiler,
                item: item,
                scope: "before item parsed"
            })
        });
    },
    /**
     * Content transformations before an item is parsed
     * @param compiler
     * @param item
     * @param done
     */
    transformContent: function (compiler, item, done) {

        done(null, {
            item: {
                compiled: runContentTransforms({
                    compiler: compiler,
                    item: item,
                    content: item.get("compiled"),
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

        var tempData = compiler.data.set("page", compiler.item);

        compiler.hb.renderTemplate(compiler.item.get("compiled"), tempData.toJS(), function (err, out) {
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
    transformContentAfterTemplates: function (compiler, done) {

        done(null, {
            item: {
                compiled: runContentTransforms({
                    compiler: compiler,
                    item: compiler.item,
                    content: compiler.item.get("compiled"),
                    scope: "before item render"
                })
            }
        });
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

        if (itemlayout) {
            layoutPath = itemlayout;
        }

        /**
         * Set the scene for the first occurence of {{content}}
         */
        compiler.hb.addContent({
            content: compiler.item.get("compiled"),
            config:  compiler.config,
            context: compiler.item.toJS()
        });

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

    require("lodash").each(opts.compiler.dataTransforms, function (plugin) {
        if (plugin.when === opts.scope) {
            opts.compiler.globalData = plugin.fn(opts.item || {}, opts.compiler.globalData || {}, opts.compiler.config);
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

    require("lodash").each(opts.compiler.contentTransforms, function (plugin) {
        if (plugin.when === opts.scope) {
            opts.item.content = plugin.fn(opts.content, opts.item, opts.compiler.config);
        }
    });

    return opts.item.content;
}
