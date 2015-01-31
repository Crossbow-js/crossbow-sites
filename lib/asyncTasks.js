module.exports = [
    beforeItemParsed,
    handleInput
];

/**
 * Data transformations before an item is parsed
 * @param compiler
 * @param item
 * @param done
 */
function beforeItemParsed(compiler, item, done) {
    done(null, {
        globalData: runTransforms(
            compiler.globalData,
            item,
            compiler.dataTransforms,
            "before item parsed",
            compiler.config
        )
    });
}

/**
 * @param compiler
 * @param item
 * @param done
 */
function handleInput (compiler, item, done) {
    done(null, {
        item: {
            compiled: compiler.hb.renderTemplate(item.content, item.data)
        }
    });
}

/**
 * @param data
 * @param item
 * @param transforms
 * @param scope
 * @param config
 */
function runTransforms(data, item, transforms, scope, config) {

    require("lodash").each(transforms, function (plugin) {
        if (plugin.when === scope) {
            data = plugin.fn(item || {}, data || {}, config);
        }
    });

    return data;
}