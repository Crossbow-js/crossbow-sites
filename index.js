/**
 * Core modules
 */
var fs      = require("fs");
var path    = require("path");
var events  = require("events");
var emitter = new events.EventEmitter();

/**
 * 3rd Party Modules
 */
var merge       = require("opt-merger").merge;
var _           = require("lodash");

/**
 * Lib
 */
var utils       = require("./lib/utils");
var yaml        = require("./lib/yaml");
var logger      = require("./lib/logger")(emitter);
var Post        = require("./lib/post");
var Page        = require("./lib/page");
var Paginator   = require("./lib/paginator");
var Partial     = require("./lib/partial");
var Cache       = require("./lib/cache");

/**
 * Global cache
 * @type {Cache}
 * @private
 */
var cache     = new Cache();

/**
 * Plugins
 */
var markdown   = require("./lib/plugins/markdown");
var codeFences = require("./lib/plugins/code-fences");
var drafts     = require("./lib/plugins/drafts");
var compiler   = require("./lib/plugins/dust")(getFile, emitter);

/**
 * Default Data Transforms
 */
var dataTransforms = {
    "drafts": {
        when: "before item added",
        fn: drafts
    }
};

/**
 * Default Content transforms
 */
var contentTransforms = {
    "markdown": {
        when: "before item render",
        fn: markdown
    },
    "code fences": {
        when: "before item parsed",
        fn: codeFences
    }
};

/**
 * Merge data transforms
 */
if (compiler["dataTransforms"]) {
    dataTransforms = _.merge(dataTransforms, compiler["dataTransforms"]);
}

/**
 * Default configuration
 */
var defaults = {
    /**
     * The location of your sites configuration file.
     */
    configFile: "./_config.yml",
    /**
     * Should posts be rendered using Markdown?
     */
    markdown: true,
    /**
     * Should code snippets be auto-highlighted?
     */
    highlight: true,
    /**
     * Should ALL code fences be auto-highlighted?
     */
    autoHighlight: false,
    /**
     * Data format for posts
     */
    dateFormat: "LL", // http://momentjs.com/docs/#/utilities/
    /**
     * Post url format, eg: /blog/:year/:month/:title
     */
    postUrlFormat: false,
    /**
     * Instead of `blog/post1.html,` you can have `blog/post1` instead
     */
    prettyUrls: true,
    /**
     * No layouts by default.
     */
    defaultLayout: false,
    /**
     * Initial Site config
     */
    siteConfig: {}
};

/**
 * @param filepath
 * @param transform
 * @returns {Buffer|string|*}
 */
function getOneFromFileSystem(filepath, transform) {

    var content = fs.readFileSync(filepath, "utf-8");

    populateCache(filepath,
        _.isFunction(transform)
            ? transform(content)
            : content
    );

    return content;
}

/**
 * Get a file from the cache, or alternative look it up on FS from CWD as base
 * @param {String} filePath - {short-key from cache}
 * @param {Function} [transform]
 * @param {Boolean} [allowEmpty] - should file look ups be allowed to return an empty string?
 */
function getFile(filePath, transform, allowEmpty) {

    logger.log("debug", "Getting file: %s", filePath);

    if (_.isUndefined(allowEmpty)) {
        allowEmpty = true;
    }

    var content;

    if (content = cache.find(filePath, "partials")) {
        logger.log("debug", "%Cgreen:Cache access%R for: %s", filePath);
        return content.content;
    } else {
        logger.log("debug", "Not found in cache: %s", filePath);
    }

    try {
        logger.log("debug", "%Cyellow:File System access%R for: %s", filePath);

        var filep = utils.makeFsPath(filePath);

        if (!fs.existsSync(filep)) {

            // try relative path
            if (fs.existsSync(filePath)) {

                return getOneFromFileSystem(filePath, transform);

            } else {

                filep = utils.makeFsPath(utils.getIncludePath(filePath));

                if (fs.existsSync(filep)) {

                    return getOneFromFileSystem(filePath, transform);

                } else {
                    return false;
                }
            }
        } else {
            return getOneFromFileSystem(filep, transform);
        }
    } catch (e) {
        logger.log("warn", "Could not access:%Cred: %s", e.path);
        return allowEmpty
            ? ""
            : false;
    }
}

/**
 * Allow layouts to have layouts.
 * Recursively render layout from the inside out (allows any number of nested layouts until the current
 * one does not specify a layout)
 * @param {String} layout
 * @param {Object} data
 * @param {Function} cb
 */
