var utils = require("./utils");
var url   = require("./url");

/**
 * @type {Partial}
 */
module.exports = Partial;

/**
 * @param filePath
 * @param content
 * @param config
 * @returns {Partial}
 * @constructor
 */
function Partial (filePath, content, file) {

    this.filePath   = filePath;
    this.shortKey   = url.makeShortKey(filePath, file.config.cwd);
    this.partialKey = url.getBaseName(this.shortKey);
    this.content    = content;

    return this;
}

