var Page        = require("./page");
var Cache       = require("./cache");
var _           = require("lodash");
var events      = require("events");
var Partial     = require("./partial");
var Post        = require("./post");
var asyncTasks  = require("./asyncTasks")

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
    compiler.logger             = require("./logger").logger;
    compiler.file               = require("./file")(compiler.cache, compiler.logger, compiler.config);
    compiler.hb                 = require("./plugins/handlebars")(compiler.file, compiler.logger, compiler.emitter);
    compiler.dataTransforms     = require("./plugins/dataTransforms")(compiler.cache);
    compiler.contentTransforms  = require("./plugins/contentTransforms")(compiler.cache);
    compiler.globalData         = {};

    /**
     * Api methods
     */
    compiler.addPage            = addPage(compiler);
    compiler.addPost            = addPost(compiler);
    compiler.populateCache      = populateCache(compiler);

    if (compiler.hb["dataTransforms"]) {
        compiler.dataTransforms = _.merge(compiler.dataTransforms, compiler.hb["dataTransforms"]);
    }

    return compiler;
}

/**
 * Return a compiling function
 * @param compiler
 * @param config
 * @returns {Function}
 */
function getCompiler (compiler, config) {

    return function (opts) {

        if (opts.item) {
            compiler.item      = opts.item;
        } else {
            compiler.item      = new Page(opts.key, opts.content, config);
        }

        compiler.item.data = opts.data || {};

        require("async").eachSeries(
            asyncTasks.tasks,
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

/**
 * @param {Compiler} compiler
 * @returns {Function}
 */
function addPage(compiler) {

    return function (key, string) {

        var page;

        if (page = compiler.cache.find(key, "pages")) {
            compiler.logger.debug("Updating page: {yellow:%s}", page.key);
            page.addData(key, string);
            utils.prepareFrontVars({
                items: page,
                config: compiler.config,
                override: true
            });
            return page;
        }

        page = new Page(key, string, compiler.config);

        compiler.logger.debug("Adding page {yellow:%s} as {cyan:%s}", page.key, page.url);
        compiler.cache.addPage(page);

        return page;
    };
}

/**
 * @param {Compiler} compiler
 * @returns {Function}
 */
function addPost(compiler) {

    return function (key, string) {

        var post;

        /**
         * Update a cached post
         */
        if (post = compiler.cache.find(key, "posts")) {
            post.addData(key, string);
            utils.prepareFrontVars({
                items:    post,
                config:   compiler.config,
                override: true,
                blacklist: ["categories"]
            });
            return post;
        }

        /**
         * Create a new post.
         * @type {Post}
         */
        post = new Post(key, string, compiler.config);

        var filtered = asyncTasks.runTransforms({
            compiler: compiler,
            scope: "before item added",
            item: post
        });

        if (filtered) {
            compiler.cache.addPost(filtered);
            return filtered;
        }

        return post;
    };

}

/**
 * @param {Compiler} compiler
 * @returns {Function}
 */
function populateCache(compiler) {

    return function (key, value, type) {

        var url = require("./url");
        type = type || "partial";

        var partial;

        if (type === "data") {
            return compiler.cache.addData(key, value);
        }

        if (partial = compiler.cache.find(url.makeShortKey(key, compiler.file.config.cwd), "partials")){
            partial.content = value;
        } else {
            partial = new Partial(key, value, compiler.file);
            compiler.cache.addPartial(partial);
        }

        return compiler.cache;
    };
}