var yaml  = require("../yaml");
var utils = require("../utils");
var url   = require("../url");
var path  = require("../core/path");
var Immutable = require("immutable");

module.exports = function (compiler) {

    var methods = {
        /**
         * @param key
         * @param string
         * @returns {*|{key: *, path: {root, dir, base, ext, name}}}
         */
        parse: function (key, string) {

            var parsed      = methods.parseContent(key, string);
            var paths       = url.makePageUrl(key, compiler.config);

            parsed.url      = paths.url;
            parsed.filepath = paths.filePath;

            return Immutable
                .fromJS(parsed)
                .withMutations(methods.addMissingData);
        },
        /**
         * Split front-matter & content
         * @param key
         * @param string
         * @returns {{key: *, path: {root, dir, base, ext, name}}}
         */
        parseContent: function (key, string) {
            var out = {
                key: key,
                path: path.parse(key)
            };
            var split   = yaml.readFrontMatter({
                key: key,
                content: string,
                compiler: compiler
            });
            out.front   = split.front;
            out.content = split.content;
            return out;
        },
        /**
         * @param item
         */
        addMissingData: function (item) {
            addMissingTitle(item);
        }
    };

    return methods;
};

/**
 * Add a faux title if not in front matter
 * @param item
 */
function addMissingTitle (item) {
    if (!item.getIn(["front", "title"])) {
        item.set("title",
            utils.deslugify(
                url.getBaseName(item.get("url"))
            )
        );
    }
}

