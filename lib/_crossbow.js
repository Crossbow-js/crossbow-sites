var Page        = require("./page");
var Cache       = require("./cache");
var _           = require("lodash");
var events      = require("events");
var Partial     = require("./partial");
var Post        = require("./post");
var yaml        = require("./yaml");
var asyncTasks  = require("./asyncTasks");

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
    compiler.logger             = require("./logger").getLogger(compiler);
    compiler.file               = require("./file")(compiler.cache, compiler.logger, compiler.config);
    compiler.hb                 = require("./plugins/handlebars")(compiler.file, compiler.logger, compiler.emitter);
    compiler.dataTransforms     = require("./plugins/dataTransforms")(compiler.cache);
    compiler.contentTransforms  = require("./plugins/contentTransforms")(compiler.cache);
    compiler.globalData         = {};

    /**
     * Global error handler
     */
    compiler.error              = handleGlobalError(compiler);

    /**
     * Api methods
     */
    compiler.addPage            = addPage(compiler);
    compiler.addPost            = addPost(compiler);
    compiler.populateCache      = populateCache(compiler);
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
 * @param config
 * @returns {Function}
 */
function getCompiler (compiler, config) {

    return function (opts) {

        if (opts.item) {
            compiler.item      = opts.item;
        } else {
            var front = yaml.readFrontMatter({
                content: opts.content,
                errHandler: compiler.errHandler
            });

            compiler.item = new Page({
                key: opts.key,
                content: front.content,
                front: front.front
            }, compiler.config);
        }

        compiler.item.data = opts.data || {};

        require("async").eachSeries(
            asyncTasks.tasks,
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

        var front = yaml.readFrontMatter({
            content: string,
            compiler: compiler,
            key: key
        });

        page = new Page({
            key: key,
            content: front.content,
            front: front.front
        }, compiler.config);

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
        var front = yaml.readFrontMatter({
            content: string,
            compiler: compiler,
            key: key
        });

        post = new Post({
            key: key,
            content: front.content,
            front: front.front
        });

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