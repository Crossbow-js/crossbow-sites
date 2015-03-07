var Handlebars = require("handlebars");
var utils      = require("../utils");
var objPath    = require("object-path");
var Transform  = require("stream").Transform;


/**
 * @returns {{renderTemplate: renderTemplate, registerPartial: registerPartial}}
 */
module.exports.plugin = function (compiler) {

    /**
     * Wrap Handlebars rendering for error control
     * @param template
     * @param data
     * @param cb
     * @returns {string}
     */
    compiler.safeCompile = function safeCompile(template, data, cb) {
        cb = cb || function() { /* noop */ };
        var out = "";
        try {
            out = renderTemplate(template, data);
            cb(null, out);
            return out;
        } catch (e) {
            cb(decorateError(e, compiler));
        }
    };

    var dump       = require("./handlebars/dump")     (compiler);
    var sections   = require("./handlebars/sections") (compiler);
    var helpers    = require("./handlebars/helpers")  (compiler);

    Handlebars.registerHelper("section", sections["section"]);
    Handlebars.registerHelper("$yield",  sections["yield"]);
    Handlebars.registerHelper("$sep",    require("./handlebars/sep"));

    /**
     * Return at least the required interface for crossbow
     */
    return {
        "addToTemplateCache": function () { /*noop*/ },
        "readFrontMatter":    compiler.readFrontMatter,
        "render":             compiler.safeCompile,
        "registerPartial":    registerPartial,
        "addContent":         addContent,
        "Handlebars":         Handlebars,
        "registerHelper":     function (name, fn) {
            Handlebars.registerHelper(name, fn(compiler));
        }
    };
};

module.exports["plugin:name"] = "templates";

/**
 * @param {{content: string, config: Map}} opts
 * @returns {*}
 */
function addContent (opts) {
    Handlebars.registerHelper("content", function (options) {
        return new Handlebars.SafeString((function () {
            if (opts.config.get("prettyMarkup")) {
                return utils.paddLines({
                    stripNewLines: opts.config.getIn(["markup", "stripNewLines"]),
                    content:       opts.content,
                    count:         options._crossbow.column || 0
                });
            }
            return opts.content;
        })());
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

    var yamlLineCount = data.item.getIn(["front", "lineCount"]);
    var HBlinecount   = objPath.get(e,    "hash.loc.first_line", 0);

    if (!e._crossbow) {
        e._crossbow = {
            line: yamlLineCount + HBlinecount
        };
    } else {
        e._crossbow.line += yamlLineCount;
    }

    e._crossbow.file = data.item.get("key");

    if (!e._type) {
        e._type = "compile";
    }
    if (!e._ctx) {
        e._ctx = data.item;
    }

    return e;
}

module.exports.hooks = {
    dataTransforms: [
        {
            when: "before templates",
            fn: function (opts) {

                [
                    "inc",
                    "data",
                    "save",
                    "hl",
                    "current",
                    "if_eq",
                    "if_not_eq",
                    "loop",
                    "md",
                    "compile",
                    "$_"
                ].forEach(function (item) {
                    Handlebars.registerHelper(item, require("./handlebars/" + item)(opts.compiler));
                });

                return opts.compiler.globalData;
            }
        }
    ]
};

function s (fn, fnend) {
    var ws = new Transform();
    ws._write = fn;
    if (fnend) {
        ws._flush = fnend;
    }
    return ws;
}