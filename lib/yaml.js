var yaml    = require("js-yaml");

/**
 * @type {{hasFrontMatter: hasFrontMatter, readFrontMatter: readFrontMatter, parseYaml: parseYaml, isYaml: isYaml}}
 */
module.exports = {
    hasFrontMatter:  hasFrontMatter,
    readFrontMatter: readFrontMatter,
    parseYaml:       parseYaml,
    isYaml:          isYaml
};

/**
 * Check if file has front matter
 * @param file
 * @returns {Array}
 */
function hasFrontMatter(file) {
    return file.match(/^---\n/);
}

/**
 * @param {{file: String, context: Object, filePath: String}} opts
 * @returns {*}
 */
function readFrontMatter(opts) {

    var frontYaml;
    var content = opts.content;

    if (/^---\n/.test(opts.content)) {

        var end = opts.content.search(/\n---/);

        if (end !== -1) {

            try {
                var slice = opts.content.slice(4, end + 1);
                frontYaml = yaml.load(slice);
                frontYaml.lineCount = slice.split("\n").length + 1;
            } catch (e) {
                e._type = "yaml";
                e._crossbow = {
                    line:    e.mark.line + 1,
                    file:    opts.key,
                    message: e.message

                };
                opts.compiler.error(e);
            }

            content = opts.content.slice(end + 5);
        }
    }

    return {
        front:   frontYaml || {},
        content: content
    };
}

/**
 * @param string
 * @returns {*}
 */
function parseYaml(string) {
    return yaml.safeLoad(string);
}

/**
 * @param key
 */
function isYaml(key) {
    return key.match(/yml$/i);
}