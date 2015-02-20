var path  = require("../core/path");
var yaml  = require("../yaml");

/**
 * @param {{key: string, content: string}} opts
 * @returns {{key: string, path: {root, dir, base, ext, name}}}
 */
module.exports = function parseContent (opts) {

    var compiler = this;

    var out = {
        key: opts.key,
        path: path.parse(opts.key)
    };

    var split   = yaml.readFrontMatter({
        key: opts.key,
        content: opts.content,
        compiler: compiler
    });

    out.front   = split.front;
    out.content = split.content;

    return out;
};