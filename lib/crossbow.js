var Cache       = require("./cache");
var _           = require("lodash");
var events      = require("events");
var yaml        = require("./yaml");
var Immutable   = require("immutable");
var tasklist    = require("./async-task-list").tasklist;

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
    compiler.compile            = getCompiler(compiler);
    compiler.emitter            = new events.EventEmitter();
    compiler.cache              = new Cache();
    compiler.logger             = require("./logger").getLogger(compiler);
    compiler.file               = require("./file")(compiler);
    compiler.hb                 = require("./plugins/handlebars")(compiler);
    compiler.Handlebars         = compiler.hb.Handlebars;
    compiler.dataTransforms     = require("./plugins/dataTransforms")(compiler.cache);
    compiler.contentTransforms  = require("./plugins/contentTransforms")(compiler.cache);
    compiler.defaultData        = Immutable.fromJS({});
    compiler.fileHelper         = require("./file-helper")(compiler);
    compiler.filter             = require("./filter")(compiler);

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

/**
 * Return a compiling function
 * @param compiler
 * @returns {Function}
 */
function getCompiler (compiler) {

    return function (opts) {

        compiler.item = addItem(opts, compiler);
        compiler.data = addData(opts, compiler);

        require("async").eachSeries(
            tasklist,
            require("./taskRunner")(compiler),
            tasksComplete
        );

        function tasksComplete (err) {
            if (!err) {
                return opts.cb(null, compiler.item);
            }
            opts.cb(err);
            compiler.error(err);
        }
    };
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

/**
 * Add site data.
 * If given as a string, read the file, or anything else, us as is. (for example, an object)
 * @param opts
 * @param compiler
 * @returns {any}
 */
function addData (opts, compiler) {

    opts.data = opts.data || {};

    var out = Immutable.fromJS(opts.data)
        .withMutations(function (item) {

            /**
             * Add `site` data
             */
            if (typeof opts.data.site === "string") {
                item.set("site", compiler.file.getFile({path: opts.data.site}).data);
            }

            /**
             * Add `page` data from the current item
             */
            item.set("page", compiler.item);
        });

    return compiler.defaultData.mergeDeep(out);
}

/**
 * Get the to-be-compiled item
 * @param opts
 * @param compiler
 * @returns {*}
 */
function addItem (opts, compiler) {
    return opts.item || compiler.addPage(opts.key, opts.content);
}