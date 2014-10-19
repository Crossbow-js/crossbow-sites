var utils     = require("../../utils");

module.exports = function (chunk, context, params, data, log) {

    var obj = {};
    params = params || {};

    obj.templateName = context.getTemplateName();

    if (!params.src) {
        log("warn", "You need to supply a `src` param for includes", obj.templateName);
        obj.error = true;
        return obj;
    }

    obj.partialPath = params.src;

    // exit early if "saved"
    var sections;
    
    if (sections = obj.partialPath.match(/^saved:(.+)/)) {
        chunk.write(data.saved[sections[1]]);
        obj.saved = true;
        return obj;
    }

    obj.sandBox = utils.prepareSandbox(params, data);
    
    return obj;
};