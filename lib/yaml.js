var yaml = require("js-yaml");
var log  = require("./logger");
var fs   = require("fs");

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
        console.log(e);
    }
}

/**
 * Check if file has front matter
 * @param file
 * @returns {boolean}
 */
function hasFrontMatter(file) {
    return file.match(/^---\n/);
}

/**
 * @param file
 * @returns {*}
 */
function readFrontMatter(file, context, filePath) {

    var frontYaml;
    var content = file;

    if (/^---\n/.test(file)) {

        var end = file.search(/\n---\n/);

        if (end !== -1) {

            try {
                frontYaml = yaml.load(file.slice(4, end + 1));
            } catch (e) {
                log("warn", "The YAML in %Cred:%s%R is mal-formed & will be ignored.", filePath);
            }

            content = file.slice(end + 5);
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