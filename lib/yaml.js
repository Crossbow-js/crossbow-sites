var yaml    = require("js-yaml");
var fs      = require("fs");
var emitter = require("./emitter");
var logger  = require("./logger").logger;

/**
 * @type {{hasFrontMatter: hasFrontMatter, readFrontMatter: readFrontMatter, parseYaml: parseYaml, isYaml: isYaml}}
 */
module.exports = {
    hasFrontMatter:  hasFrontMatter,
    readFrontMatter: readFrontMatter,
    parseYaml:       parseYaml,
    getYaml:         getYaml,
    isYaml:          isYaml
};

/**
 * @param {String} file - the path to the file
 * @returns {*}
 */
function getYaml(file) {
    try {
        return yaml.safeLoad(fs.readFileSync(file, "utf-8"));
    } catch (e) {
        logger.warn("Could not read {red:%s}", file);
    }
}

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
    var content = opts.file;

    if (/^---\n/.test(opts.file)) {

        var end = opts.file.search(/\n---/);

        if (end !== -1) {

            try {
                var slice = opts.file.slice(4, end + 1);
                frontYaml = yaml.load(slice);
                frontYaml.lineCount = slice.split("\n").length;
            } catch (e) {
                emitter.emit("_error", {
                    error: e,
                    message: "The YAML in {red:%s} is mal-formed & will be ignored.",
                    file: opts.filePath,
                    _type:  "yaml"
                });
            }

            content = opts.file.slice(end + 5);
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