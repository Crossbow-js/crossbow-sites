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

        var out      = fileStyle(data, options, file, logger, emitter);
        var hasBlock = _.isFunction(options.fn);
        var content  = "";
        var params;

        if (out.params && out.params.src) {
            content = out.content;
            params  = out.params;
            return new Handlebars.SafeString(hbFilters.getFilter("hl")(content, params));
        }

        params = utils.processParams(options.hash || {}, options.data.root);
        content = options.fn();

        return hbFilters.getFilter("hl")(content, params);

        //return hbFilters.getFilter("hl")(content, params);

        //return hbFilters.getFilter("hl")(content, params);
        //return hbFilters.getFilter("hl")(content, out.params);

        //return hbFilters.getFilter("hl")(block, processedParams);

        //var out = fileStyle(data, options, file, logger, emitter);
        //if (out.params && out.params.filter === "h") {
        //    return out.content;
        //}
        //
    }
};

