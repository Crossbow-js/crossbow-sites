var layouts     = require("../layouts");
var Immutable   = require("immutable");
var _           = require("lodash");
var concat      = require("concat-stream");

/**
 * @param {{data: [object], key: string, content: string, cb: [function]}} opts
 * @returns {Function}
 */
module.exports = function compile (opts) {

    var compiler = this;

    if (!compiler.frozen) {
        compiler.freeze();
    }

    opts.item     = addItem(opts, compiler);

    compiler.item = opts.item;

    compiler.data = addData(opts, compiler);

    var content   = opts.item.get("content");

    readStream(content)

        .pipe(s(function (chunk, enc, done) {
            this.push(runContentTransforms({
                scope: "before item parsed",
                compiler: compiler,
                item: opts.item,
                content: chunk.toString()
            }));
            done();
        }))

        .pipe(s(function (chunk, enc, done) {
            var stream = this;
            compiler.template.render(chunk.toString(), compiler.frozen, function (err, out) {
                if (err) {
                    compiler.error(err);
                    return done();
                }
                stream.push(_.isString(out) ? out : out.string || "");
                done();
            });
        }))

        .pipe(s(function (chunk, enc, done) {
            this.push(runContentTransforms({
                scope: "before item render",
                compiler: compiler,
                item: opts.item,
                content: chunk.toString()
            }));
            done();
        }))

        .pipe(s(function (chunk, enc, done) {
            compiler.template.addContent({
                content: chunk.toString(),
                config:  compiler.config,
                context: compiler.frozen
            });
            this.push(chunk);
            done();
        }))

        .pipe(s(function (chunk, enc, done) {

            var stream = this;

            var layoutPath = compiler.config.get("defaultLayout");
            var itemlayout = opts.item.getIn(["front","layout"]);

            /**
             * If no layout specified in front-matter
             * & no default layout file, exit early and don't modify item content
             */
            if (!itemlayout && !layoutPath) {
                stream.push(chunk);
                return done();
            }

            /**
             * If a layout was specified in the item, use that instead
             */
            if (itemlayout) {
                layoutPath = itemlayout;
            }

            /**
             * Recursively add layouts
             */
            layouts({
                compiler: compiler,
                content: chunk.toString(),
                layout: layoutPath,
                item: opts.item,
                cb: function (err, out) {
                    if (err) {
                        compiler.error(err);
                    }
                    stream.push(out.content);
                    done();
                }
            });
        }))

        .pipe(concat(function (body) {
            var updated = opts.item.set("compiled", body.toString());
            compiler.cache.add(updated);
            opts.cb(null, updated);
        }));
};

/**
 * Add site data.
 * If given as a string, read the file, or anything else, us as is. (for example, an object)
 * @param opts
 * @param compiler
 * @returns {any}
 */
function addData (opts, compiler) {

    opts.data = opts.data || {};
    compiler.mergeData(opts.data, compiler.frozen);
    var item = opts.item.toJS();
    item.compiled              = item.content;
    compiler.frozen[item.type] = item;
    compiler.frozen["page"]    = item;
}

/**
 * Get the to-be-compiled item
 * @param opts
 * @param compiler
 * @returns {*}
 */
function addItem (opts, compiler) {
    if (opts.item) {
        return opts.item;
    }
    var out = compiler.add(opts);
    return out;
}

/**
 * @param opts
 * @returns {*}
 */
function runContentTransforms(opts) {

    var transforms = opts.compiler.pluginManager.hook("contentTransforms", opts.compiler);

    var out = "";
    require("lodash").each(transforms, function (plugin) {
        if (plugin.when === opts.scope) {
            out = plugin.fn(opts);
        }
    });

    return out;
}

var Readable  = require("stream").Readable;
var Transform = require("stream").Transform;

function readStream (content) {
    var rs = new Readable({objectMode: true});
    rs._read = function () {
        this.push(content);
        this.push(null);
    };
    return rs;
}

function s (fn, fnend) {
    var ws = new Transform();
    ws._write = fn;
    if (fnend) {
        ws._flush = fnend;
    }
    return ws;
}
