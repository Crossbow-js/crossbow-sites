/**
 * Core modules
 */
var fs = require("fs");
var path = require("path");

/**
 * Lib
 */
var utils       = require("./lib/utils");
var yaml        = require("./lib/yaml");
var log         = require("./lib/logger");
var Post        = require("./lib/post");
var Page        = require("./lib/page");
var Paginator   = require("./lib/paginator");
var Partial     = require("./lib/partial");
var Cache       = require("./lib/cache");

var _cache = new Cache();

module.exports.clearCache = function () {
    log("debug", "Clearing all caches, (posts, pages, includes, partials)");
    _cache.reset();
};

module.exports.log = log;
module.exports.utils = utils;
module.exports.setLogLevel = log.setLogLevel;

/**
 * 3rd Party libs
 */
var highlight   = require("highlight.js");
var multiline   = require("multiline");
var merge       = require("opt-merger").merge;
var marked      = require("marked");
var _           = require("lodash");

/**
 * Templates use dust.
 * @type {exports}
 */
var dust        = require("dustjs-helpers");
dust.optimizers.format = function (ctx, node) {
    return node;
};
dust.isDebug = true;

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
    prettyUrls: true
};

/**
 * Get a file from the cache, or alternative look it up on FS from CWD as base
 * @param {String} filePath - {short-key from cache}
 * @param {Function} [transform]
 * @param {Boolean} [allowEmpty] - should file look ups be allowed to return an empty string?
 */
