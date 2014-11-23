var Handlebars    = require("/Users/shakyshane/code/handlebars.js");
var utils         = require("../../utils");
var hbFilters     = require("./filters");
var objPath       = require("object-path");


module.exports = function (options, cbUtils) {

    var params   = options.hash || {};
    var required = ["src"];

    if (!utils.verifyParams(params, required)) {
        cbUtils.emitter.emit("_error", {
            msg: "You must provide a `src` parameter to the include helper",
            _type: "params",
            _crossbow: options._crossbow
        });
        return "";
    }

    cbUtils.logger.debug("Looking for %s in the cache.", params.src);

    // Add Index helpers
    options.data.root["$idx"]  = options.data.index;
    options.data.root["$idx1"] = options.data.index + 1;

    var processedParams = utils.processParams(params, options.data.root, cbUtils);
    var src = processedParams.src;

    if (!src) {
        return "";
    }

    var sandBox         = utils.prepareSandbox(processedParams, options.data.root);
    var savedData       = cbUtils.data["saved"] || {};
    var saved           = false;
    var out             = "";
    var processed       = {};

    if (saved = utils.isSaved(processedParams.src)) {
        out = savedData[saved[1]] || "";
    } else {
        out  = cbUtils.file.getFile(processedParams.src);
    }

    if (!out) {
        cbUtils.emitter.emit("_error", {
            msg: "File not found: " + processedParams.src,
            _type: "file",
            _crossbow: options._crossbow
        });
        return "";
    }

    processed = cbUtils.safeCompile(out.content || out, sandBox);
    processed = hbFilters.applyFilters(processedParams, processed, cbUtils.emitter);

    return {
        original:  out,
        processed: utils.paddLines(processed || "", utils.getPadding(options._crossbow.column || 0)),
        file:      out,
        content:   processed,
        params:    processedParams
    }
};