
var sections = {};

var dust     = require("dustjs-helpers");
var _        = require("lodash");
var markdown = require("./markdown");
var utils    = require("../utils");
var path     = require("path");

module.exports = function (getFile, cache, log) {

    var sections = {};

    return {
        addToTemplateCache: addToDust.bind(null, log),
        "renderTemplate": renderTemplate,
        "dataTransforms": {
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
                    var includeResolver = getCacheResolver(data, "include", getFile, log);
                    data.inc       = includeResolver;
                    data.include   = includeResolver;
                    return data;
                }
            },
            "snippet": {
                when: "before item parsed",
                fn: function (data) {
                    data.snippet = getCacheResolver(data, "snippet", getFile, log);
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
        }
    };
};

/**
 *
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
 * @param filePath
 * @param data
 * @param chunk
 * @param params
 * @returns {*}
 * @param getFile
 */
function getSnippetInclude(filePath, data, chunk, params, getFile) {

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
 * @param path
 * @param data
 * @param chunk
 * @returns {*}
 */
function getInclude(path, data, chunk) {

    var rendered = chunk.partial(
        path,
        dust.makeBase(data)
    );

    return rendered;
}

/**
 * @returns {Function}
 */
function getCacheResolver(data, type, getFile, log) {

    return function (chunk, context, bodies, params) {

        params = params || {};

        var path;

        log("debug", "Looking for %s in the cache.", params.src);

        var sandBox = utils.prepareSandbox(params, data);

        if (type === "include") {
            path = utils.getIncludePath(params.src);
            var file = getFile(path);
            return getInclude(path, sandBox, chunk);
        } else {
            path = utils.getSnippetPath(params.src);
            console.log(path);
            return getSnippetInclude(path, sandBox, chunk, params, getFile);
        }
    };
}

/**
 * Load partials into Dust's internal cache
 * @param key
 * @param value
 * @param shortKey
 * @param partialKey
 */
function addToDust(log, key, value, shortKey, partialKey) {
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