function addLayout(layout, data, cb) {

    var layoutPath = utils.getLayoutPath(layout);
    var layoutFile = getFile(layoutPath);

    if (!layoutFile) {
        logger.log("warn", "The layout file %Cred:_%s%R does not exist", layoutPath);
        return cb(null, data.item.content);
    }

    if (layoutFile && yaml.hasFrontMatter(layoutFile)) {

        // nested layout
        var _data   = yaml.readFrontMatter(layoutFile, data.item, data.item.paths.filePath);

        return renderTemplate(_data.content, data, function (err, out) {

            data = compiler.addContent(data, out);

            addLayout(_data.front.layout, data, cb);
        });
    }

    return renderTemplate(layoutFile, data, cb);
}

/**
 * @param template
 * @param data
 * @param cb
 */
function renderTemplate(template, data, cb) {
    compiler.renderTemplate(template, data, cb);
}

/**
 * @param data
 * @param item
 */
function addPostMeta(data, item) {
    data.next = cache.nextPost(item);
    data.prev = cache.prevPost(item);
}

/**
 * This set's up the 'data' object with all the info any templates/includes might need.
 * @param {Object} item
 * @param {Object} config - Site config
 * @param {Object} data - Any initial data
 */
function addItemData(item, data, config) {

    data.item = utils.prepareFrontVars(item, config);

    // Add related posts
    data.item.related  = utils.addRelated(item.categories, item.key, cache.posts());

    data.page  = data.item;
    data.post  = data.item;
    data.posts = utils.prepareFrontVars(cache.posts(), config);
    data.pages = cache.pages();

    // Site Data
    data.site.data = cache.convertKeys("data", {});

    // Add meta data if it's a post
    if (item.type === "post") {
        addPostMeta(data.post, item);
    }

    return data;
}
/**
 *
 * @param out
 * @param config
 * @param data
 * @param scope
 */
function applyContentTransforms(scope, out, data, config) {

    _.each(contentTransforms, function (plugin) {
        if (plugin.when === scope) {
            out = plugin.fn(out, data, config);
        }
    });

    return out;
}
/**
 * @param scope
 * @param item
 * @param config
 * @returns {*}
 */
function applyDataTransforms(scope, data, config) {

    _.each(dataTransforms, function (plugin) {
        if (plugin.when === scope) {
            data = plugin.fn(data, config);
        }
    });

    return data;
}

/**
 * @param item
 * @returns {*}
 */
function getMatch(item) {

    var match;

    // Try to find an item from the cache
    if (_.isString(item)) {
        match = cache.find(item, "posts");
        if (!match) {
            match = cache.find(item, "pages");
        }
    } else {
        return item;
    }

    return match;
}

/**
 * Compile a single file
 * @param item
 * @param config
 * @param cb
 */
function compileOne(item, config, cb) {

    /**
     * Merge configs
     */
    config = merge(_.cloneDeep(defaults), config, true);

    /**
     * Setup data + look for _config.yml if needed
     * @type {{site: (siteConfig|*), config: *}}
     */
    var data = {
        site: config.siteConfig || yaml.getYaml(defaults.configFile) || {},
        config: config
    };

    /**
     * Get the current item from the cache
     * @type {*}
     */
    var match = getMatch(item);

    /**
     * Don't continue if there's no match or front-matter.
     * Posts & Pages should have already been added with .addPost or .addPage
     */
    if (!match || !match.front) {
        return cb(null, item);
    }

    /**
     * Compile 1, or with pagination
     */
    if (match.front.paginate) {
        doPagination(match, data, config, cb);
    } else {
        constructItem(match, data, config, function (err, item) {
            if (err) {
                return cb(err);
            } else {
                cb(null, item);
            }
        });
    }
}

/**
 * @param cb
 * @param config
 * @param items
 */
function compileMany(items, config, cb) {

    var compiled = [];
    var count    = 0;

    items.forEach(function (post, i) {
        compileOne(post, config, function (err, out) {
            if (err) {
                cb(err);
            }
            count += 1;
            if (Array.isArray(out)) {
                compiled.concat(out);
            } else {
                compiled.push(out);
            }
            if (count === items.length) {
                cb(null, compiled);
            }
        });
    });
}

/**
 * Convenience method to compile all posts & pages in cache
 * @param config
 * @param cb
 */
function compileAll(config, cb) {
    var items = cache.posts().concat(cache.pages());
    return compileMany(items, config, cb);
}

/**
 * Convenience method to compile all posts in the cache
 * @param config
 * @param cb
 */
function compilePosts(config, cb) {
    return compileMany(cache.posts(), config, cb);
}

/**
 * Convenience method to compile all pages in the cache
 * @param config
 * @param cb
 */
function compilePages(config, cb) {
    return compileMany(cache.pages(), config, cb);
}

/**
 * @param {Post|Page} item
 * @param {Object} data
 * @param {Object} config
 * @param {Function} cb
 */
