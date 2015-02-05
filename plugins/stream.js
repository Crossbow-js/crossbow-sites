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
module.exports = function (userConfig) {

    userConfig = userConfig || {};
    var files = {};
    var stream;
    var sitedata = userConfig.data;

    if (!userConfig.errorHandler) {
        userConfig.errorHandler = function (err, compiler) {
            compiler.logger.error(compiler.getErrorString(err));
        };
    }

    var site = crossbow.builder({
        config: userConfig
    });

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
            if (isPartial(key)) {
                site.populateCache(key, files[key], "");
                partials.push(key);
            } else if (isData(key)) {
                site.populateCache(key, files[key], "data");
            } else {
                var item;
                if (isPost(key)) {
                    item = site.addPost(key, files[key]);
                } else {
                    if (isPage(key)) {
                        item = site.addPage(key, files[key]);
                    }
                }
                queue.push(item);
            }
        });

        if (!queue.length && partials.length) {

            site.compileAll(function (err, out) {

                if (err) {
                    cb();
                } else {

                    _.each(out, function (item) {

                        if (!item) {
                            return;
                        }

                        stream.push(new File({
                            cwd:  "./",
                            base: "./",
                            path: item.filePath,
                            contents: new Buffer(item.compiled)
                        }));
                    });

                    cb();
                }
            });

        } else {

            if (!queue.length) {
                return;
            }

            _.each(queue, function (item) {
                promises.push(buildOne(site, stream, item, sitedata));
            });

            Q.all(promises).then(function (err, out) {
                cb();
            }).catch(function (err) {
                //site.logger.warn(site.getErrorString(err));
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
function buildOne(site, stream, item, data) {

    var deferred = Q.defer();

    site.compile({
        item: item,
        data: data,
        cb: function (err, out) {
            if (err) {
                deferred.reject(err);
            } else {
                stream.push(new File({
                    cwd:  "./",
                    base: "./",
                    path: out.filePath,
                    contents: new Buffer(out.compiled)
                }));
                deferred.resolve(out);
            }
        }
    });

    return deferred.promise;
}

function isPartial(filePath) {
    return filePath.match(/(_inc|_includes|_layouts|_snippets)/);
}

function isPost(filePath) {
    return filePath.match(/_posts/);
}

function isData(filePath) {
    return path.extname(filePath).match(/(json|yml)$/i);
}

function isPage(filePath) {
    return filePath.match(/\.(html|md|markdown|hbs)$/);
}

function getConfigFile (filepath) {
    if (filepath.match(/ya?ml$/i)) {
        return yaml.getYaml(path.resolve(filepath));
    }
    if (filepath.match(/json$/i)) {
        return require(path.resolve(filepath));
    }
    return {};
}