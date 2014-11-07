var Handlebars    = require("/Users/shakyshane/code/handlebars.js");
var utils         = require("../../utils");
var hbFilters     = require("./filters");

module.exports = function (options, file, logger, emitter) {

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
    out = hbFilters.applyFilters(processedParams, out, emitter);

    return {
        original: out,
        content:  utils.paddLines(out, utils.getPadding(options._crossbow.column || 0)),
        params:   processedParams
    }
};