var path        = require("path");
var slugify     = require("slugify");
var fs          = require("fs");
var _           = require("lodash");
var moment      = require("moment");
var Handlebars  = require("/Users/shakyshane/code/handlebars.js");


/**
 * Allow highlighting within code fences, requiring NO additional syntax
 * @param content
 * @returns {*|XML|string|void}
 */
function escapeCodeFences(content) {
    return content.replace(/```([a-z-]+)\n([\s\S]+?)```/gi, function () {
        return "{`\n```" + arguments[1] + "\n" + arguments[2] + "\n```\n`}";
    });
}

/**
 * Ensure that any inline code snippets are escaped
 * @param content
 * @returns {*|XML|string|void}
 */
function escapeInlineCode(content) {
    return content.replace(/`(?!`)(.+?)`/, function () {
        return "{``" + arguments[1] + "``}";
    });
}

/**
 * @param content
 * @param lang
 * @returns {string}
 */
function wrapCode(content, lang) {
    content = content.replace(/^\n/, "");
    return "<pre><code%c>%s</code></pre>"
        .replace("%c", lang ? makeLangClass(lang) : "")
        .replace("%s", content);
}

/**
 *
 */
function makeLangClass (lang) {
    return " class=\"%s\"".replace("%s", lang);
}

/**
 * Wrap a snippet include
 * @param content
 * @param lang
 */
function wrapSnippet(content, lang) {
    var string = "```%lang%\n" + content + "\n```";
    return string.replace("%lang%", lang);
}

/**
 *
 * @param filePath
 * @returns {string}
 */
function makeFsPath(filePath, cwd) {
    return path.join(cwd, filePath);
}

/**
 * Include path has a special case for html files, they can be provided
 * without the extension
 * @param arguments
 * @param name
 */
function getIncludePath(name) {

    name = name.replace(/^_/, "");

    var prefix = "includes/";

    if (name.match(/^includes/)) {
        prefix = "";
    }

    if (name.match(/html$/)) {
        return prefix + name;
    }

    return prefix + name + ".html";
}

/**
 * @param arguments
 * @param name
 */
function getSnippetPath(name) {
    return "snippets/" + name;
}

/**
 * @param arguments
 * @param name
 */
function getLayoutPath(name) {

    var prefix = "layouts/";

    if (name.match(/\.html$/)) {
        return prefix + name;
    }

    return "layouts/" + name + ".html";
}

/**
 * @param {String} string
 * @param {Object} [config]
 * @returns {Array}
 */
function getCategories(string, config) {
    if (!string || !string.length) {
        return [];
    }
    return string.split(",")
        .map(function (item) {
            return slugify(item, "-");
        }).filter(function (item) {
            return item.length;
        });
}
/**
 * @param {String} key
 * @returns {String}
 */
function getType(key) {
    return key.match(/^(posts|drafts)/)
        ? "post"
        : "page";
}
/**
 * @param posts
 * @param config
 * @param [override]
 * @returns {*}
 */
function prepareFrontVars(posts, config, override) {

    return Array.isArray(posts)
        ? _.map(posts, promoteVars.bind(null, config, override))
        : promoteVars(config, override, posts);
}
/**
 * Promote front-matter vars to top-level (ready for templates)
 * @param post
 * @param config
 * @param [override] - force property override - frail :(
 * @returns {*}
 */
function promoteVars(config, override, post) {

    _.each(post.front, function (value, key) {
        if (_.isUndefined(post[key]) || override) {
            post[key] = value;
        }
    });

    if (config && config.dateFormat) {
        post.date = moment(post.dateObj).format(config.dateFormat);
    }

    return post;
}

/**
 * @param categories
 * @param key
 * @param posts
 */
function addRelated (categories, key, posts) {

    var items = [];

    _.each(categories, function (cat) {
        _.each(posts, function (post) {
            if (!_.contains(items, post)) {
                if (post.key !== key && _.contains(post.categories, cat)) {
                    items.push(post);
                }
            }
        });
    });

    return items;
}

/**
 * For every include, we create a special environment.
 * Inline variables always take precedence, and any conflicting
 * names are underscored.
 * @param {Object} params
 * @param {Object} data
 * @returns {{params: {}}}
 */
function prepareSandbox(params, data) {

    var sandBox = {
        params: {}
    };

    // inline params ALWAYS take precedence
    _.each(params, function (value, key) {
        sandBox[key] = value;
        sandBox.params[key] = value;
    });

    if (!_.isString(data)) {
        // Now add site-vars, with underscores if needed.
        _.each(Object.keys(data), function (key) {

            // if it exists in sandbox, underscore it
            if (!_.isUndefined(sandBox[key])) {
                sandBox["_" + key] = data[key];
            } else {
                sandBox[key] = data[key];
            }
        });
    }

    return sandBox;
}

/**
 * @param string
 * @param [delimiter]
 * @returns {*|Array}
 */
function splitMeta(string, delimiter) {
    if (string.indexOf(delimiter || ":")) {
        return string.split(delimiter || ":");
    }
    return string;
}

/**
 * Take a filename and create a title from it.
 * @param slug
 * @returns {Object}
 */
function deslugify (slug) {
    return slug.split("-").reduce(function (joined, item) {
        return joined.length
            ? joined + " " + ucfirst(item)
            : ucfirst(item);
    }, "");
}

/**
 * @param str
 * @returns {string}
 */
function ucfirst(str) {
    str += "";
    var f = str.charAt(0)
        .toUpperCase();
    return f + str.substr(1);
}

/**
 * @type {{makeShortKey: makeShortKey, makePartialKey: makePartialKey, escapeCodeFences: escapeCodeFences, escapeInlineCode: escapeInlineCode, wrapCode: wrapCode, wrapSnippet: wrapSnippet, makeFsPath: makeFsPath, getIncludePath: getIncludePath, getSnippetPath: getSnippetPath, getLayoutPath: getLayoutPath, getCategories: getCategories, getType: getType, prepareFrontVars: prepareFrontVars, promoteVars: promoteVars, prepareSandbox: prepareSandbox, splitMeta: splitMeta}}
 */
module.exports = {
    escapeCodeFences: escapeCodeFences,
    escapeInlineCode: escapeInlineCode,
    wrapCode: wrapCode,
    wrapSnippet: wrapSnippet,
    makeFsPath: makeFsPath,
    getIncludePath: getIncludePath,
    getSnippetPath: getSnippetPath,
    getLayoutPath: getLayoutPath,
    getCategories: getCategories,
    getType: getType,
    prepareFrontVars: prepareFrontVars,
    promoteVars: promoteVars,
    addRelated: addRelated,
    prepareSandbox: prepareSandbox,
    splitMeta: splitMeta,
    deslugify: deslugify,
    ucfirst: ucfirst,
    verifyParams: function (params, required) {
        return required.filter(function (item) {
            return !_.isUndefined(params[item]);
        }).length;
    },
    processParams: function (params, context) {
        return Object.keys(params).reduce(function (all, item) {
            if (!all[item]) {
                all[item] = Handlebars.compile(params[item])(context);
            }
            return all;
        }, {});
    },
    paddLines: function (string, padding) {
        return string.split("\n").reduce(function (combined, item, index) {
            if (index) {
                return combined + "\n" + padding + item;
            }
            return item;
        }, "");
    },
    /**
     * @param start
     */
    getPadding: function (start) {
        var padding = "";
        for (var i = 0, n = start; i < n; i += 1) {
            padding += " ";
        }
        return padding;
    },
    /**
     * @param src
     * @returns {*}
     */
    isSaved: function (src) {
        return src.match(/^saved:(.*)/);
    },
    /**
     * @param params
     * @returns {*}
     */
    getLang: function (params) {

        params = params || {};

        if (params.lang) {
            return params.lang;
        }

        if (params.src) {
            return path.extname(params.src).replace(".", "");
        }

        return "";
    },
    escapeHtml: function (unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};