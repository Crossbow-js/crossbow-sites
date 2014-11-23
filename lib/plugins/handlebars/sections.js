var utils = require("../../utils");

/**
 * @returns {{section: section}}
 */
module.exports = function sectionsHelper(cbUtils) {

    var sections = {};

    return {
        "section": function () {

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

            cbUtils.logger.debug("Saving content as section name: {magenta:%s}", params["name"]);
            sections[params["name"]] = options.fn(options.data.root);
        },
        "yield": require("./yield")(sections, cbUtils)
    };
};