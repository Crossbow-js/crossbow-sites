var utils = require("./utils");
var layouts = require("./layouts");

module.exports.tasks = [
    transformData,
    buildLayouts,
    transformContent,
    handleSimpleMode,
    renderContent,
    transformContentAfterTemplates
];

/**
 * Data transformations before an item is parsed
 * @param compiler
 * @param item
 * @param done
 */
function transformData (compiler, item, done) {
    done(null, {
        globalData: runTransforms({
            compiler: compiler,
            item: item,
            scope: "before item parsed"
        })
    });
}

/**
 * Data transformations before an item is parsed
 * @param compiler
 * @param item
 * @param done
 */
function buildLayouts (compiler, item, done) {

    layouts(compiler, item, function (err, out) {
        done(null, {
            item: {
                content: out.content
            }
        });
    });

}

/**
 * Content transformations before an item is parsed
 * @param compiler
 * @param item
 * @param done
 */
function transformContent (compiler, item, done) {
    done(null, {
        item: {
            content: runContentTransforms({
                compiler: compiler,
                item: item,
                content: item.content,
                scope: "before item parsed"
            })
        }
    });
}

/**
 * @param compiler
 * @param item
 * @param done
 * @returns {*}
 */
function handleSimpleMode (compiler, item, done) {

    if (compiler.config.get("simpleMode")) {
        return done(null, {
            globalData: utils.prepareSandbox(item.data, compiler.globalData)
        });
    }

    done();
}

/**
 * @param compiler
 * @param item
 * @param done
 */
function transformContentAfterTemplates (compiler, item, done) {

    done(null, {
        item: {
            compiled: runContentTransforms({
                compiler: compiler,
                item: item,
                content: item.compiled,
                scope: "before item render"
            })
        }
    });
}

/**
 * @param compiler
 * @param item
 * @param done
 */
function renderContent (compiler, item, done) {
    done(null, {
        item: {
            compiled: compiler.hb.renderTemplate(item.content, compiler.globalData)
        }
    });
}

/**
 * @param opts
 * @returns {data|*}
 */
function runTransforms (opts) {

    require("lodash").each(opts.compiler.dataTransforms, function (plugin) {
        if (plugin.when === opts.scope) {
            opts.compiler.globalData = plugin.fn(opts.item || {}, opts.compiler.globalData || {}, opts.compiler.config);
        }
    });

    return opts.compiler.globalData;
}

module.exports.runTransforms = runTransforms;

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
