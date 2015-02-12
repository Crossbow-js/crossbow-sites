var _          = require("lodash");
var utils      = require("./utils");
var Handlebars = require("handlebars");
var errors     = require("./errors").inline;


module.exports = function (compiler) {

    var helper = {
        getOptions: function (args) {
            var arr = _.toArray(args);
            if (arr.length) {
                return arr[arr.length - 1];
            }
        },
        processParams: function (opts) {
            if (!utils.verifyParams(opts.options.hash, opts.required)) {
                var err       = new Error(opts.error);
                err._params   = options.hash;
                err._crossbow = options._crossbow || {};
                err._type     = opts.type;
                err._crossbow.message = opts.error;
                compiler.error(err);
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
            var padded      = utils.paddLines(compiled || "", utils.getPadding(opts.options._crossbow.column || 0));

            /**
             * Return processed string
             */
            return {
                content:  file.content,
                compiled: compiled,
                padded:   padded
            };
        }
    };

    return helper;
};