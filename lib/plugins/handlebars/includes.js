/**
 * @param file
 * @param log
 * @returns {Function}
 */
module.exports = function includeHelper (file, logger) {

    return function (inline) {

        var params = inline.hash || {};

        logger.debug("Looking for %s in the cache.", params.src);

        var sandBox = utils.prepareSandbox(params, inline.data.root);

        var src = Handlebars.compile(params.src)(sandBox);

        var contents = file.getFile(src);

        return new Handlebars.SafeString(
            Handlebars.compile(contents)(sandBox)
        );
    }
};

