module.exports = function ifeqHelper(cbUtils) {
    return function (a, b, options) {
        if (a === b) {
            return options.fn(this);
        }
        return options.inverse(this);
    }
};