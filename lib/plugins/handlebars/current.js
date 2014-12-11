
module.exports = function currentHelper (cbUtils) {
    return function (var1, options) {
        var current = cbUtils.data.page.url;
        if (current === "/index.html") {
            current = "/";
        }
        if (var1 === current) {
            return options.fn(this);
        }
        return options.inverse(this);
    };
};