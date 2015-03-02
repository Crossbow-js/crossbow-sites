var Cache       = require("./cache");
var events      = require("events");
var Immutable   = require("immutable");
var EE          = require("easy-extender");
var merge       = require("./config").merge;

var defaultPlugins = {
    "template":     require("./plugins/handlebars"),
    "logger":       require("./logger"),
    "file":         require("./file"),
    "file-helper":  require("./file-helper"),
    "filter":       require("./filter"),
    "markdown":     require("./plugins/markdown"),
    "type:page":    require("./public/addPage"),
    "type:partial": require("./public/addPartial"),
    "type:post":    require("./public/addPost")
};

/**
 * Create a Compiler Instance
 * @param config
 * @returns {*}
 */
module.exports.create = function (config) {
    var compiler = new require("./Compiler")(config);
    return setState(compiler);
};

/**
 * Set state/plugins/hooks on the running instance
 * @param compiler
 */
function setState(compiler) {

    /**
     * Compiler helpers
     * @type {Function}
     */
    compiler.pluginManager      = new EE(defaultPlugins, require("./hooks"));
    compiler.pluginManager.init();
    compiler.config             = compiler.pluginManager.hook("config", compiler, merge());
    compiler.emitter            = compiler.emitter || new events.EventEmitter();
    compiler.cache              = compiler.cache   || new Cache();
    compiler.logger             = compiler.pluginManager.get("logger")(compiler);
    compiler.file               = compiler.pluginManager.get("file")(compiler);
    compiler.fileCache          = {};
    compiler.template           = compiler.pluginManager.get("template")(compiler);
    compiler.Handlebars         = compiler.template.Handlebars;
    compiler.fileHelper         = compiler.pluginManager.get("file-helper")(compiler);
    compiler.filters            = compiler.pluginManager.hook("filters");
    compiler.filter             = compiler.pluginManager.get("filter")(compiler);
    compiler.defaultData        = Immutable.Map({});
    compiler.registerHelper     = compiler.template.registerHelper;
    compiler.contentTransforms  = compiler.pluginManager.hook("contentTransforms", compiler);
    compiler.dataTransforms     = compiler.pluginManager.hook("dataTransforms", compiler);
    compiler.itemTransforms     = compiler.pluginManager.hook("itemTransforms", compiler);

    /**
     * @param {{fn: function, when: string}} opts
     */
    compiler.transform = function (opts) {
        if (opts.type === "content") {
            compiler.contentTransforms.push(opts);
        }
        if (opts.type === "item") {
            compiler.itemTransforms.push(opts);
        }
    };

    /**
     * Get types from hooks
     * @type {*}
     */
    compiler.types = compiler.pluginManager.hook("types", compiler);

    return compiler;
}