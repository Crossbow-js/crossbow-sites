var dust     = require("crossbow-helpers");
var _        = require("lodash");
var utils    = require("../utils");
var slugify  = require("slugify");
var path     = require("path");

dust.optimizers.format = function (ctx, node) {
    return node;
};

dust.isDebug = true;

/**
 * @type {{ucfirst: ucfirst}}
 */
var filters = {
    ucfirst: function (value) {
        return utils.ucfirst(value);
    },
    slugify: function (value) {
        return slugify(value, "-");
    },
    lowercase: function (value) {
        return value.toLowerCase();
    }
};

_.extend(dust.filters, filters);

module.exports = function (getFile, emitter) {

    var helpers  = require("./dust-helpers")(getFile, emitter, dust);

    /**
     * Fix a bug with sep helper
     * @type {sep}
     */
    dust.helpers["sep"]         = helpers.sep;
    dust.helpers["section"]     = helpers.section;
    dust.helpers["yield"]       = helpers["yield"];
    dust.helpers["highlight"]   = helpers["highlight"];
    dust.helpers["hl"]          = helpers["highlight"];

    return {
        /**
         * Add partials to Dust's internal cache
         */
        "addToTemplateCache": addToDust.bind(null, emitter),
        /**
         * Render templates
         */
        "renderTemplate": renderTemplate,
        /**
         *
         */
        "addContent": function (data, content) {
            data.content = function (chunk) {
                return chunk.write(content);
            };
            return data;
        },
        /**
         *
         */
        "dataTransforms": {
            /**
             * Helpers to be used with @
             */
            "helpers": {
                when: "before item parsed",
                fn: function (item, data, config) {
                    var inc = helpers.includes(data);
                    dust.helpers["inc"]     = inc;
                    dust.helpers["include"] = inc;
                    dust.helpers["data"]    = helpers["data"](data);
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

//    var id = _.uniqueId();

    try {
        dust.compileFn(template, data.item.key, false);
    } catch (e) {
        var filePath = data.item.paths.filePath;
        var match = e.toString().replace(/line : (\d{0,})/, function () {
            return "line " + (parseInt(data.item.lineCount, 10) + parseInt(arguments[1], 10) + 1);
        });
        cb(filePath + " - " + match);
    }

    dust.render(data.item.key, data, function (err, out) {
        if (err) {
            cb(err);
        } else {
            cb(null, out);
        }
    });
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
 * Load partials into Dust's internal cache
 * @param key
 * @param value
 * @param shortKey
 * @param partialKey
 */
function addToDust(emitter, key, value, shortKey, partialKey) {

    try {

        if (shortKey) {

//            log("debug", "Adding to cache: %s", shortKey);

            dust.loadSource(dust.compile(value, shortKey));

            if (isInclude(shortKey) && partialKey) {
                dust.loadSource(dust.compile(value, partialKey));
            }

            return;
        }

//        log("debug", "Adding to cache: %s", key);
        dust.loadSource(dust.compile(value, key));

    } catch (e) {

//        log("warn", shortKey + " - " + e.toString());
    }
}

/**
 *
 */
function isInclude(path) {
    return path.match(/^includes/);
}