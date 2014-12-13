var drafts = require("../plugins/drafts");
var utils  = require("../utils");

/**
 * @param cache
 */
module.exports = function (cache) {
    return {
        "drafts": {
            when: "before item added",
            fn: drafts
        },
        "post+page data": {
            when: "before item parsed",
            fn: function (item, data, config) {
                data = addItemData(cache, item, data, config);
                return data;
            }
        }
    };
};


/**
 * This set's up the 'data' object with all the info any templates/includes might need.
 * @param {Object} item
 * @param {Object} config - Site config
 * @param {Object} data - Any initial data
 * @param cache
 */
function addItemData(cache, item, data, config) {

    data.item = utils.prepareFrontVars({items: item, config: config});

    // Add related posts
    //data.item.related  = utils.addRelated(item.categories, item.key, cache.posts());

    data.page       = data.item;
    data.post       = data.item;
    data.posts      = utils.prepareFrontVars({items: cache.posts(), config: config});
    data.pages      = utils.prepareFrontVars({items: cache.pages(), config: config});

    data.categories = cache.getCollection("posts", {groupBy: "categories"});
    data.tags       = cache.getCollection("posts", {groupBy: "tags"});

    // Site Data
    data.site      = config.get("siteConfig").toJS();
    data.site.data = cache.convertKeys("data", {});

    // Add meta data if it's a post
    if (item.type === "post") {
        addPostMeta(cache, data.post, item);
    }

    return data;
}


/**
 * @param data
 * @param item
 * @param cache
 */
function addPostMeta(cache, data, item) {
    data.next = cache.nextPost(item);
    data.prev = cache.prevPost(item);
}