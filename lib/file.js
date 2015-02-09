var fs      = require("fs");
var path    = require("path");
var utils   = require("./utils");
var _       = require("lodash");

module.exports = function (compiler) {

    var resolver = function (filep) {
        return utils.makeFsPath(
            utils.getLayoutPath(
                filep,
                compiler.config.get("dirs").get("includes")
            ),
            compiler.config.get("cwd")
        );
    };

    var file = {
        /**
         * @param opts
         */
        getFile: function (opts) {

            compiler.logger.debug("{fs:Looking for file: {file:%s}", opts.path);

            var filepath = file.resolvePath(opts);

            if (!filepath) {
                compiler.logger.warn("{fs:Failed to load the file: {file:%s} from the file system", opts.path);
                return false;
            }

            compiler.logger.debug("{fs:Returning file: {file:%s}", filepath);

            return file.getOneFromFileSystem(filepath);
        },
        /**
         * @param opts
         * @returns {*}
         */
        resolvePath: function (opts) {

            var filepath = path.join(compiler.config.get("cwd"), opts.path);

            if (!fs.existsSync(filepath)) {

                // always try relative path first
                if (fs.existsSync(opts.path)) {
                    return opts.path;
                } else {

                    var resolved = resolver(opts.path);

                    if (fs.existsSync(resolved)) {
                        compiler.logger.debug("{fssuccess:Resolved from File System: {file:%s}", resolved);
                        return resolved;
                    }

                    compiler.logger.warn("{fs:Tried (failed) to resolve file: {file:%s}", resolved);
                    compiler.logger.warn("{fs:Perhaps you should set your {magenta:CWD}? It's currently {magenta:%s}", compiler.config.get("cwd"));

                    return false;
                }
            } else {
                return filepath;
            }
        },
        /**
         * @param filepath
         * @returns {{data: {}, content: *}}
         */
        getOneFromFileSystem: function (filepath) {
            return {
                data:    {},
                content: fs.readFileSync(require("path").resolve(filepath), "utf-8")
            }
        }
    };

    return file;
};

/**
 * @param {Object|Null} cache
 * @param {Object} logger
 * @returns {File}
 * @constructor
 */
var File = function (cache, logger, config) {
    this.config   = config;
    this.cache    = cache || {};
    this.logger   = logger;
    this.resolver = function (f) { return f; };
    return this;
};

///**
// * @param cache
// * @returns {*|function(this:null)}
// */
//module.exports = function (cache, logger, config) {
//    return new File(cache, logger, config);
//};

/**
 *
 */
File.prototype.reset = function (config) {
    this.config  = merge(defaults, config || {}, true);
};

/**
 * @param filepath
 * @returns {Buffer|string|*}
 */
File.prototype.getOneFromFileSystem = function (filepath) {


    var out   = {
        data:    {},
        content: fs.readFileSync(require("path").resolve(filepath), "utf-8")
    };

    //if (path.extname(filepath).match(/(yml|json)$/i)) {
    //    out.data = this.cache
    //        .populateCache(filepath, out.content, "data")
    //        .find(filepath, "data").data;
    //}

    return out;
};

/**
 * @param filePath
 * @returns {*}
 * @param resolver
 */
File.prototype.tryFs = function (filePath, resolver) {

    var filep = path.join(this.config.get("cwd"), filePath);

    if (!fs.existsSync(filep)) {

        // always try relative path first
        if (fs.existsSync(filePath)) {
            return this.getOneFromFileSystem(filePath);

        } else {

            // next try to use the include path set in config
            if (_.isFunction(resolver)) {
                filep = resolver(filePath);
            } else {
                filep = this.resolver(filePath);
            }

            if (fs.existsSync(filep)) {

                return this.getOneFromFileSystem(filep);

            } else {

                return false;

            }
        }
    } else {
        return this.getOneFromFileSystem(filep);
    }
};

/**
 * Get a file from the cache, or alternative look it up on FS from CWD as base
 * @param {String} filePath - {short-key from cache}
 * @param {Function} [resolver]
 * @param {Boolean} [allowEmpty] - should file look ups be allowed to return an empty string?
 */
File.prototype.getFile = function (filePath, resolver, allowEmpty) {

    var content, data;

    this.logger.debug("Looking for file: {file:%s}", filePath);

    if (_.isUndefined(allowEmpty)) {
        allowEmpty = true;
    }

    /**
     *
     * Try to get a file from memory first
     *
     */
    if (content = this.cache.findAny(filePath)) {
        this.logger.debug("{green:Cache access} for: {file:%s}", filePath);
        if (data = this.cache.find(content.filePath, "data")) {
            content.data = data.data;
        }
        return content;
    } else {
        this.logger.debug("Not found in cache: {file:%s}", filePath);
    }

    /**
     *
     * Try to get the file from FS
     *
     */
    try {

        this.logger.debug("{yellow:File System access} for: {file:%s}", filePath);
        return this.tryFs(filePath, resolver);

    } catch (e) {

        this.logger.debug("Could not access: {red:%s", filePath);
        return allowEmpty
            ? ""
            : false;
    }
};