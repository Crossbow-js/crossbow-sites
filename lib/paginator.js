var utils = require("./utils");
var Page  = require("./page");
var _     = require("lodash");

/**
 * @type {Paginator}
 */
module.exports = Paginator;

/**
 * @param items
 * @param item
 * @param count
 * @returns {Paginator}
 * @constructor
 */
function Paginator (items, item, count) {

    // Front matter/content split
    count = count || 2;

    this._paged  = this.paginate(count, items);
    this._pages  = this.makePaginationPages(item, this._paged);
    this._index  = item;

    this.perPage = count;

    return this;
}

/**
 * @param item
 * @param config
 * @param i
 * @returns {*}
 */
Paginator.prototype.getMetaData = function (item, config, i) {

    var next = this._pages[i+1];
    var prev = this._pages[i-1];

    return {
        perPage: this.perPage,
        items: utils.prepareFrontVars(item.items, config),
        next:  next ? utils.prepareFrontVars(next.page, config) : null,
        prev:  prev ? utils.prepareFrontVars(prev.page, config) : null
    };
};
/**
 * @returns {*}
 */
Paginator.prototype.pages = function () {
    return this._pages;
};

/**
 * Get the previous post
 */
Paginator.prototype.paginate = function (count, items) {

    var arrays      = [];
    var clonedItems = _.cloneDeep(items);

    while (clonedItems.length > 0) {
        arrays.push(clonedItems.splice(0, count));
    }

    return arrays;
};

/**
 * @param item
 * @param collection
 */
Paginator.prototype.makePaginationPages = function(item, collection) {

    return _.map(collection, function (items, i) {

        // Make a key for current page
        var name = getKey(item.paths, i);

        // Make a new page
        var page = new Page(name, item.original, {
            transform: getTransforms(i)
        });

        return {
            page: utils.prepareFrontVars(page, {}),
            items: items
        };
    });
};

/**
 * @param paths
 * @param i
 */
function getKey(paths, i) {

    var name     = paths.filePath;
    var basename = paths.url.replace(/^\//, "");

    if (i !== 0) {
        name = basename + "/page%s/index.html".replace("%s", i + 1);
    }

    return name;
}

/**
 * Paginated pages need transforms, such as title
 * @param i
 * @returns {Function}
 */
function getTransforms(i) {

    return function (item) {
        if (i !== 0) {
            item.front.title = item.front.title + " - Page " + (i+1);
        }
    };
}