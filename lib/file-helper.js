var utils      = require("./utils");
var path       = require("./core/path");
var fs         = require("fs");
var Handlebars = require("handlebars");
var errors     = require("./errors").inline;


module.exports.plugin = function (compiler) {

    var helper = {
        getOptions: function (args) {
            var arr = Array.prototype.slice.call(args);
            if (arr.length) {
                return arr[arr.length - 1];
            }
        },
        processParams: function (opts) {
            if (!opts.options.hash) {
                return {};
            }
            if (opts.required && !utils.verifyParams(opts.options.hash, opts.required)) {
                var err       = new Error(opts.error);
                err._params   = opts.options.hash;
                err._crossbow = opts.options._crossbow || {};
                err._type     = opts.type;
                err._type     = opts.type;
                err._crossbow.message = opts.error;
                err._crossbow.file    = compiler.item.get("filepath");
                compiler.error(err);
                return false;
            }
            return utils.processParams(opts.options.hash, opts.options.data.root, compiler);
        },
        retrieveFile: function (opts) {

            /**
             * Data sandbox for partial
             */
            var sandbox     = utils.prepareSandbox(opts.params, opts.options.data.root);

            /**
             * File content only
             * @type {string}
             */
            var file        = compiler.file.getFile({path: opts.params.src});

            /**
             * Return early if not retrievable
             */
            if (!file) {
                return {
                    inlineError: new Handlebars.SafeString(errors["file:notfound"](opts.params.src))
                };
            }

            /**
             * Compile include
             */
            var compiled    = compiler.safeCompile(file.content || "", sandbox);

            /**
             * Default to not padded
             */
            var padded      = utils.paddLines({
                stripNewLines:  compiler.config.getIn(["markup", "stripNewLines"]),
                content:        compiled || "",
                count:          opts.options._crossbow.column || 0
            });

            /**
             * Return processed string
             */
            return {
                data:     file.data,
                content:  file.content,
                compiled: compiled,
                padded:   padded
            };
        },
        scanDir: function (dir, exts) {

            var base       = compiler.config.get('base');
            const filepath = path.join(compiler.config.get("base"), dir);

            const maybePath = (function () {
                if (fs.existsSync(filepath)) {
                    return filepath;
                }
                if (fs.existsSync(dir)) {
                    base = process.cwd();
                    return path.resolve(dir);
                }
            })();

            if (!maybePath) {
                return {
                    errors: [
                        {
                            type: "Directory not found",
                            error: new Error("Directory not found")
                        }
                    ]
                }
            }

            const files = fs.readdirSync(maybePath)
                .map(function (item) {
                    return path.join(base, dir, item);
                })
                .map(function (item) {
                    return [item, path.parse(item)];
                })
                .filter(function (item) {
                    return exts.indexOf(item[1].ext) > -1;
                })
                .map(function (tuple) {
                    return {
                        absolute: tuple[0],
                        parsed: tuple[1]
                    }
                });
                // .reduce(function (acc, item) {
                //     const resolved = item[0];
                //     const parsed   = item[1];
                //     acc[parsed.name] = {};
                //     acc[parsed.name].resolved = resolved;
                //     acc[parsed.name].parsed   = parsed;
                //     return acc;
                // }, {});

            return {
                errors: [],
                files: files
            }
        }
    };

    return helper;
};
