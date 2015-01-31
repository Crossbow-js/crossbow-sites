var Page   = require("./page");
var Cache  = require("./cache");
var _      = require("lodash");
var events = require("events");

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
     * Expose the compiler
     * @type {Function}
     */
    compiler.compile            = getCompiler(compiler, compiler.config);
    compiler.emitter            = new events.EventEmitter();
    compiler.cache              = new Cache();
    compiler.logger             = require("./logger");
    compiler.file               = require("./file")(compiler.cache, compiler.logger);
    compiler.hb                 = require("./plugins/handlebars")(compiler.file, compiler.logger, compiler.emitter);
    compiler.dataTransforms     = require("./plugins/dataTransforms")(compiler.cache);
    compiler.contentTransforms  = require("./plugins/contentTransforms")(compiler.cache);
    compiler.globalData         = {};

    if (compiler.hb["dataTransforms"]) {
        compiler.dataTransforms = _.merge(compiler.dataTransforms, compiler.hb["dataTransforms"]);
    }

    return compiler;
}

/**
 * Return a compiling function
 * @param config
 * @returns {Function}
 */
function getCompiler (compiler, config) {

    return function (opts) {

        var item = new Page(opts.key, opts.content, config);

        compiler.item      = item;
        compiler.item.data = opts.data || {};

        require("async").eachSeries(
            require("./asyncTasks"),
            require("./taskRunner")(compiler),
            tasksComplete
        );

        function tasksComplete (err) {
            if (!err) {
                opts.cb(null, compiler.item);
            }
        }
    }
}

module.exports.Compiler = Compiler;
