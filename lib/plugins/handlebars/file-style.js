var Handlebars    = require("handlebars");
var utils         = require("../../utils");
var hbFilters     = require("./filters");
var objPath       = require("object-path");

module.exports = function (options, compiler) {

    //var params   = options.hash || {};
    //var err;
    //
    //var processedParams = utils.processParams(params, options.data.root, compiler);
    //var src = processedParams.src;
    //
    //if (!src) {
    //    return "";
    //}

    var sandBox         = utils.prepareSandbox(processedParams, options.data.root);
    var savedData       = compiler.data["saved"] || {};
    var saved           = utils.isSaved(processedParams.src);
    var out             = "";
    var processed;

    if (saved) {
        out = savedData[saved[1]] || "";
    } else {
        out  = compiler.file.getFile({path: processedParams.src});
    }

    //if (!out) {
    //    err = new Error("File not found: " + processedParams.src);
    //    err._crossbow = options._crossbow;
    //    err._params   = processedParams;
    //    throw err;
    //}

    processed = compiler.safeCompile(out.content || "", sandBox);
    processed = hbFilters.applyFilters(processedParams, processed, compiler.emitter);

    return {
        original:  out,
        processed: utils.paddLines(processed || "", utils.getPadding(options._crossbow.column || 0)),
        file:      out,
        content:   processed,
        params:    processedParams
    };
};