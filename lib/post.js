var utils  = require("./utils");
var yaml   = require("./yaml");
var url    = require("./url");
var Immutable     = require("immutable");

module.exports = Post;

/**
 * @param {String} filePath
 * @param {String} content
 * @param {Object} [config]
 * @constructor
 */
function Post (filePath, content, config) {

    this.config = config || Immutable.Map({});

    this.addData(filePath, content)
        .addMissingData();

    return this;
}

/**
 * @param filePath
 * @param content
 * @returns {Post}
 */
Post.prototype.addData = function (filePath, content) {

    // Front matter/content split
    this.split      = yaml.readFrontMatter({
        file:     content,
        context:  this,
        filePath: filePath
    });

    this.front      = this.split.front;
    this.content    = this.split.content;
    this.original   = content;

    // Meta
    this.key        = url.makeShortKey(filePath);
    this.type       = "post";

    this.categories = utils.getCategories(this.front.categories, this.config);
    this.tags       = utils.getCategories(this.front.tags, this.config);

    // Paths
    this.paths      = url.makePostUrl(this.key, this.config, this.categories);

    // Urls
    this.url        = this.paths.url;
    this.filePath   = this.paths.filePath;

    // Data stuff
    this.dateObj    = this.front.date;
    this.timestamp  = this.dateObj ? this.dateObj.getTime() : false;

    return this;
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