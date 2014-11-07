var utils         = require("../../utils");
var markdown      = require("../markdown");
var path          = require("path");
var _             = require("lodash");
var Handlebars    = require("/Users/shakyshane/code/handlebars.js");

var hbFilters       = {

    "hl": function (content, params) {

        var lang = params.lang
            || path.extname(params.src).replace(".", "");

        return utils.wrapCode(
            markdown.highlight(content, lang), lang
        )
    }
};

/**
 * @param file
 * @param log
 * @returns {Function}
 */
module.exports = function includeHelper (file, logger, emitter) {

    return function (options) {

        var params   = options.hash || {};
        var required = ["src"];

        if (!utils.verifyParams(params, required)) {
            emitter.emit("log", {
                type: "warn",
                msg: "You must provide a `src` parameter to the include helper",
                _crossbow: options._crossbow
            });
            return "";
        }

        logger.debug("Looking for %s in the cache.", params.src);

        var processedParams = utils.processParams(params, options.data.root);
        var sandBox         = utils.prepareSandbox(processedParams, options.data.root);

        var out = file.getFile(processedParams.src);

        if (!out) {
            emitter.emit("log", {
                type: "warn",
                msg: "File not found: " + processedParams.src,
                _crossbow: options._crossbow
            });
            return "";
        }

        out = Handlebars.compile(out.content || out)(sandBox);
        out = applyFilters(processedParams, out, emitter); // Todo - hook up filters
        out = utils.paddLines(out, utils.getPadding(options._crossbow.column || 0));

        if (processedParams.filter === "h") {
            return out;
        }

        return new Handlebars.SafeString(out);
    }
};

function applyFilters (params, out, emitter) {

    var filter = params.filter;

    if (!filter) {
        return out;
    }

    if (hbFilters[filter]) {
        return hbFilters[filter](out, params)
    }

    if (!hbFilters[filter]) {
        emitter.emit("log", {
            type: "warn",
            msg:  "Filter does not exist: " + filter
        });
    }

    return out;
}

