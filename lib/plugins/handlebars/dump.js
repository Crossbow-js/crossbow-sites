var Handlebars    = require("/Users/shakyshane/code/handlebars.js");
var markdown      = require("../markdown");
var utils      = require("../../utils");
var hbFilters     = require("./filters");

module.exports = function (cbUtils) {
    Handlebars.registerHelper("$dump", dumpHelperFn);
};

function dumpHelperFn (item) {
    return new Handlebars.SafeString(
        utils.wrapCode(
            JSON.stringify(item, null, 4)
        )
    );
}
