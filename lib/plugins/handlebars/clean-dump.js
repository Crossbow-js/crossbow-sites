var Handlebars    = require("handlebars");

module.exports = function () {
    Handlebars.registerHelper("$cleandump", dumpHelperFn);
};

function dumpHelperFn (item) {
    const stringified = JSON.stringify(item, null, 2);
    return new Handlebars.SafeString(
        `<pre>${stringified}</pre>`
    );
}
