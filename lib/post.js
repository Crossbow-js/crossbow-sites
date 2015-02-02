var utils  = require("./utils");
var yaml   = require("./yaml");
var url    = require("./url");
var Immutable     = require("immutable");

module.exports = Post;

/**
 * @param opts
 * @param {Object} [config]
 * @constructor
 */
function Post (opts, config) {

    var post = this;

    post.config = config || Immutable.Map({});

    post.addData(opts)
        .addMissingData();

    return post;
}

/**
 * @param filePath
 * @param content
 * @returns {Post}
 */
Post.prototype.addData = function (opts) {

    var post = this;

    post.front      = opts.front || {};
    post.original   = opts.content;
    post.content    = opts.content;

    // Meta
    post.key        = url.makeShortKey(opts.key);
    post.type       = "post";

    post.categories = utils.getCategories(post.front.categories, post.config);
    post.tags       = utils.getCategories(post.front.tags, post.config);

    // Paths
    post.paths      = url.makePostUrl(post.key, post.config, post.categories);

    // Urls
    post.url        = post.paths.url;
    post.filePath   = post.paths.filePath;

    // Data stuff
    post.dateObj    = post.front.date;
    post.timestamp  = post.dateObj ? post.dateObj.getTime() : false;

    return post;
};

/**
 *
 */
Post.prototype.addMissingData = function () {

    /**
     * Missing Title
     */
    if (!this.front.title) {
        this.front.title = utils.deslugify(url.getBaseName(this.filePath));
    }

    /**
     * Missing date
     */
    if (!this.dateObj && this.paths.date) {
        this.dateObj   = new Date(this.paths.date);
        this.timestamp = this.dateObj.getTime();
    }
};