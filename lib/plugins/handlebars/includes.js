var utils         = require("../../utils");
var Handlebars    = require("/Users/shakyshane/code/handlebars.js");

/**
 * @param file
 * @param log
 * @returns {Function}
 */
module.exports = function includeHelper (file, logger, emitter) {

    return function (options) {

        var params = options.hash || {};

        if (!utils.verifyParams(params, ["src"])) {
            emitter.emit("log", {
                type: "warn",
                msg: "You must provide a `src` parameter to the include helper",
                _crossbow: options._crossbow
            });
            return "";
        }

        logger.debug("Looking for %s in the cache.", params.src);

        var sandBox = utils.prepareSandbox(params, options.data.root);
        var src     = Handlebars.compile(params.src)(sandBox);

        var out = file.getFile(src);

        if (!out) {
            emitter.emit("log", {
                type: "warn",
                msg: "File not found: " + src,
                _crossbow: options._crossbow
            });
            return "";
        }

        out = applyFilters(params.filter, {}, out, emitter); // Todo - hook up filters

        return new Handlebars.SafeString(
            Handlebars.compile(out.content || out)(sandBox)
        );
    }
};

function applyFilters (filter, filters, out, emitter) {

    if (!filter) {
        return out;
    }

    if (!filter[filter]) {
        emitter.emit("log", {
            type: "warn",
            msg:  "Filter does not exist: " + filter
        });
    }

    return out;
}

