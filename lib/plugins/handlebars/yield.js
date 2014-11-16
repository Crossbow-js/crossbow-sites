var utils = require("../../utils");
var Handlebars = require("/Users/shakyshane/code/handlebars.js");

/**
 * @param sections
 * @param logger
 * @param emitter
 * @returns {Function}
 */
module.exports = function (sections, logger, emitter) {

    return function (options) {

        var args    = Array.prototype.slice.call(arguments);
        var options = args[args.length-1];

        var params = utils.processParams(options.hash || {}, options.data.root);

        if (!utils.verifyParams(params, ["name"])) {
            emitter.emit("log", {
                type: "warn",
                msg: "You must provide a `name` parameter to the section helper",
                _crossbow: options._crossbow
            });
            return;
        }
        logger.debug("Yielding section with name: {magenta:%s}", params["name"]);
        return new Handlebars.SafeString(sections[params["name"]] || "");
    }
};