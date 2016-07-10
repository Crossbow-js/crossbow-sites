var Handlebars = require("handlebars");
var errors     = require("../../errors");
var path       = require("../../core/path");

const validExts = [
    '.bmp',
    '.gif',
    '.jpg',
    '.jpeg',
    '.png',
    '.TIFF',
    '.webp',
    '.svg'
];

function fromString (string) {
    const split = string.split(":");
    if (split[0] === 'dir') {
        return split[1];
    }
    return split[0];
}

/**
 * @returns {Function}
 */
module.exports = function includeHelper (compiler) {

    return function () {

        var fileHelper     = compiler.fileHelper;
        // const absoluteBase = path.resolve(compiler.config.get('base'));

        /**
         * Process options
         * @type {BrowserSync.options|*}
         */
        var options    = fileHelper.getOptions(arguments);

        /**
         * Process/verify params
         */
        var params     = fileHelper.processParams({
            options:  options,
            required: ["src"],
            error:    "You must provide a `src` parameter to the hash helper",
            type:     "imgs:src"
        });

        const dirs = (function () {
            if (typeof params.src === "string") {
                return [fromString(params.src)];
            }
            if (Array.isArray(params.src)) {
                return params.src.map(fromString);
            }
        })();

        const images = fileHelper.scanDir(dirs[0], validExts);


        /**
         * Directory ERROR (missing ETC)
         */
        if (images.errors.length) {
            return new Handlebars.SafeString(errors.inline["dir:notfound"](dirs[0]));
        }

        /**
         * Show error when no images found
         */

        if (images.files.length === 0) {
            return new Handlebars.SafeString(errors.inline["imgs:none-found"](dirs[0], validExts));
        }

        /**
         * Now group files based on indexing
         *
         * eg: 01-thumb
         *     01-large
         * @type {*|{}}
         */
        const grouped = images.files.reduce(function (acc, item) {

            const indexed = item.parsed.name.match(/^(\d{0,5})-(.*)$/);

            if (indexed) {
                const name = indexed[1];
                if (!acc[name]) {
                    acc[name] = {};
                }
                acc[name][indexed[2]] = decorate(item);
            } else {
                acc[item.parsed.name] = decorate(item);
            }

            return acc;

        }, {});

        function decorate(item) {
            var sizeOf      = require('image-size');
            var dimensions  = sizeOf(item.absolute);
            var relbase     = compiler.config.get('base');
            item.dimensions = dimensions;
            item.width      = dimensions.width;
            item.height     = dimensions.height;

            if (params.rel) {
                relbase = path.join(process.cwd(), params.rel);
            }

            item.src        = '/' + path.relative(relbase, item.absolute);

            return item;
        }

        return new Handlebars.SafeString(
            Object.keys(grouped).reduce(function (string, key) {
                const item = grouped[key];
                return string + options.fn(item);
            }, "")
        );

        // console.log(compiler.config.get('base'));
        // console.log(dirs);

        // console.log(options);
        // /**
        //  * Attempt to get a file from cache, or wherever
        //  */
        //
        // /**
        //  * File content only
        //  * @type {string}
        //  */
        // var file        = compiler.file.getFile({path: params.src});
        //
        // /**
        //  * Return early if not retrievable
        //  */
        // if (!file) {
        //     return {
        //         inlineError: new Handlebars.SafeString(errors["file:notfound"](params.src))
        //     };
        // }
        //
        // const crypto = require('crypto');
        // const hash = crypto.createHash('sha256').update(file.content).digest("hex");

        /**
         * Just return compiled
         */
        return new Handlebars.SafeString("shane");
    };
};

