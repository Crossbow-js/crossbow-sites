var crossbow  = require("../index");
var yaml      = require("../lib/yaml");
var utils     = crossbow.utils;
var through2  = require("through2");
var gutil     = require("gulp-util");
var File      = gutil.File;
var path      = require("path");
var Immutable = require("immutable");
var Q         = require("q");
var _         = require("lodash");
var errors    = require("../lib/errors").fails;

/**
 * @returns {Function}
 */
module.exports = function (opts) {

    opts        = opts        || {};
    opts.config = opts.config || {};

    var files = {};
    var stream;

    if (!opts.config.errorHandler) {
        opts.config.errorHandler = function (err, compiler) {
            compiler.logger.error(compiler.getErrorString(err));
        };
    }

    var site = crossbow.builder({config: opts.config});

    return through2.obj(function (file, enc, cb) {

        stream = this;

        if (file._contents) {
            var contents        = file._contents.toString();
            var relFilePath     = file.path.replace(file.cwd, "");
            relFilePath         = relFilePath.replace(/^\//, "");
            files[relFilePath]  = contents;
        }
        cb();

    }, function (cb) {

        var promises = [];
        var queue    = [];
        var partials = [];

        Object.keys(files).forEach(function (key) {
            queue.push(site.add({key: key, content: files[key]}));
        });

        if (!queue.length && partials.length) {

            //site.compileAll(function (err, out) {
            //
            //    if (err) {
            //        cb();
            //    } else {
            //
            //        _.each(out, function (item) {
            //
            //            if (!item) {
            //                return;
            //            }
            //
            //            stream.push(new File({
            //                cwd:  "./",
            //                base: "./",
            //                path: item.filePath,
            //                contents: new Buffer(item.compiled)
            //            }));
            //        });
            //
            //        cb();
            //    }
            //});

        } else {

            if (!queue.length) {
                return;
            }

            _.each(queue, function (item) {
                promises.push(buildOne(site, stream, item));
            });

            Q.all(promises).then(function (err, out) {
                cb();
            }).catch(function (err) {
                site.logger.warn(site.getErrorString(err));
                stream.emit("end");
                cb();
            });
        }
    });
};

module.exports.logger     = crossbow.logger;
module.exports.clearCache = crossbow.clearCache;

/**
 *
 */
function buildOne(site, stream, item) {

    var deferred = Q.defer();

    site.compile({
        item: item,
        cb: function (err, out) {
            if (err) {
                deferred.reject(err);
            } else {
                stream.push(new File({
                    cwd:  "./",
                    base: "./",
                    path: out.get("filepath"),
                    contents: new Buffer(out.get("compiled"))
                }));
                deferred.resolve(out);
            }
        }
    });

    return deferred.promise;
}