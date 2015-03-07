var path = require("path");
var slugify = require("slugify");
var contains = require("lodash/collection/contains");
var moment = require("moment");
var utils = exports;

/**
 * @param content
 * @param lang
 * @returns {string}
 */
utils.wrapCode = function (content, lang) {
    content = content.replace(/^\n/, "");
    return "<pre class='highlight'><code%c>%s</code></pre>"
        .replace("%c", lang ? utils.makeLangClass(lang) : "")
        .replace("%s", content);
};

/**
 * @param arguments
 * @param name
 * @param prefix
 */
utils.getFilePath = function (name, prefix) {

    var ext = path.extname(name);

    // try and find an HTML file, as no extension was given
    if (ext === "") {
        return path.join(prefix, name + ".html");
    }

    return path.join(prefix, name);
};

/**
 *
 */
utils.makeLangClass = function (lang) {
    return " class=\"%s\"".replace("%s", lang);
};

/**
 * Wrap a snippet include
 * @param content
 * @param lang
 */
utils.wrapSnippet = function (content, lang) {
    var string = "```%lang%\n" + content + "\n```";
    return string.replace("%lang%", lang);
};

/**
 *
 * @param filePath
 * @returns {string}
 * @param base
 */
utils.makeFsPath = function (filePath, base) {
    return path.resolve(base, filePath);
};

/**
 * Include path has a special case for html files, they can be provided
 * without the extension
 * @param arguments
 * @param name
 */
utils.getIncludePath = function (name) {

    name = name.replace(/^_/, "");

    var prefix = "includes/";

    if (name.match(/^includes/)) {
        prefix = "";
    }

    if (name.match(/html$/)) {
        return prefix + name;
    }

    return prefix + name + ".html";
};

/**
 * @param {String} string
 * @param {Object} [config]
 * @returns {Array}
 */
utils.getCategories = function (string) {
    if (!string || !string.length) {
        return [];
    }
    return string.split(",")
        .map(function (item) {
            return {
                name: item.trim(),
                slug: slugify(item, "-").toLowerCase()
            };
        });
};

/**
 * @param {String} key
 * @returns {String}
 */
utils.getType = function (key) {
    return key.match(/^(posts|drafts)/)
        ? "post"
        : "page";
};

/**
 * @param {{config: Object, override: Boolean}} opts
 * @returns {*}
 */
utils.prepareFrontVars = function (opts) {

    return Array.isArray(opts.items)
        ? opts.items.map(utils.promoteVars.bind(null, opts))
        : utils.promoteVars(opts, opts.items);
};

/**
 * Promote front-matter vars to top-level (ready for templates)
 * @returns {*}
 */
utils.promoteVars = function (opts, item) {

    Object.keys(item.front).forEach(function (key) {
        if (utils.isUndefined(item[key]) || opts.override) {
            if (opts.blacklist && contains(opts.blacklist, key)) {
                return;
            }
            item[key] = item.front[key];
        }
    });

    if (opts.config && opts.config.get("dateFormat")) {
        item.date = moment(item.dateObj).format(opts.config.get("dateFormat"));
    }

    return item;
};

/**
 * @param categories
 * @param key
 * @param posts
 */
//utils.addRelated           = function (categories, key, posts) {
//
//    var items = [];
//
//    _.each(categories, function (cat) {
//        _.each(posts, function (post) {
//            if (!_.contains(items, post)) {
//                if (post.key !== key && _.contains(post.categories, cat.name)) {
//                    items.push(post);
//                }
//            }
//        });
//    });
//
//    return items;
//};

/**
 * For every include, we create a special environment.
 * Inline variables always take precedence, and any conflicting
 * names are underscored.
 * @param {Object} params
 * @param {Object} data
 * @returns {{params: {}}}
 */
utils.prepareSandbox = function (params, data) {

    var sandBox = {
        params: {}
    };

    // inline params ALWAYS take precedence
    Object.keys(params).forEach(function (key) {
        sandBox[key] = params[key];
        sandBox.params[key] = params[key];
    });

    if (!utils.isString(data)) {
        // Now add site-vars, with underscores if needed.
        Object.keys(data).forEach(function (key) {

            // if it exists in sandbox, underscore it
            if (!utils.isUndefined(sandBox[key])) {
                sandBox["_" + key] = data[key];
            } else {
                sandBox[key] = data[key];
            }
        });
    }

    return sandBox;
};

/**
 * @param string
 * @param [delimiter]
 * @returns {*|Array}
 */
