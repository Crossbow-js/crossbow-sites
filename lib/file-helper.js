var _          = require("lodash");
var utils      = require("./utils");
var Handlebars = require("handlebars");
var errors     = require("./errors").inline;


module.exports.plugin = function (compiler) {

    var helper = {
        getOptions: function (args) {
            var arr = _.toArray(args);
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
        }
    };

    return helper;
};