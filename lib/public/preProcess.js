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

            parsed.filepath = url.makePageUrl(key, compiler.config).filePath;

            return Immutable
                .fromJS(parsed);
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
        }
    };

    return methods;
};
