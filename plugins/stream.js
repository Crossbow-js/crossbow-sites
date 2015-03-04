var crossbow = require("../index");
var yaml = require("../lib/yaml");
var utils = crossbow.utils;
var through2 = require("through2");
var gutil = require("gulp-util");
var File = gutil.File;
var path = require("path");
var Immutable = require("immutable");
var _ = require("lodash");
var errors     = require("../lib/errors").fails;

/**
 * @returns {Function}
 */
module.exports = function (opts) {

    opts = opts || {};
    opts.config = opts.config || {};

    var files = {};
    var stream;

    var site = opts.builder || crossbow.builder(opts);

    return through2.obj(function (file, enc, cb) {

        stream = this;

        if (file._contents) {
            var contents = file._contents.toString();
            var relFilePath = file.path.replace(file.cwd, "");
            relFilePath = relFilePath.replace(/^\//, "");
            files[relFilePath] = {stat: file.stat, content: contents};
        }
        cb();

    }, function (cb) {

        var queue = [];
        var compileAll = false;

        Object.keys(files).forEach(function (key) {

            var existing = site.cache._items.has(key);
            var front;

            if (existing) {
                front = site.cache.byKey(key).get("front");
            }

            var added = site.add({
                type:    site.getType(key),
                key:     key,
                content: files[key].content,
                stat:    files[key].stat
            });

            if (front && !added.get("front").equals(front)) {
                compileAll = true;
            }

            queue.push(added);
        });

        if (queue.length) {

            if (queue.some(function (item) {
                    return item.get("type") === "partial";
                }) || compileAll) {
                site.logger.debug("Re-compiling all items");
                site.freeze();
                site.compileAll({
                    cb: function (err, out) {
                        if (err) {
                            return console.log("ERROR");
                        }
                        streampush(out, stream);
                        cb();
                    }
                });
            } else {
                var timestart = new Date().getTime();
                site.freeze();
                site.compileMany({
                    collection: queue,
                    cb:         function (err, out) {
                        if (err) {
                            return console.log("ERROR");
                        }
                        site.logger.debug("Compiling {yellow:%s} item%s took {yellow:%sms}",
                            queue.length,
                            queue.length > 1 ? "s" : "",
                            new Date().getTime() - timestart
                        );
                        streampush(out, stream);
                        cb();
                    }
                });
            }
        }
    });
};

/**
 * Push multiple files down stream
 * @param collection
 * @param stream
 */
function streampush(collection, stream) {
    collection.forEach(function (item) {
        stream.push(new File({
            cwd:      "./",
            base:     "./",
            path:     item.get("filepath"),
            contents: new Buffer(item.get("compiled"))
        }));
    });
}