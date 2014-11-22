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
 * Logging
 * @type {exports}
 */
var logger      = require("./lib/logger")(emitter);

/**
 * Lib
 */
var utils       = require("./lib/utils");
var yaml        = require("./lib/yaml");
var Post        = require("./lib/post");
var Page        = require("./lib/page");
var Paginator   = require("./lib/paginator");
var Partial     = require("./lib/partial");

/**
 * Global cache
 * @type {Cache}
 * @private
 */
var Cache       = require("./lib/cache");
var cache       = new Cache(populateCache);

/**
 * Get a file from cache/FS - ALL methods/plugins use this.
 */
var file              = require("./lib/file")(cache, logger);

/**
 * Template compiler
 */
var compiler          = require("./lib/plugins/handlebars")(file, logger, emitter);

/**
 * Default Data Transforms
 */
var dataTransforms    = require("./lib/plugins/dataTransforms")(cache);

/**
 * Default content Transforms
 */
var contentTransforms = require("./lib/plugins/contentTransforms")(cache);

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
     * Padd content blocks to enable nicer source code
     */
    prettyMarkup: true,
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
 * Allow layouts to have layouts.
 * Recursively render layout from the inside out (allows any number of nested layouts until the current
 * one does not specify a layout)
 * @param {String} layout
 * @param {Object} data
 * @param {Function} cb
 */
function addLayout(layout, data, cb) {

    var layoutPath = utils.getLayoutPath(layout);
    var layoutFile = file.getFile(layoutPath);

    if (!layoutFile) {
        logger.warn("The layout file {red:_%s} does not exist", layoutPath);
        return cb(null, data.item.content);
    }

    if (layoutFile && yaml.hasFrontMatter(layoutFile.content)) {

        // nested layout
        // file, context, filePath
        var _data   = yaml.readFrontMatter({
            file:     layoutFile.content,
            context:  data.item,
            filePath: data.item.paths.filePath
        });

        return renderTemplate(_data.content, data, function (err, out) {

            data = compiler.addContent({
                context: data,
                content: out,
                config: data.config
            });

            addLayout(_data.front.layout, data, cb);
        });
    }

    return renderTemplate(layoutFile.content, data, cb);
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
 * @param data
 * @returns {*}
 */
function applyDataTransforms(scope, item, data, config) {

    _.each(dataTransforms, function (plugin) {
        if (plugin.when === scope) {
            data = plugin.fn(item || {}, data || {}, config);
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
     * Set CWD on the fly
     */
    if (_.isString(config.cwd)) {
        file.config.cwd = config.cwd;
    }

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

    items.forEach(function (post) {
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

    data = applyDataTransforms("before item parsed", item, data, config);

    renderTemplate(
        applyContentTransforms("before item parsed", item.content, data, config),
        data,
        handleSuccess.bind(null, item, data, config, cb));
}

/**
 * @param err
 * @param out
 * @param data
 * @param item
 * @param config
 * @param cb
 * @returns {*}
 */
function handleSuccess(item, data, config, cb, err, out) {

    if (err) {
        return cb(err);
    }

    var fullContent = applyContentTransforms("before item render", out, data, config);

    // Just write the body content without parsing (already done);
    data = compiler.addContent({
        content: fullContent,
        context: data,
        config:  config
    });

    var layout = getLayoutName(data.page.front.layout, config);

    if (layout) {
        return appendLayout(layout, item, data, cb);
    }

    item.compiled = fullContent;

    return cb(null, item);
}

/**
 * @param layout
 * @param config
 * @returns {*}
 */
function getLayoutName(layout, config) {
    if (_.isUndefined(layout)) {
        return config.siteConfig["defaultLayout"];
    }
    return layout;
}

/**
 * @param layout
 * @param item
 * @param data
 * @param cb
 */
function appendLayout(layout, item, data, cb) {
    addLayout(layout, data, function (err, out) {
        if (err) {
            cb(err);
        } else {
            item.compiled = out;
            cb(null, item);
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

    if (partial = cache.find(url.makeShortKey(key, file.config.cwd), "partials")){

        partial.content = value;
        shortKey        = partial.shortKey;
        partialKey      = partial.partialKey;

    } else {

        partial = new Partial(key, value, file);

        cache.addPartial(partial);

        shortKey   = partial.shortKey;
        partialKey = partial.partialKey;
    }

    //compiler.addToTemplateCache(key, value, shortKey, partialKey);

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

    config = config || {};

    var post;

    if (!config.cwd) {
        config.cwd = file.config.cwd;
    }

    /**
     * Update a cached post
     */
    if (post = cache.find(key, "posts")) {
        post.addData(key, string);
        utils.prepareFrontVars({
            items:    post,
            config:   config,
            override: true,
            blacklist: ["categories"]
        });
        return post;
    }

    /**
     * Create a new post.
     * @type {Post}
     */
    post = new Post(key, string, config);

    var filtered = applyDataTransforms("before item added", post, {}, config);

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
        utils.prepareFrontVars({
            items: page,
            config: config,
            override: true
        });
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
module.exports.logger = logger;
module.exports.utils = utils;
module.exports.clearCache = function () {
    logger.debug("Clearing all caches, (posts, pages, includes, partials)");
    emitter.removeAllListeners();
    file.reset();
    cache.reset();
};

/**
 * @param {String} cwd
 */
module.exports.setCwd = function (cwd) {
    file.config.cwd = cwd;
};

/**
 * Default configurations
 */
module.exports.defaults = defaults;

/**
 * Populate the cache
 */
module.exports.populateCache        = populateCache;
module.exports.compileOne           = compileOne;
module.exports.compilePosts         = compilePosts;
module.exports.compilePages         = compilePages;
module.exports.compileAll           = compileAll;
module.exports.compileMany          = compileMany;
module.exports.getCache             = getCache;
module.exports.addPost              = addPost;
module.exports.addPage              = addPage;
module.exports.registerTransform    = registerTransform;
module.exports.emitter              = emitter;
module.exports.file                 = file;

/**
 * @type {getFile}
 * @private
 */
module.exports._getFile = file.getFile;
