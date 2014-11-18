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
        var out;

        try {
            out = fileStyle(options, cbUtils);
        } catch (e) {
            cbUtils.emitter.emit("_error", {
                error: e
            });
            return "";
        }

        if (out.params && out.params.filter === "h") {
            return out.processed;
        }

        return new Handlebars.SafeString(out.processed || "");
    }
};