function doPagination(item, data, config, cb) {

    var meta           = utils.splitMeta(item.front.paginate);
    var collection     = cache.getCollection(meta[0]);

    var paginator      = new Paginator(collection, item, meta[1], config);
    var paginatorPages = paginator.pages();

    var compiledItems  = [];

    paginatorPages.forEach(function (item, i) {

        data.paged = paginator.getMetaData(item, data.config, i);

        constructItem(item.page, data, config, function (err, item) {
            if (err) {
                return cb(err);
            } else {
                compiledItems.push(item);
                if (compiledItems.length === paginatorPages.length) {
                    cb(null, compiledItems);
                }
            }
        });
    });
}

/**
 * @param {Post|Page} item
 * @param {Object} data
 * @param {Object} config
 * @param {Function} cb
 */
function constructItem(item, data, config, cb) {

    data = addItemData(item, data, config);

    data = applyDataTransforms("before item parsed", data, config);

    var escapedContent = applyContentTransforms("before item parsed", item.content, data, config);

    renderTemplate(escapedContent, data, function (err, out) {

        if (err) {
            return cb(err);
        }

        var fullContent = applyContentTransforms("before item render", out, data, config);

        // Just write the cody content without parsing (already done);
        data = compiler.addContent(data, fullContent);

        if (_.isUndefined(data.page.front.layout)) {

            if (config.siteConfig["defaultLayout"]) {

                addLayout(config.siteConfig["defaultLayout"], data, function (err, out) {
                    if (err) {
                        cb(err);
                    } else {
                        item.compiled = out;
                        cb(null, item);
                    }
                });
            } else {
                item.compiled = fullContent;
                return cb(null, item);
            }
        } else {
            addLayout(data.page.front.layout, data, function (err, out) {
                if (err) {
                    cb(err);
                } else {
                    item.compiled = out;
                    cb(null, item);
                }
            });
        }
    });
}

/**
 * @param {String} key
 * @param {String} value
 * @param {String} [type]
 * @returns {*}
 */
function populateCache(key, value, type) {

    var url = require("./lib/url");
    type = type || "partial";

    var partial;
    var shortKey;
    var partialKey;

    if (type === "data") {
        return cache.addData(key, value);
    }

    if (partial = cache.find(url.makeShortKey(key), "partials")){

        partial.content = value;
        shortKey        = partial.shortKey;
        partialKey      = partial.partialKey;

    } else {

        partial = new Partial(key, value);

        cache.addPartial(partial);

        shortKey   = partial.shortKey;
        partialKey = partial.partialKey;
    }

    compiler.addToTemplateCache(key, value, shortKey, partialKey);

    return cache;
}

/**
 * Allow api users to retrieve the cache.
 * @returns {{partials: {}, posts: Array, pages: Array}}
 */
function getCache() {
    return cache;
}

/**
 * @param key
 * @param string
 * @param [config]
 */
function addPost(key, string, config) {

    var post;

    /**
     * Update a cached post
     */
    if (post = cache.find(key, "posts")) {
        post.addData(key, string);
        utils.prepareFrontVars(post, config, true);
        return post;
    }

    /**
     * Create a new post.
     * @type {Post}
     */
    post = new Post(key, string, config);

    var filtered = applyDataTransforms("before item added", post, config);

    if (filtered) {
        cache.addPost(filtered);
        return filtered;
    }

    return post;
}

/**
 * @param key
 * @param string
 * @param [config]
 */
function addPage(key, string, config) {

    var page;

    if (page = cache.find(key, "pages")) {
        page.addData(key, string);
        utils.prepareFrontVars(page, config, true);
        return page;
    }

    page = new Page(key, string, config);

    cache.addPage(page);

    return page;
}

/**
 *
 */
function registerTransform (fn) {
    transforms.push(fn);
}

/*-------------/
 *  Public API
 *------------*/

/**
 * Cache/Log/Utils
 * @type {*|exports}
 */
module.exports.log = logger.log;
module.exports.logger = logger;
module.exports.utils = utils;
module.exports.clearCache = function () {
    logger.log("debug", "Clearing all caches, (posts, pages, includes, partials)");
    emitter.removeAllListeners();
    cache.reset();
};

/**
 * Default configurations
 */
module.exports.defaults = defaults;

/**
 * Populate the cache
 */
module.exports.populateCache = populateCache;
module.exports.compileOne    = compileOne;
module.exports.compilePosts  = compilePosts;
module.exports.compilePages  = compilePages;
module.exports.compileAll    = compileAll;
module.exports.compileMany   = compileMany;
module.exports.getCache      = getCache;
module.exports.addPost       = addPost;
module.exports.addPage       = addPage;
module.exports.registerTransform = registerTransform;
module.exports.emitter       = emitter;

/**
 * @type {getFile}
 * @private
 */
module.exports._getFile = getFile;
