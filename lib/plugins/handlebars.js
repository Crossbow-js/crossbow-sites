var Handlebars = require("/Users/shakyshane/code/handlebars.js");
var utils      = require("../utils");
var path       = require("path");
var _          = require("lodash");
var markdown   = require("../plugins/markdown");

/**
 * Plugin specific
 */
var includes   = require("./handlebars/includes");
var save       = require("./handlebars/save");
var highlight  = require("./handlebars/highlight");
var dataHelper = require("./handlebars/data");
var sep        = require("./handlebars/sep");

/**
 * @param file
 * @param log
 * @returns {{renderTemplate: renderTemplate, registerPartial: registerPartial}}
 */
module.exports = function (file, logger, emitter) {

    var dump       = require("./handlebars/dump")(logger, emitter);
    var sections   = require("./handlebars/sections")(logger, emitter);
    var helpers    = require("./handlebars/helpers")(logger, emitter);
    var current    = require("./handlebars/current")(logger, emitter);

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
        "renderTemplate":  function (template, data, cb) {
            try {
                var out = renderTemplate(template, data);
                cb(null, out);
            } catch (e) {
                emitter.emit("_error", {
                    error: e
                });
                cb(e);
            }
        },
        "registerPartial": registerPartial,
        "addContent":      addContent,
        "dataTransforms": {
            /**
             * Helpers that need access to @data context
             */
            "helpers": {
                when: "before item parsed",
                fn: function (item, data, config) {
                    Handlebars.registerHelper('data', dataHelper(data, file, logger, emitter));
                    Handlebars.registerHelper('inc',  includes(data, file, logger, emitter));
                    Handlebars.registerHelper('save', save(data, file, logger, emitter));
                    Handlebars.registerHelper('hl',     highlight(data, file, logger, emitter));
                    Handlebars.registerHelper('current', current(data, file, logger, emitter));
                    return data;
                }
            }
        }
    }
};

/**
 * @param context
 * @param content
 * @returns {*}
 */
function addContent (context, content) {
    Handlebars.registerHelper("content", function (options) {
        return new Handlebars.SafeString(content);
    });
    return context;
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
 * @param cb
 */
function renderTemplate(template, data) {
    return Handlebars.compile(template)(data);
}