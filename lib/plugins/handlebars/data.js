var utils     = require("../../utils");
var markdown  = require("../markdown");
var url       = require("../../url");
var fileStyle = require("./file-style");
var merge     = require("opt-merger").merge;


module.exports = function (data, file, logger, emitter) {

    return function () {
        var args    = Array.prototype.slice.call(arguments);
        var options = args[args.length-1];
        var out;

        try {
            out = fileStyle(data, options, file, logger, emitter);
        } catch (e) {
            emitter.emit("error", {
                error: e
            });
            return ""; // return empty if error from data
        }

        var sandbox = getSandbox(out.params["as"], out.file.data, out.params.src, data);
        return options.fn(sandbox);
    }
};

/**
 * @param as
 * @param file
 * @param data
 * @returns {*}
 * @param src
 */
function getSandbox(as, file, src, data) {

    var base = {};

    if (as) {
        base[as] = file;
        return utils.prepareSandbox(base, data);
    }

    base[url.getBaseName(src)] = file;

    return utils.prepareSandbox(merge(base, file), data);
}