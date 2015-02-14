var Handlebars = require("handlebars");
var utils      = require("../utils");
var path       = require("path");
var yaml       = require("./../yaml");
var _          = require("lodash");
var objPath    = require("object-path");
var markdown   = require("../plugins/markdown");

var PLUGIN_NAME = "templates";

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
var compile    = require("./handlebars/compile");

/**
 * @returns {{renderTemplate: renderTemplate, registerPartial: registerPartial}}
 */
module.exports.plugin = function (compiler) {

    compiler.safeCompile = function safeCompile(template, data, cb) {
        cb = cb || function() { /* noop */ };
        var out = "";
        try {
            out = renderTemplate(template, data);
            cb(null, out);
            return out;
        } catch (e) {
            cb(decorateError(e, data));
        }
    };

    var dump       = require("./handlebars/dump")     (compiler);
    var sections   = require("./handlebars/sections") (compiler);
    var helpers    = require("./handlebars/helpers")  (compiler);

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
        "renderTemplate":  compiler.safeCompile,
        "registerPartial": registerPartial,
        "readFrontMatter": compiler.readFrontMatter,
        "addContent":      addContent,
        "dataTransforms": {
            /**
             * Helpers that need access to @data context
             */
            "helpers": {
                when: "before item parsed",
                fn: function (item, data) {

                    _.each({

                        "inc"       : includes,
                        "data"      : dataHelper,
                        "save"      : save,
                        "hl"        : highlight,
                        "current"   : current,
                        "if_eq"     : ifeq,
                        "if_not_eq" : ifnoteq,
                        "loop"      : loop,
                        "md"        : md,
                        "compile"   : compile

                    }, function (fn, key) {
                        Handlebars.registerHelper(key, fn(compiler));
                    });

                    return data;
                }
            }
        },
        Handlebars: Handlebars
    };
};

module.exports["plugin:name"] = "templates";

/**
 * @param {{content: string, config: Map}} opts
 * @returns {*}
 */
function addContent (opts) {
    Handlebars.registerHelper("content", function (options) {
        return new Handlebars.SafeString(
            opts.config.get("prettyMarkup")
                ? utils.paddLines({
                    stripNewLines: opts.config.getIn(["markup", "stripNewLines"]),
                    content:       opts.content,
                    count:         options._crossbow.column || 0
                })
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

    data.item = data.item || {};
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