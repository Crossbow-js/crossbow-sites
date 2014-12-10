var crossbow  = require("../index");
var yaml      = require("../lib/yaml");
var utils     = crossbow.utils;

var through2  = require("through2");
var gutil     = require("gulp-util");
var File      = gutil.File;
var path      = require("path");
var merge     = require("opt-merger").merge;
var Q         = require("q");
var _         = require("lodash");
var errors    = require("../lib/errors");

var defaults = {
    env: "production",
    logLevel: "debug"
};

var memo;
crossbow.emitter.on("_error", function (data) {
    if (data.error.message && data.error.message !== memo) {
        if (data._type && errors[data._type]) {
            var errorOut = errors[data._type](data);
            if (errorOut && errorOut.length) {
                crossbow.logger.error.apply(crossbow.logger, errorOut);
            }
        } else {
            crossbow.logger.error(data.error.message);
        }
        memo = data.error.message;
        setTimeout(function () {
            memo = "";
        }, 2000);
    }
});

/**
 * @returns {Function}
 */
module.exports = function (config) {

    config = merge(defaults, config || {}, true);

    if (config.configFile) {
        config.siteConfig = yaml.getYaml(config.configFile);
    } else {
        config.siteConfig = {};
    }

    crossbow.logger.setLevel(config.logLevel);

    if (config.cwd) {
        crossbow.setCwd(config.cwd);
    }

    var files = {};
    var stream;

    return through2.obj(function (file, enc, cb) {

        stream              = this;

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
                crossbow.populateCache(key, files[key], "");
                partials.push(key);
            } else if (isData(key)) {
                crossbow.populateCache(key, files[key], "data");
            } else {
                var item;
                if (isPost(key)) {
                    item = crossbow.addPost(key, files[key], config);
                } else {
                    if (isPage(key)) {
                        item = crossbow.addPage(key, files[key], config);
                    }
                }
                queue.push(item);
            }
        });

        if (!queue.length && partials.length) {

            crossbow.compileAll(config, function (err, out) {

                if (err) {
                    //console.log(err);
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
                promises.push(buildOne(stream, item, config));
            });

            Q.all(promises).then(function (err, out) {
                cb();
            }).catch(function (err) {
                //console.log("ERROR FROM PRIMISE");
                //throw err;
                //err = err.toString();
                //crossbow.logger.error(err);
                cb();
            })
        }
    });
};

module.exports.logger = crossbow.logger;

/**
 *
 */
function buildOne(stream, item, config) {

    var deferred = Q.defer();

    crossbow.compileOne(item, config, function (err, out) {

        if (err) {
            deferred.reject(err);
        } else if (out) {
            if (Array.isArray(out)) {
                out.forEach(function (item) {
                    stream.push(new File({
                        cwd:  "./",
                        base: "./",
                        path: item.filePath,
                        contents: new Buffer(item.compiled)
                    }));
                });
            } else {
                stream.push(new File({
                    cwd:  "./",
                    base: "./",
                    path: out.filePath,
                    contents: new Buffer(out.compiled)
                }));
            }

            deferred.resolve(out);
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
