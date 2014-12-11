var utils = require("../../utils");
var Handlebars = require("handlebars");

/**
 * @param sections
 * @param cbUtils
 * @returns {Function}
 */
module.exports = function (sections, cbUtils) {

    return function () {

        var args    = Array.prototype.slice.call(arguments);
        var options = args[args.length-1];

        var params = utils.processParams(options.hash || {}, options.data.root, cbUtils);

        if (!utils.verifyParams(params, ["name"])) {
            cbUtils.emitter.emit("log", {
                msg: "You must provide a `name` parameter to the section helper",
                _type: "params",
                _crossbow: options._crossbow
            });
            return;
        }
        cbUtils.logger.debug("Yielding section with name: {magenta:%s}", params["name"]);
        return new Handlebars.SafeString(sections[params["name"]] || "");
    };
};