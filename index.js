/**
 * Core modules
 */
var fs = require("fs");
var path = require("path");

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
var log         = require("./lib/logger");
var Post        = require("./lib/post");
var Page        = require("./lib/page");
var Paginator   = require("./lib/paginator");
var Partial     = require("./lib/partial");
var Cache       = require("./lib/cache");

/**
 * Plugins
 */
var markdown   = require("./lib/plugins/markdown");
var codeFences = require("./lib/plugins/code-fences");
var drafts     = require("./lib/plugins/drafts");

/**
 * Load default plugins
 */
var defaultPlugins = {
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
 * Global cache
 * @type {Cache}
 * @private
 */
var cache     = new Cache();

module.exports.clearCache = function () {
    log("debug", "Clearing all caches, (posts, pages, includes, partials)");
    cache.reset();
};

module.exports.log = log;
module.exports.utils = utils;
module.exports.setLogLevel = log.setLogLevel;


/**
 * Templates use dust.
 * @type {exports}
 */
var dust        = require("dustjs-helpers");
dust.optimizers.format = function (ctx, node) {
    return node;
};
dust.isDebug = true;
_.extend(dust.filters, {ucfirst: function(value){ return utils.ucfirst(value); } });

var sections = {};

/**
 * @type {{sections: {when: string, fn: fn}}}
 */
var dataTransforms = {
    "drafts": {
        when: "before item added",
        fn: drafts
    },
    "sections": {
        when: "before item parsed",
        fn: function (data) {
            data.section   = getSectionHelper(sections);
            data["yield"]  = getYieldHelper(sections);
            return data;
        }
    },
    "includes": {
        when: "before item parsed",
        fn: function (data) {
            var includeResolver = getCacheResolver(data, "include");
            data.inc       = includeResolver;
            data.include   = includeResolver;
            return data;
        }
    },
    "snippet": {
        when: "before item parsed",
        fn: function (data) {
            data.snippet = getCacheResolver(data, "snippet");
            return data;
        }
    },
    "highlight": {
        when: "before item parsed",
        fn: function (data) {
            data.highlight = snippetHelper;
            data.hl        = snippetHelper;
            return data;
        }
    }
};

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
    prettyUrls: true
};

module.exports.defaults = defaults;

/**
 * @param filep
 * @param transform
 * @returns {Buffer|string|*}
 */
function getOneFromFileSytem(filep, transform) {

    var content = fs.readFileSync(filep, "utf-8");

    populateCache(filep,
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

    log("debug", "Getting file: %s", filePath);

    if (_.isUndefined(allowEmpty)) {
        allowEmpty = true;
    }

    var content;

    if (content = cache.find(filePath, "partials")) {
        log("debug", "%Cgreen:Cache access%R for: %s", filePath);
        return content.content;
    } else {
        log("debug", "Not found in cache: %s", filePath);
    }

    try {
        log("debug", "%Cyellow:File System access%R for: %s", filePath);
        var filep = utils.makeFsPath(filePath);
        if (!fs.existsSync(filep)) {
            filep = utils.makeFsPath(utils.getIncludePath(filePath));
            if (fs.existsSync(filep)) {
                return getOneFromFileSytem(filep, transform);
            } else {
                     return false;
            }
        } else {
            return getOneFromFileSytem(filep, transform);
        }
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
 * @param data
 * @param item
 */
function addPostMeta(data, item) {
    data.next = cache.nextPost(item);
    data.prev = cache.prevPost(item);
}

/**
 * @param sections
 * @returns {Function}
 */
function getSectionHelper(sections) {
    return function (chunk, context, bodies, params) {
        var output = "";
        chunk.tap(function (data) {
            output += data;
            return "";
        }).render(bodies.block, context).untap();
        if (!sections[params.name]) {
            sections[params.name] = [];
        }
        sections[params.name].push(output);
        return chunk;
    };
}

/**
 * @param sections
 * @returns {Function}
 */
function getYieldHelper(sections) {
    return function (chunk, context, bodies, params) {
        var sec = sections[params.name];
        if (sec && sec.length) {
            return chunk.write(sec.join(""));
        }
        return chunk;
    };
}
/**
 * This set's up the 'data' object with all the info any templates/includes might need.
 * @param {Object} item
 * @param {Object} config - Site config
 * @param {Object} data - Any initial data
 */
function getData(item, data, config) {

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
                utils.wrapCode(markdown.highlight(string, params.lang), params.lang)
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
 * @param scope
 */
function applyContentTransforms(scope, out, data, config) {

    _.each(defaultPlugins, function (plugin) {
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

    var rendered = chunk.partial(
        path,
        dust.makeBase(data)
    );

    return rendered;
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
 * @returns {*}
 */
function compileAll(config, cb) {
    var items = cache.posts().concat(cache.pages());
    return compileMany(items, config, cb);
}
/**
 * Convenience method to compile all posts in the cache
 * @param config
 * @param cb
 * @returns {*}
 */
function compilePosts(config, cb) {
    return compileMany(cache.posts(), config, cb);
}

/**
 * Convenience method to compile all pages in the cache
 * @param config
 * @param cb
 * @returns {*}
 */
function compilePages(config, cb) {
    return compileMany(cache.pages(), config, cb);
}

/**
 *
 */
function doPagination(item, data, config, cb) {

    var meta       = utils.splitMeta(item.front.paginate);
    var collection = cache.getCollection(meta[0]);

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
 * @param item
 * @param data
 * @param config
 * @param cb
 */
function constructItem(item, data, config, cb) {

    data = getData(item, data, config);

    data = applyDataTransforms("before item parsed", data, config);

    var escapedContent = applyContentTransforms("before item parsed", item.content, data, config);

    renderTemplate(escapedContent, data, function (err, out) {

        if (err) {
            return cb(err);
        }

        var fullContent = applyContentTransforms("before item render", out, data, config);

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

    addToDust(key, value, shortKey, partialKey);

    return cache;
}

/**
 * Load partials into Dust's internal cache
 * @param key
 * @param value
 * @param shortKey
 * @param partialKey
 */
function addToDust(key, value, shortKey, partialKey) {
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