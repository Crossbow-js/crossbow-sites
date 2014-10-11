var fs      = require("fs");
var path    = require("path");
var utils   = require("./utils");
var _       = require("lodash");
var log     = require("./logger").log;

/**
 * @param cache
 * @returns {*|function(this:null)}
 */
module.exports = function (cache) {
    return getFile.bind(null, cache);
};

/**
 * @param filepath
 * @param transform
 * @returns {Buffer|string|*}
 * @param cache
 */
function getOneFromFileSystem(filepath, transform, cache) {

    var file = fs.readFileSync(filepath, "utf-8");
    file = _.isFunction(transform) ? transform(file) : file;

    var isdata = path.extname(filepath).match(/(yml|json)$/);

    if (isdata) {
        var data = cache.populateCache(filepath, file, "data").find(filepath, "data");
        return data;
    }

    cache.populateCache(filepath, file);

    return file;
}

/**
 * @param filePath
 * @param transform
 * @returns {*}
 */
function tryFs(filePath, transform, cache) {

    var filep = utils.makeFsPath(filePath);

    if (!fs.existsSync(filep)) {

        // try relative path
        if (fs.existsSync(filePath)) {

            return getOneFromFileSystem(filePath, transform, cache);

        } else {

            filep = utils.makeFsPath(utils.getIncludePath(filePath));

            if (fs.existsSync(filep)) {

                return getOneFromFileSystem(filePath, transform, cache);

            } else {
                return false;
            }
        }
    } else {
        return getOneFromFileSystem(filep, transform, cache);
    }
}

/**
 * Get a file from the cache, or alternative look it up on FS from CWD as base
 * @param {String} filePath - {short-key from cache}
 * @param {Function} [transform]
 * @param {Boolean} [allowEmpty] - should file look ups be allowed to return an empty string?
 * @param cache
 */
function getFile(cache, filePath, transform, allowEmpty) {

    var content;

    log("debug", "Getting file: %s", filePath);

    if (_.isUndefined(allowEmpty)) {
        allowEmpty = true;
    }

    /**
     *
     * Try to get a file from memory first
     *
     */
    if (content = cache.findAny(filePath)) {
        log("debug", "{green:Cache access} for: %s", filePath);
        return content.content || content;
    } else {
        log("debug", "Not found in cache: %s", filePath);
    }

    /**
     *
     * Try to get the file from FS
     *
     */
    try {
        log("debug", "{yellow:File System access} for: %s", filePath);
        return tryFs(filePath, transform, cache);

    } catch (e) {
        log("warn", "Could not access:{red: %s", e.path);
        return allowEmpty
            ? ""
            : false;
    }
}