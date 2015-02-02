var utils = require("./utils");
var url   = require("./url");
var yaml  = require("./yaml");
var _     = require("lodash");
var Immutable     = require("immutable");

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
function Page (opts, config) {

    this.config     = config || Immutable.Map({});

    this.addData(opts)
        .applyTransforms(this.config.get("transform"));

    return this;
}

/**
 * @param filePath
 * @param content
 */
Page.prototype.addData = function (opts) {

    this.front      = opts.front || {};
    this.original   = opts.content;
    this.content    = opts.content;

    // Meta
    this.key        = url.makeShortKey(opts.key);
    this.type       = utils.getType(this.key);

    this.paths      = url.makePageUrl(this.key, this.config);

    // Urls
    this.url        = this.paths.url;
    this.filePath   = this.paths.filePath;

    return this;
};


/**
 * Apply custom transformations
 */
Page.prototype.applyTransforms = function (transform) {
    if (_.isFunction(transform)) {
        transform(this);
    }
};