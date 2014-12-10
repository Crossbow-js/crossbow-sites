var utils         = require("../../utils");
var markdown      = require("../markdown");
var hbFilters     = require("./filters");
var fileStyle     = require("./file-style");
var path          = require("path");
var _             = require("lodash");

var Handlebars    = require("/Users/shakyshane/code/handlebars.js");

/**
 * @returns {Function}
 */
module.exports = function includeHelper (cbUtils) {

    return function () {

        var args    = Array.prototype.slice.call(arguments);
        var options = args[args.length-1];
        var out, err;

        if (!utils.verifyParams(options.hash, ["src"])) {
            err = new Error("You must provide a `src` parameter to the include helper");
            err._params   = options.hash;
            err._crossbow = options._crossbow;
            err._type = "include";
            throw err;
        }

        try {
            out = fileStyle(options, cbUtils);
        } catch (e) {
            cbUtils.emitter.emit("_error", {
                error: e,
                _type: "include"
            });
            return "";
        }

        if (out.params && out.params.filter === "h") {
            return out.processed;
        }

        return new Handlebars.SafeString(out.processed || "");
    };
};

