var Handlebars = require("/Users/shakyshane/code/handlebars.js");
var utils      = require("../utils");
var path       = require("path");
var markdown   = require("../plugins/markdown");

/**
 * Plugin specific
 */
var includes   = require("./handlebars/includes");
var save       = require("./handlebars/save");
var highlight  = require("./handlebars/highlight");

/**
 * @param file
 * @param log
 * @returns {{renderTemplate: renderTemplate, registerPartial: registerPartial}}
 */
module.exports = function (file, logger, emitter) {

    var _sections = {};

    Handlebars.registerHelper("section", function (options) {
        var params = utils.processParams(options.hash || {}, options.data.root);
        if (!utils.verifyParams(params, ["name"])) {
            emitter.emit("log", {
                type: "warn",
                msg: "You must provide a `name` parameter to the section helper",
                _crossbow: options._crossbow
            });
            return;
        }

        logger.debug("Saving content as section name: {magenta:%s}", params["name"]);
        _sections[params["name"]] = options.fn(options.data.root);
    });

    Handlebars.registerHelper("$yield", function (options) {
        var params = utils.processParams(options.hash || {}, options.data.root);
        if (!utils.verifyParams(params, ["name"])) {
            emitter.emit("log", {
                type: "warn",
                msg: "You must provide a `name` parameter to the section helper",
                _crossbow: options._crossbow
            });
            return;
        }

        return _sections[params["name"]] || "";
    });

    /**
     * Return at least the required interface for crossbow
     */
    return {
        /**
         *
         */
        "addToTemplateCache": function () {/*noop*/},
        "renderTemplate":  renderTemplate,
        "registerPartial": registerPartial,
        "addContent":      addContent,
        sections:          sections.bind(null, file, logger),
        snippet:           snippet.bind(null, file, logger),
        highlight:         highlight.bind(null, file, logger),
        "dataTransforms": {
            /**
             * Helpers to be used with @
             */
            "helpers": {
                when: "before item parsed",
                fn: function (item, data, config) {
                    Handlebars.registerHelper('inc',  includes(data, file, logger, emitter));
                    Handlebars.registerHelper('save', save(data, file, logger, emitter));
                    Handlebars.registerHelper('hl',   highlight(data, file, logger, emitter));
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
 * @param file
 * @param log
 * @param data
 * @param config
 */
function _highlight(file, log, data, config) {

    data.highlight = function (name, inline) {

        inline = inline || name.hash;

        var lang = inline.lang
            ? inline.lang
            : "js";

        return utils.wrapCode(
            markdown.highlight(name.fn(), lang), lang
        );
    };

    return data;
}

/**
 * @param file
 * @param log
 * @param data
 * @param config
 */
function snippet(file, log, data, config) {

    data.snippet = function (name, inline) {

        var file = file(name);

        if (!file) {
            return "";
        }

        var lang = inline.hash.lang
            ? inline.hash.lang
            : path.extname(name).replace(".", "");

        var snippet = new Handlebars.SafeString(
            utils.wrapCode(
                markdown.highlight(file, lang), lang
            )
        );
    };
    return data;
}

/**
 * @param data
 * @param config
 * @returns {*}
 */
function sections(file, log, data, config) {

    var sections = {};

    data.section = function (name, inline, var3) {
        if (!sections[name]) {
            sections[name] = [];
        }
        var sandBox = utils.prepareSandbox({}, inline.data.root);
        sections[name].push(inline.fn(sandBox));
    };

    data["yield"] = function (name, inline) {

        var sec = sections[name];
        if (sec && sec.length) {
            return new Handlebars.SafeString(
                sec.join("")
            );
        }
    };

    return data;
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
function renderTemplate(template, data, cb) {
    var out = Handlebars.compile(template)(data);
    cb(null, out);
}