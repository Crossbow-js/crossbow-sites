var utils         = require("../../utils");
var markdown      = require("../markdown");
var hbFilters     = require("./filters");
var fileStyle     = require("./file-style");
var path          = require("path");
var objPath       = require("object-path");
var _             = require("lodash");

var Handlebars    = require("/Users/shakyshane/code/handlebars.js");

/**
 * @returns {Function}
 */
module.exports = function highlightHelper (cbUtils) {

    return function () {

        var args     = Array.prototype.slice.call(arguments);
        var options  = args[args.length-1];
        var hasBlock = _.isFunction(options.fn);
        var content  = "";
        var out;
        var params;

        try {
            out = fileStyle(options, cbUtils);
        } catch (e) {
            cbUtils.emitter.emit("_error", {
                error: e,
                _type: "highlight"
            });
            return "";
        }

        if (out.params && out.params.src) {
            content = out.processed;
            params  = out.params;
            return new Handlebars.SafeString(hbFilters.getFilter("hl")(content, params));
        }

        params  = utils.processParams(options.hash || {}, options.data.root, cbUtils);
        content = options.fn();

        return hbFilters.getFilter("hl")(content, params);
    }
};

