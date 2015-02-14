module.exports = {
    contentTransforms: function (hooks, compiler) {
        return hooks[0];
    },
    dataTransforms: function (hooks, compiler) {
        return hooks[0];
    },
    filters: function (hooks) {
        return hooks[0];
    }
};