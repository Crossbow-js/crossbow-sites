var _         = require("lodash");
var Immutable = require("immutable");

var utils   = require("./utils");
var url     = require("./url");
var yaml    = require("./yaml");
var Post    = require("./post");
var Page    = require("./page");
var Partial = require("./partial");

/**
 * @type {Cache}
 */
module.exports = Cache;

/**
 * @constructor
 */
function Cache () {

    var cache = this;

    cache._items = Immutable.List([]);

    cache.add = function (item) {
        cache._items = cache._items.push(item);
        return item;
    };

    cache.byType = function (type) {
        return cache._items.filter(function (item) {
            return item.get("type") === type;
        });
    };

    cache.byKey = function (key) {
        var match = cache._items.filter(function (item) {
            return item.get("key") === key;
        });
        return match.size ? match : false;
    };

    //this._context  = "partials";
    //this._partials = [];
    //this._items    = [];
    //this._data     = {};
}

/**
 * Add a data object to the cache
 */
Cache.prototype.addData = function (key, value) {

    var obj = {};

    key = url.makeShortKey(key);

    if (yaml.isYaml(key)) {
        obj.data    = yaml.parseYaml(value);
        obj.content = value;
    } else {
        obj.data    = value;
        obj.content = JSON.stringify(value, null, 4);
    }

    this._context  = "data";

    this._data[key] = obj;

    return this;
};

/**
 * @param type
 * @param [obj]
 * @returns {*}
 */
Cache.prototype.convertKeys = function (type, obj) {

    return _.reduce(this._data, function (all, item, key) {

        var localKey = url.getBaseName(key);

        if (_.isUndefined(all[localKey])) {
            all[localKey] = item.data;
        }

        return all;

    }, obj || {});
};

/**
 * @param key
 * @param value
 */
Cache.prototype.data = function (key, value) {
    return this._data;
};

/**
 * @param key
 * @param [context]
 */
Cache.prototype.find = function (key, context) {

    context = context || this._context;

    var items = this["_" + context];

    var method = findPartials;

    switch(context) {
        case "posts"    : method = findPosts; break;
        case "pages"    : method = findPages; break;
        case "data"     : method = findData;  break;
    }

    return method(items, key);
};

/**
 * @param key
 */
Cache.prototype.findAny = function (key) {

    var content;

    _.each(["partials", "data"], function (other) {

        var match = this.find(key, other);

        if (match) {
            content = match;
            return false;
        }
    }, this);

    return content;
};


/**
 * Get the next post
 */
Cache.prototype.nextPost = function (item) {

    return this._posts[this._posts.indexOf(item) - 1];
};

/**
 * Get the previous post
 */
Cache.prototype.prevPost = function (item) {

    return this._posts[this._posts.indexOf(item) + 1];
};

/**
 * Retrieve a random collection
 */
Cache.prototype.getCollection = function (name, opts) {

    if (opts && opts.groupBy) {
        return groupBy(this["_" + name], opts.groupBy);
    }

    return this["_" + name] || null;
};

/**
 * @returns {Cache}
 */
Cache.prototype.reset = function () {

    this._posts    = [];
    this._pages    = [];
    this._partials = [];
    this._data     = {};
    return this;
};

Cache.prototype.posts = function () {
    return this._posts;
};

Cache.prototype.pages = function () {
    return this._pages;
};

Cache.prototype.partials = function () {
    return this._partials;
};

/**
 * @param items
 * @param property
 */
function sortItems(items, property) {

    items.sort(function (a, b) {
        return b[property] - a[property];
    });
}

/**
 * Find a partial by key
 * @param items
 * @param key
 * @returns {*}
 */
function findPartials(items, key) {

    return _.find(items, function (item) {
        return _.contains(item.shortKey, key);
    });
}

/**
 * Find a data section by key
 * @param items
 * @param key
 * @returns {*}
 */
function findData(items, key) {

    return _.find(items, function (value, itemKey) {
        return _.contains(key, itemKey);
    });
}

/**
 * Find a partial by key
 * @param items
 * @param key
 * @returns {*}
 */
function findPosts(items, key) {

    return _.find(items, {
        key: url.makeShortKey(key)
    });
}

/**
 * Find a partial by key
 * @param items
 * @param key
 * @returns {*}
 */
function findPages(items, key) {

    return _.find(items, {
        key: url.makeShortKey(key)
    });
}

/**
 * @param arr
 * @param item
 * @returns {*|Array|string|Buffer}
 */
function arrayPush(arr, item) {

    var result = Array.isArray(item)
        ? arr = arr.concat(item)
        : arr.push(item);

    return arr;
}

function groupBy (collection, property) {
    var out = [];
    _.each(collection, function (post) {
        if (post[property] && post[property].length) {
            _.each(post[property], function (cat) {
                var match = _.find(out, {title: cat.name});
                if (match) {
                    match.items.push(post);
                } else {
                    out.push({
                        title: cat.name,
                        items: [post]
                    });
                }
            });
        }
    });
    return out;
}


/**
 * @param {String} key
 * @param {String} value
 * @param {String} [type]
 * @returns {*}
 */
function populateCache(cache, key, value, type) {

    var url = require("./url");
    type = type || "partial";

    var partial;

    if (type === "data") {
        return cache.addData(key, value);
    }

    if (partial = cache.find(url.makeShortKey(key, file.config.cwd), "partials")){
        partial.content = value;
    } else {
        partial = new Partial(key, value, file);
        cache.addPartial(partial);
    }

    return cache;
}