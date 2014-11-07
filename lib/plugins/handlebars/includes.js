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
module.exports = function includeHelper (file, logger, emitter) {

    return function (options) {

        var out = fileStyle(options, file, logger, emitter);

        if (out.params && out.params.filter === "h") {
            return out.content;
        }

        return new Handlebars.SafeString(out.content);
    }
};

