module.exports = function (logger, emitter) {
    return function (data) {
        return function (var1, options) {
            var current = data.page.url;
            if (current === "/index.html") {
                current = "/";
            }
            if (var1 === current) {
                return options.fn(this);
            }
            return options.inverse(this);
        }
    }
};