var fs      = require("fs");
var path    = require("path");
var utils   = require("./utils");
var _       = require("lodash");
var merge   = require("opt-merger").merge;

var defaults = {
    cwd: process.cwd()
};

/**
 * @param {Object|Null} cache
 * @param {Object} logger
 * @returns {File}
 * @constructor
 */
var File = function (cache, logger, config) {
    this.config  = merge(defaults, config || {}, true);
    this.cache   = cache || {};
    this.logger  = logger;
    return this;
};

/**
 * @param cache
 * @returns {*|function(this:null)}
 */
module.exports = function (cache, logger, config) {
    return new File(cache, logger, config);
};

/**
 *
 */
File.prototype.reset = function (config) {
    this.config  = merge(defaults, config || {}, true);
};

/**
 * @param filepath
 * @param transform
 * @returns {Buffer|string|*}
 */
File.prototype.getOneFromFileSystem = function (filepath, transform) {

    var out   = {
        data:    {},
        content: fs.readFileSync(filepath, "utf-8")
    };

    if (_.isFunction(transform)) {
        out.content = transform(out.content)
    }

    this.cache.populateCache(filepath, out.content);

    if (path.extname(filepath).match(/(yml|json)$/i)) {
        out.data = this.cache
            .populateCache(filepath, out.content, "data")
            .find(filepath, "data").data;
    }

    return out;
};

/**
 * @param filePath
 * @param transform
 * @returns {*}
 */
File.prototype.tryFs = function (filePath, transform) {

    var filep = path.join(this.config.cwd || process.cwd(), filePath);

    if (!fs.existsSync(filep)) {

        // try relative path
        if (fs.existsSync(filePath)) {

            return this.getOneFromFileSystem(filePath, transform);

        } else {

            filep = utils.makeFsPath(utils.getIncludePath(filePath));

            if (fs.existsSync(filep)) {

                return this.getOneFromFileSystem(filePath, transform);

            } else {

                return false;

            }
        }
    } else {
        return this.getOneFromFileSystem(filep, transform);
    }
};

/**
 * Get a file from the cache, or alternative look it up on FS from CWD as base
 * @param {String} filePath - {short-key from cache}
 * @param {Function} [transform]
 * @param {Boolean} [allowEmpty] - should file look ups be allowed to return an empty string?
 * @param cache
 */
File.prototype.getFile = function (filePath, transform, allowEmpty) {

    var content;

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
        return this.tryFs(filePath, transform);

    } catch (e) {
        this.logger.debug("Could not access: {red:%s", filePath);
        return allowEmpty
            ? ""
            : false;
    }
};