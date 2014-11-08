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
module.exports = function saveHelper (data, file, logger, emitter) {

    return function (options) {

        var out = fileStyle(data, options, file, logger, emitter);

        if (!data._saved) {
            data.saved = {};
        }

        data.saved[out.params.src] = out;

        return "";
    }
};

