var Handlebars    = require("handlebars");
var utils      = require("../../utils");

module.exports = function () {
    Handlebars.registerHelper("$dump", dumpHelperFn);
};

function dumpHelperFn (item) {
    return new Handlebars.SafeString(
        utils.wrapCode(
            utils.escapeHtml(JSON.stringify(item, null, 4))
        )
    );
}