function getFile(filePath, transform, allowEmpty) {

    log("debug", "Getting file: %s", filePath);

    if (_.isUndefined(allowEmpty)) {
        allowEmpty = true;
    }

    var content;

    if (content = _cache.find(filePath, "partials")) {
        log("debug", "%Cgreen:Cache access%R for: %s", filePath);
        return content.content;
    } else {
        log("debug", "Not found in cache: %s", filePath);
    }

    try {
        log("debug", "%Cyellow:File System access%R for: %s", filePath);
        content = fs.readFileSync(utils.makeFsPath(filePath), "utf-8");
        populateCache(filePath,
            _.isFunction(transform)
                ? transform(content)
                : content
        );
        return content;
    } catch (e) {
        log("warn", "Could not access:%Cred: %s", e.path);
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

    var current = getFile(utils.getLayoutPath(layout));

    if (yaml.hasFrontMatter(current)) {

        // nested layout
        var _data   = yaml.readFrontMatter(current);

        renderTemplate(_data.content, data, function (err, out) {

            data.content = function (chunk) {
                return chunk.write(out);
            };

            addLayout(_data.front.layout, data, cb);
        });

    } else {

        if (!current) {
            return cb("file not found");
        }

        return renderTemplate(current, data, cb);
    }
}

/**
 * @param template
 * @param data
 * @param cb
 */
function renderTemplate(template, data, cb) {

    var id = _.uniqueId();

    dust.compileFn(template, id, false);

    dust.render(id, data, function (err, out) {
        if (err) {
            cb(err);
        } else {
            cb(null, out);
        }
    });
}

/**
 * @param string
 * @param config
 * @returns {*|exports}
 */
function processMardownContent(string, config) {

    if (!config.highlight) {
        return marked(string);
    }

    marked.setOptions({
        highlight: (function () {
            return config.markdown && config.markdown.highlight
                ? config.markdown.highlight
                : highlightSnippet;
        })()
    });

    return marked(string);
}

/**
 * @param code
 * @param [lang]
 * @param [callback]
 * @returns {*}
 */
function highlightSnippet(code, lang, callback) {
    return highlight.highlight(lang || "js", code).value;
}

/**
 * @param data
 * @param item
 */
function addPostMeta(data, item) {
    data.next = _cache.nextPost(item);
    data.prev = _cache.prevPost(item);
}

/**
 * This set's up the 'data' object with all the info any templates/includes might need.
 * @param {Object} item
 * @param {Object} config - Site config
 * @param {Object} data - Any initial data
 */
function getData(item, data, config) {

    var includeResolver = getCacheResolver(data, "include");
    var snippetResolver = getCacheResolver(data, "snippet");

    data.item = utils.prepareFrontVars(item, config);
    data.page = data.item;
    data.post = data.item;
    data.posts = utils.prepareFrontVars(_cache.posts(), config);
    data.pages = _cache.pages();

    // Site Data
    data.site.data = _cache.convertKeys("data", {});

    // Add meta data if it's a post
    if (item.type === "post") {
        addPostMeta(data.post, item);
    }

    // Helper functions
    data.inc = includeResolver;
    data.include = includeResolver;
    data.snippet = snippetResolver;

    data.highlight = snippetHelper;
    data.hl = snippetHelper;

    return data;
}

/**
 * Snippet helper
 * @param chunk
 * @param context
 * @param bodies
 * @param params
 * @returns {*}
 */
function snippetHelper(chunk, context, bodies, params) {
    if (bodies.block) {
        return chunk.capture(bodies.block, context, function (string, chunk) {
            chunk.end(
                utils.wrapCode(
                    highlightSnippet(string, params.lang), params.lang
                )
            );
        });
    }
    // If there's no block, just return the chunk
    return chunk;
}

/**
 *
 * @param out
 * @param config
 * @param data
 */
function prepareContent(out, data, config) {

    if (data.page.type !== "post") {
        return out;
    }

    if (_.isUndefined(data.page.markdown) || data.page.markdown === false) {
        return processMardownContent(out, config);
    }
}

/**
 * @param filePath
 * @param data
 * @param chunk
 * @param params
 * @returns {*}
 */
function getSnippetInclude(filePath, data, chunk, params) {

    var file = getFile(filePath, null, false);
    var lang = params.lang
        ? params.lang
        : path.extname(filePath).replace(".", "");

    if (!file) {
        return chunk.partial( // hack to force a template error
            filePath,
            dust.makeBase(data)
        );
    } else {
        return chunk.map(function (chunk) {
            return renderTemplate(utils.wrapSnippet(file, lang), data, function (err, out) {
                if (err) {
                    chunk.end("");
                } else {
                    chunk.end(out);
                }
            });
        });
    }
}

/**
 * @param path
 * @param data
 * @param chunk
 * @returns {*}
 */
function getInclude(path, data, chunk) {

    getFile(path);

    return chunk.partial(
        path,
        dust.makeBase(data)
    );
}

/**
 * @returns {Function}
 */
function getCacheResolver(data, type) {

    return function (chunk, context, bodies, params) {

        params = params || {};

        log("debug", "Looking for %s in the cache.", params.src);

        var sandBox = utils.prepareSandbox(params, data);

        return type === "include"
            ? getInclude(utils.getIncludePath(params.src), sandBox, chunk)
            : getSnippetInclude(utils.getSnippetPath(params.src), sandBox, chunk, params);
    };
}

/**
 * @param item
 * @returns {*}
 */
function getMatch(item) {

    var match;

    // Try to find an item from the cache
    if (_.isString(item)) {
        match = _cache.find(item, "posts");
        if (!match) {
            match = _cache.find(item, "pages");
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
     * Don't continue if there's no match or frontmatter.
     * Posts & Pages should've already been added with .addPost or .addPage
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
        construct(match, data, config, function (err, item) {
            if (err) {
                return cb(err);
            } else {
                cb(null, item);
            }
        });
    }
}

/**
 *
 */
function doPagination(match, data, config, cb) {

    var meta = utils.splitMeta(match.front.paginate);
    var collection = _cache.getCollection(meta[0]);

    var paginator = new Paginator(collection, match, meta[1]);
    var paginatorPages = paginator.pages();

    var compiledItems = [];

    paginatorPages.forEach(function (item, i) {

        data.paged = paginator.getMetaData(item, data.config, i);

        construct(item.page, data, config, function (err, item) {
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
 * @param item
 * @param data
 * @param config
 * @param cb
 */
function construct(item, data, config, cb) {

    data = getData(item, data, config);
    data.content = item.content;

    var escapedContent = utils.escapeCodeFences(item.content);
    escapedContent     = utils.escapeInlineCode(escapedContent);

    renderTemplate(escapedContent, data, function (err, out) {

        if (err) {
            return cb(err);
        }

        var fullContent = prepareContent(out, data, config);

        // Just write the cody content without parsing (already done);
        data.content = function (chunk) {
            return chunk.write(fullContent);
        };

        addLayout(data.page.front.layout, data, function (err, out) {
            if (err) {
                cb(err);
            } else {
                item.compiled = out;
                cb(null, item);
            }
        });
    });
}

/**
 * @param {String} key
 * @param {String} value
 * @param {String} [type]
 * @returns {*}
 */
function populateCache(key, value, type) {

    type = type || "partial";

    if (type === "data") {
        return _cache.addData(key, value);
    }

    var partial = new Partial(key, value);
    _cache.addPartial(partial);

    var shortKey = partial.shortKey;
    var partialKey = partial.partialKey;

    if (shortKey) {

        log("debug", "Adding to cache: %s", shortKey);

        dust.loadSource(dust.compile(value, shortKey));

        if (isInclude(shortKey) && partialKey) {
            dust.loadSource(dust.compile(value, partialKey));
        }

    } else {
        log("debug", "Adding to cache: %s", key);
        dust.loadSource(dust.compile(value, key));
    }

    return _cache;
}

/**
 *
 */
function isInclude(path) {
    return path.match(/^includes/);
}

/**
 * Allow api users to retrieve the cache.
 * @returns {{partials: {}, posts: Array, pages: Array}}
 */
function getCache() {
    return _cache;
}

/**
 * @param key
 * @param string
 * @param [config]
 */
function addPost(key, string, config) {

    var post;

    if (post = _cache.find(key, "posts")) {
        return post;
    }

    post = new Post(key, string, config);

    _cache.addPost(post);

    return post;
}

/**
 * @param key
 * @param string
 * @param [config]
 */
function addPage(key, string, config) {

    var page;

    if (page = _cache.find(key, "pages")) {
        return page;
    }

    page = new Page(key, string, config);

    _cache.addPage(page);

    return page;
}

/*-------------/
 *  Public API
 *------------*/

/**
 * Populate the cache
 */
module.exports.populateCache = populateCache;
module.exports.compileOne    = compileOne;
module.exports.getCache      = getCache;
module.exports.addPost       = addPost;
module.exports.addPage       = addPage;