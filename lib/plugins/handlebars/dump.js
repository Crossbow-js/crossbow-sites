var Handlebars    = require("/Users/shakyshane/code/handlebars.js");
var markdown      = require("../markdown");
var hbFilters     = require("./filters");

module.exports = function (cbUtils) {
    Handlebars.registerHelper("$dump", dumpHelperFn);
};

function dumpHelperFn (item) {
    return new Handlebars.SafeString(
        hbFilters.getFilter("hl")(
            JSON.stringify(item, null, 4), {
                lang: "js"
            }
        )
    );
}
