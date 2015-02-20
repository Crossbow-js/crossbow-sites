var url         = require("../url");

/**
 * From a path, and using config try to infer the type
 * @param {string} filepath
 * @returns {string}
 */
module.exports = function getType(filepath) {

    var compiler = this;

    var rel   = url.makeFilepath(filepath, compiler.config).split("/")[0];

    var match;

    compiler.config.get("dirs").forEach(function (value, key) {
        if (value === rel) {
            match = key;
            return true;
        }
    });

    if (match) {
        match = match.split(":");
        if (match[1]) {
            return match[1];
        }
    }

    // no match if no _underscore, assume page

    if (rel[0] !== "_") {
        return "page";
    }

    return "partial";
};