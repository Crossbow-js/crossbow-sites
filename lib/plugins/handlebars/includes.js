var utils         = require("../../utils");
var markdown      = require("../markdown");
var hbFilters     = require("./filters");
var fileStyle     = require("./file-style");
var path          = require("path");
var _             = require("lodash");

var Handlebars    = require("/Users/shakyshane/code/handlebars.js");

/**
 * @param file
 * @param log
 * @returns {Function}
 */
module.exports = function includeHelper (data, file, logger, emitter) {

    return function (options) {

        var args    = Array.prototype.slice.call(arguments);
        var options = args[args.length-1];

        var out = fileStyle(data, options, file, logger, emitter);

        if (out.params && out.params.filter === "h") {
            return out.content;
        }

        return new Handlebars.SafeString(out.content);
    }
};

