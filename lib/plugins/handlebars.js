var Handlebars = require("handlebars");
var utils      = require("../utils");
var path       = require("path");
var yaml       = require("./../yaml");
var _          = require("lodash");
var objPath    = require("object-path");
var markdown   = require("../plugins/markdown");

/**
 * Plugin specific
 */
var includes   = require("./handlebars/includes");
var save       = require("./handlebars/save");
var highlight  = require("./handlebars/highlight");
var dataHelper = require("./handlebars/data");
var sep        = require("./handlebars/sep");
var current    = require("./handlebars/current");
var ifeq       = require("./handlebars/if_eq");
var ifnoteq    = require("./handlebars/if_not_eq");
var loop       = require("./handlebars/loop");
var md         = require("./handlebars/md");

/**
 * @param file
 * @param logger
 * @param emitter
 * @returns {{renderTemplate: renderTemplate, registerPartial: registerPartial}}
 */
module.exports = function (file, logger, emitter) {

    var cbUtils = {
        file:       file,
        logger:     logger,
        emitter:    emitter,
        safeCompile: function safeCompile(template, data, cb) {
            cb = cb || function() { /* noop */ };
            var out = "";
            try {
                out = renderTemplate(template, data);
                cb(null, out);
                return out;
            } catch (e) {
                cb(decorateError(e, data));
            }
        }
    };

    var dump       = require("./handlebars/dump")     (cbUtils);
    var sections   = require("./handlebars/sections") (cbUtils);
    var helpers    = require("./handlebars/helpers")  (cbUtils);

    Handlebars.registerHelper("section", sections["section"]);
    Handlebars.registerHelper("$yield",  sections["yield"]);
    Handlebars.registerHelper("$sep",    sep);

    /**
     * Return at least the required interface for crossbow
     */
    return {
        /**
         *
         */
        "addToTemplateCache": function () {/*noop*/},
        "renderTemplate":  cbUtils.safeCompile,
        "registerPartial": registerPartial,
        "readFrontMatter": cbUtils.readFrontMatter,
        "addContent":      addContent,
        "dataTransforms": {
            /**
             * Helpers that need access to @data context
             */
            "helpers": {
                when: "before item parsed",
                fn: function (item, data, config) {

                    cbUtils.data   = data;
                    cbUtils.config = config;

                    _.each({

                        "inc"       : includes,
                        "data"      : dataHelper,
                        "save"      : save,
                        "hl"        : highlight,
                        "current"   : current,
                        "if_eq"     : ifeq,
                        "if_not_eq" : ifnoteq,
                        "loop"      : loop,
                        "md"        : md

                    }, function (fn, key) {
                        Handlebars.registerHelper(key, fn.call(null, cbUtils));
                    });

                    return data;
                }
            }
        }
    };
};

/**
 * @param opts
 * @returns {*}
 */
function addContent (opts) {
    Handlebars.registerHelper("content", function (options) {
        return new Handlebars.SafeString(
            opts.config.get("prettyMarkup")
                ? utils.paddLines(opts.content, utils.getPadding(options._crossbow.column || 0))
                : opts.content
        );
    });
    return opts.context;
}

/**
 * @param key
 * @param value
 */
function registerPartial(key, value) {
    Handlebars.registerPartial(key, value);
}

/**
 * @param template
 * @param data
 */
function renderTemplate(template, data) {
    return Handlebars.compile(template)(data);
}

/**
 * @param e
 * @param data
 * @returns {*}
 */
function decorateError (e, data) {

    var yamlLineCount = objPath.get(data, "item.front.lineCount", 0);
    var HBlinecount   = objPath.get(e,    "hash.loc.first_line", 0);

    if (!e._crossbow) {
        e._crossbow = {
            line: yamlLineCount + HBlinecount
        };
    } else {
        e._crossbow.line += yamlLineCount;
    }

    e._crossbow.file = data.item.key;

    if (!e._type) {
        e._type = "compile";
    }
    if (!e._ctx) {
        e._ctx = data.item;
    }

    return e;
}