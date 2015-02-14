var Cache       = require("./cache");
var _           = require("lodash");
var events      = require("events");
var yaml        = require("./yaml");
var Immutable   = require("immutable");
var EE          = require("easy-extender");

var defaultPlugins = {
    "templates":   require("./plugins/handlebars"),
    "logger":      require("./logger"),
    "file":        require("./file"),
    "compiler":    require("./compiler"),
    "file-helper": require("./file-helper"),
    "filter":      require("./filter")
};

/**
 * @param config
 * @constructor
 */
function Compiler (config) {

    /**
     * Avoid using `this`
     * @type {Compiler}
     */
    var compiler = this;

    /**
     * Allow usage without `new`
     */
    if (!(compiler instanceof Compiler)) {
        return new Compiler(config);
    }

    /**
     * Save configuration
     */
    compiler.config = config;

    /**
     * Set some state on this object before returning
     */
    return setState(compiler);
}

/**
 * @param compiler
 */
function setState(compiler) {

    /**
     * Compiler helpers
     * @type {Function}
     */
    compiler.pluginManager      = new EE(defaultPlugins, require("./hooks"));
    compiler.pluginManager.init();

    compiler.emitter            = new events.EventEmitter();
    compiler.cache              = new Cache();
    compiler.compile            = compiler.pluginManager.get("compiler")(compiler);
    compiler.logger             = compiler.pluginManager.get("logger")(compiler);
    compiler.file               = compiler.pluginManager.get("file")(compiler);
    compiler.hb                 = compiler.pluginManager.get("templates")(compiler);
    compiler.Handlebars         = compiler.hb.Handlebars;
    compiler.fileHelper         = compiler.pluginManager.get("file-helper")(compiler);
    compiler.filter             = compiler.pluginManager.get("filter")(compiler);

    compiler.dataTransforms     = require("./plugins/dataTransforms")(compiler.cache);
    compiler.contentTransforms  = require("./plugins/contentTransforms")(compiler.cache);
    compiler.defaultData        = Immutable.fromJS({});

    compiler.helpers = [];

    compiler.registerHelper     = function (key, fn) {
        compiler.helpers.push({key: key, fn: fn});
    };

    /**
     * Global error handler
     */
    compiler.error              = handleGlobalError(compiler);

    /**
     * Api methods
     */
    compiler.addPage            = require("./public/addPage")(compiler);
    compiler.addPartial         = require("./public/addPartial")(compiler);
    compiler.preProcess         = require("./public/preProcess")(compiler).parse;
    compiler.compileAll         = compileAll(compiler);

    /**
     * Pretty/helpful errors
     * @type {Function}
     */
    compiler.getErrorString     = getErrorString(compiler);

    if (compiler.hb["dataTransforms"]) {
        compiler.dataTransforms = _.merge(compiler.dataTransforms, compiler.hb["dataTransforms"]);
    }

    return compiler;
}

module.exports.Compiler = Compiler;

/**
 * @param compiler
 * @returns {Function}
 */
function compileMany (compiler, items, cb) {

    var compiled = [];
    var count    = 0;

    items.forEach(function (item) {

        compiler.compile({
            item: item,
            cb: function (err, out) {
                if (err) {
                    cb(err);
                }
                count += 1;
                if (Array.isArray(out)) {
                    compiled.concat(out);
                } else {
                    compiled.push(out);
                }
                if (count === items.length) {
                    cb(null, compiled);
                }
            }
        });
    });
}

/**
 * @param {Compiler} compiler
 * @returns {Function}
 */
function compileAll (compiler) {

    return function (opts) {

        compileMany(
            compiler,
            compiler.cache.posts().concat(compiler.cache.pages()),
            opts.cb
        );
    };
}

/**
 * @param {Compiler} compiler
 * From a crossbow error, get a nicely formatted error.
 */
function getErrorString (compiler) {

    return function (err) {

        var errors = require("./errors").fails;
        return errors[err._type]({error: err});
    };
}

/**
 * Global error handler
 * @param {Compiler} compiler
 * @returns {Function}
 */
function handleGlobalError (compiler) {

    return function (err) {

        var handler = compiler.config.get("errorHandler");
        handler(err, compiler);
    };
}