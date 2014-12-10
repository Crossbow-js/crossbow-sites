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
var errors    = require("../lib/errors");

var defaults = Immutable.Map({
    env:        "production",
    logLevel:   "info"
});

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
module.exports = function (userConfig) {

    var config = defaults.merge(Immutable.Map(userConfig || {}));

    if (typeof config.get('siteConfig') === "string") {
       config = config.set('siteConfig', getConfigFile(config.get('siteConfig')));
    }

    if (!config.get('siteConfig')) {
        config.set('siteConfig', {});
    }

    crossbow.logger.setLevel(config.get('logLevel'));

    if (config.get('cwd')) {
        crossbow.setCwd(config.get('cwd'));
    }

    var files = {};
    var stream;
    var jsConfig = config.toJS();

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
                    item = crossbow.addPost(key, files[key], jsConfig);
                } else {
                    if (isPage(key)) {
                        item = crossbow.addPage(key, files[key], jsConfig);
                    }
                }
                queue.push(item);
            }
        });

        if (!queue.length && partials.length) {

            crossbow.compileAll(jsConfig, function (err, out) {

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
                promises.push(buildOne(stream, item, jsConfig));
            });

            Q.all(promises).then(function (err, out) {
                cb();
            }).catch(function (err) {
                //console.log("ERROR FROM PRIMISE");
                //throw err;
                err = err.toString();
                crossbow.logger.error(err);
                cb();
            })
        }
    });
};

module.exports.logger     = crossbow.logger;
module.exports.clearCache = crossbow.clearCache;

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

function getConfigFile (filepath) {

    if (filepath.match(/ya?ml$/i)) {
        return yaml.getYaml(filepath);
    }

    if (filepath.match(/json$/i)) {
        return require("/Users/shakyshane/code/crossbow.js/test/fixtures/_config.json");
    }

    return {};
}