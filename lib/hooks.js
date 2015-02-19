module.exports = {
    contentTransforms: function (hooks, compiler) {
        return hooks[0];
    },
    dataTransforms: function (hooks, compiler) {
        return hooks[0];
    },
    filters: function (hooks) {
        return hooks[0];
    },
    types: function (hooks, compiler) {
        return hooks.reduce(function (combined, item) {
            if (!combined[item.name]) {
                combined[item.name] = item;
            }
            return combined;
        }, {});
    },
    config: function (hooks, compiler, initial) {
        return initial.mergeDeep(hooks[0]).mergeDeep(compiler.userConfig);
    }
};