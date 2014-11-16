var utils         = require("../../utils");
var markdown      = require("../markdown");
var hbFilters     = require("./filters");
var fileStyle     = require("./file-style");
var path          = require("path");
var objPath       = require("object-path");
var _             = require("lodash");

var Handlebars    = require("/Users/shakyshane/code/handlebars.js");

/**
 * @param file
 * @param log
 * @returns {Function}
 */
module.exports = function highlightHelper (data, file, logger, emitter) {

    return function (options) {

        var args    = Array.prototype.slice.call(arguments);
        var options = args[args.length-1];
        var out;

        try {
            out = fileStyle(data, options, file, logger, emitter);
        } catch (e) {
            emitter.emit("_error", {
                error: e
            });
            return "";
        }

        var hasBlock = _.isFunction(options.fn);
        var content  = "";
        var params;

        if (out.params && out.params.src) {
            content = out.processed;
            params  = out.params;
            return new Handlebars.SafeString(hbFilters.getFilter("hl")(content, params));
        }

        params = utils.processParams(options.hash || {}, options.data.root);
        content = options.fn();

        return hbFilters.getFilter("hl")(content, params);
    }
};