utils.splitMeta = function (string, delimiter) {
    if (string.indexOf(delimiter || ":")) {
        return string.split(delimiter || ":");
    }
    return string;
};

/**
 * Take a filename and create a title from it.
 * @param slug
 * @returns {Object}
 */
utils.deslugify = function (slug) {
    return slug
        .replace(/_|-/g, " ")
        .split(" ")
        .reduce(function (joined, item) {
            return joined.length
                ? joined + " " + utils.ucfirst(item)
                : utils.ucfirst(item);
        }, "");
};

/**
 * @param str
 * @returns {string}
 */
utils.ucfirst = function (str) {
    str += "";
    var f = str.charAt(0)
        .toUpperCase();
    return f + str.substr(1);
};

/**
 * @type {{makeShortKey: makeShortKey, makePartialKey: makePartialKey, escapeCodeFences: escapeCodeFences, escapeInlineCode: escapeInlineCode, wrapCode: wrapCode, wrapSnippet: wrapSnippet, makeFsPath: makeFsPath, getIncludePath: getIncludePath, getSnippetPath: getSnippetPath, getLayoutPath: getFilePath, getCategories: getCategories, getType: getType, prepareFrontVars: prepareFrontVars, promoteVars: promoteVars, prepareSandbox: prepareSandbox, splitMeta: splitMeta}}
 */

utils.runContentTransforms = function (opts) {
    var out = "";
    var trans = opts.transforms;
    Object.keys(trans).forEach(function (key) {
        if (trans[key].when === opts.scope) {
            out = trans[key].fn(opts);
        }
    });
    return out;
};
utils.verifyParams = function (params, required) {
    return required.every(function (item) {
        return !utils.isUndefined(params[item]);
    });
};
utils.processParams = function (params, context, compiler) {
    return Object.keys(params).reduce(function (all, item) {
        if (!all[item]) {
            all[item] = compiler.safeCompile(params[item], context);
        }
        return all;
    }, {});
};
utils.paddLines = function (opts) {

    var inpre = false;
    var padding = utils.getPadding(opts.count);

    // only add newline if index id > 0;
    function returnString(item, index) {
        return index
            ? "\n" + item
            : item;
    }

    return opts.content.split(require("os").EOL)
        .reduce(function (combined, item, index) {
            if (item === "") {
                if (inpre || !opts.stripNewLines) {
                    return combined + "\n";
                }
                return combined;
            }
            if (item.match("<pre.+?>")) {
                inpre = true;
                return combined + returnString(item, index);
            }
            if (item.indexOf("</pre>") > -1) {
                inpre = false;
                return combined + returnString(item, index);
            }
            if (index) {
                if (inpre) {
                    return combined + returnString(item, index);
                }
                return combined + "\n" + padding + item;
            }
            return item;
        }, "");
};
/**
 * @param start
 */
utils.getPadding = function (start) {
    var padding = "";
    for (var i = 0, n = start; i < n; i += 1) {
        padding += " ";
    }
    return padding;
};
/**
 * @param src
 * @returns {*}
 */
utils.isSaved = function (src) {
    return src.match(/^saved:(.*)/);
};
/**
 * @param params
 * @returns {*}
 */
utils.getLang = function (params) {

    params = params || {};

    if (params.lang) {
        return params.lang;
    }

    if (params.src) {
        return path.extname(params.src).replace(".", "");
    }

    return "";
};
/**
 * @param unsafe
 * @returns {string|XML}
 */
utils.escapeHtml = function (unsafe) {
    return unsafe ? unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;") : "";
};

/**
 * @param value
 * @returns {boolean}
 */
utils.isUndefined = function (value) {
    return typeof value === "undefined";
};
/**
 * @param value
 * @returns {boolean}
 */
utils.isString = function (value) {
    return typeof value === "string";
};

/**
 * @param value
 * @returns {boolean}
 */
/**
 * @param collection
 * @param property
 * @returns {array}
 */
utils.groupByArrayProperty  = function (collection, property) {

    var out = {};

    collection.forEach(function (post) {
        if (post[property] && post[property].length) {
            post[property]
                .forEach(function (name) {
                    if (!out[name]) {
                        out[name] = {
                            name: name,
                            items: [post]
                        };
                    } else {
                        out[name].items.push(post);
                    }
                });
        }
    });

    return Object.keys(out).sort().map(function (key) {
        return out[key];
    });
};

/**
 * @param value
 * @returns {boolean}
 */
utils.isFunction = function (value) {
    return typeof value === "string";
};