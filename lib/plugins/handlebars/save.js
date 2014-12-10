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
module.exports = function saveHelper (cbUtils) {

    return function () {

        var args    = Array.prototype.slice.call(arguments);
        var options = args[args.length-1];
        var data    = cbUtils.data;
        var out;

        try {
            out = fileStyle(options, cbUtils);
        } catch (e) {
            cbUtils.emitter.emit("_error", {
                error: e,
                _type: "save"
            });
            return "";
        }

        if (!data._saved) {
            data.saved = {};
        }

        data.saved[out.params.src] = out.processed;

        return "";
    };
};

