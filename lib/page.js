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
 * @param opts
 * @param config
 * @returns {Page}
 * @constructor
 */
function Page (opts, config) {

    var page     = this;
    page.config  = config || Immutable.Map({});

    page.addData(opts)
        .applyTransforms(page.config.get("transform"));

    return page;
}

/**
 * @param opts
 * @returns {Page}
 */
Page.prototype.addData = function (opts) {

    var page        = this;
    //page.front      = opts.front || {};
    //page.original   = opts.content;
    //page.content    = opts.content;

    // Meta
    //page.key        = url.makeShortKey(opts.key);
    //page.type       = utils.getType(page.key);

    //page.paths      = url.makePageUrl(page.key, page.config);
    //
    //// Urls
    //page.url        = page.paths.url;
    //page.filePath   = page.paths.filePath;

    if (!page.front.title) {
        page.front.title = utils.deslugify(url.getBaseName(page.url));
    }

    return this;
};


/**
 * Apply custom transformations
 */
Page.prototype.applyTransforms = function (transform) {

    var page = this;

    if (_.isFunction(transform)) {
        transform(page);
    }
};