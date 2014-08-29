var yaml = require("js-yaml");
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
function readFrontMatter(file) {
    if (/^---\n/.test(file)) {
        var end = file.search(/\n---\n/);
        if (end !== -1) {
            return {
                front: yaml.load(file.slice(4, end + 1)) || {},
                content: file.slice(end + 5)
            };
        }
    }
    return {
        front: {},
        content: file
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