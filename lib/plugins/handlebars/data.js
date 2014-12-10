var utils     = require("../../utils");
var markdown  = require("../markdown");
var url       = require("../../url");
var fileStyle = require("./file-style");
var merge     = require("opt-merger").merge;


module.exports = function dataHelper(cbUtils) {

    return function () {

        var args    = Array.prototype.slice.call(arguments);
        var options = args[args.length-1];
        var out;

        out = fileStyle(options, cbUtils);

        if (!out.params) {
            return "";
        }

        var sandbox = getSandbox(out.params["as"], out.file.data, out.params.src, cbUtils.data);
        return options.fn(sandbox);
    };
};

/**
 * @param _as
 * @param file
 * @param data
 * @returns {*}
 * @param src
 */
function getSandbox(_as, file, src, data) {

    var base = {};

    if (_as) {
        base[_as] = file;
        return utils.prepareSandbox(base, data);
    }

    base[url.getBaseName(src)] = file;

    return utils.prepareSandbox(merge(base, file), data);
}