var utils = require("./utils");
var url   = require("./url");
var yaml  = require("./yaml");
var _     = require("lodash");

/**
 * @type {Page}
 */
module.exports = Page;

/**
 * @param {String} filePath
 * @param {String} content
 * @param {Object} [config]
 * @constructor
 */
function Page (filePath, content, config) {

    this.config     = config || {};

    // Front matter/content split
    this.split      = yaml.readFrontMatter(content);
    this.front      = this.split.front;
    this.content    = this.split.content;
    this.original   = content;

    // Meta
    this.key        = url.makeShortKey(filePath);
    this.type       = utils.getType(this.key);
    this.paths      = url.makePageUrl(this.key, config);

    // Urls
    this.url        = this.paths.url;
    this.filePath   = this.paths.filePath;

    // Transforms
    this.applyTransforms(this.config.transform);

    return this;
}

/**
 * Apply custom transformations
 */
Page.prototype.applyTransforms = function (transform) {
    if (_.isFunction(transform)) {
        transform(this);
    }
};