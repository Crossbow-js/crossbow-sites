var Immutable = require("immutable");

/**
 * @type {Cache}
 */
module.exports = Cache;

/**
 * @constructor
 */
function Cache () {

    var cache = this;

    cache._items = Immutable.Map({});

    cache.add = function (item) {
        cache._items = cache._items.set(item.get("key"), item);
        return item;
    };

    cache.byType = function (type, filter) {
        var byType = cache._items.filter(function (item) {
            return item.get("type") === type;
        });
        if (filter) {
            byType = byType.filter(filter);
        }
        return byType.toList();
    };

    cache.byKey = function (key) {
        return cache._items.get(key);
    };
}
