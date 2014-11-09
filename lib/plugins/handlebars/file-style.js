var Handlebars    = require("/Users/shakyshane/code/handlebars.js");
var utils         = require("../../utils");
var hbFilters     = require("./filters");
var objPath       = require("object-path");

module.exports = function (data, options, file, logger, emitter) {

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

    // Add Index helpers
    options.data.root["$idx"]  = options.data.index;
    options.data.root["$idx1"] = options.data.index + 1;

    var processedParams = utils.processParams(params, options.data.root);
    var sandBox         = utils.prepareSandbox(processedParams, options.data.root);
    var savedData       = data["saved"] || {};
    var saved           = false;
    var out             = "";
    var data            = {};

    if (saved = utils.isSaved(processedParams.src)) {
        out = savedData[saved[1]] || "";
    } else {
        out  = file.getFile(processedParams.src);
        data = out.data;
    }

    if (!out) {
        emitter.emit("log", {
            type: "warn",
            msg: "File not found: " + processedParams.src,
            _crossbow: options._crossbow
        });
        return "";
    }

    out = Handlebars.compile(out.content || out)(sandBox);
    out = hbFilters.applyFilters(processedParams, out, emitter);

    return {
        original: out,
        data:     data,
        content:  utils.paddLines(out, utils.getPadding(options._crossbow.column || 0)),
        params:   processedParams
    }
};