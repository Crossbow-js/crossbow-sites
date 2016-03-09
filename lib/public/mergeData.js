var fs = require('fs');
var path = require('path');
var whitelist = ['.json', '.yaml', '.yml'];

module.exports = function mergeData (inData, inObj) {

    var compiler = this;

    /**
     * Take a directory and build an object tree
     * representing data/directories as found from
     * recursively entering each dir
     * @param {string} dirpath
     * @param {object} obj
     * @returns {object}
     */
    function addDataToObject (dirpath, obj) {
        var stat = fs.lstatSync(dirpath);
        var parsed = path.parse(dirpath);
        if (stat.isFile()) {
            if (whitelist.indexOf(parsed.ext) > -1) {
                obj[parsed.name] = compiler.file.getFile({path: dirpath}).data;
            }
            return obj;
        }
        if (stat.isDirectory()) {

            var files = fs.readdirSync(dirpath);
            var current = obj[path.basename(dirpath)] = {};
            files.forEach(function (item) {
                addDataToObject(path.join(dirpath, item), current);
            });
            return obj;
        }
    }

    /**
     * Read a single file from disk
     * @param {string} filepath
     * @returns {*}
     */
    function addDataFromFile (filepath) {
        return compiler.file.getFile({path: filepath}).data;
    }

    /**
     * Read all valid files from a single Directory and load them
     * as an array (for easier looping)
     * @param {string} dirpath
     * @returns {array}
     */
    function addDataFromFilesAsArray (dirpath) {
        var files = fs.readdirSync(dirpath);
        return files
            .filter(x => {
                const parsed = path.parse(x);
                return whitelist.indexOf(parsed.ext) > -1;
            })
            .map(x => path.join(dirpath, x))
            .map(x => {
                return compiler.file.getFile({path: x}).data;
            })
    }

    Object.keys(inData).forEach(function (key) {
        var value = inData[key];
        if (typeof value === "string") {
            // files
            var name = value.split(':');
            if (name.length > 1) {
                var parsed = path.parse(name[1]);
                if (name[0] === 'file') {
                    inObj[key] = addDataFromFile(name[1]);
                }
                if (name[0] === 'all') {
                    var dirpath = compiler.file.resolvePath({path: name[1]});
                    inObj[key] = addDataToObject(dirpath, {})[parsed.name];
                }
                if (name[0] === 'dir') {
                    var dir = name[1];
                    var dirpath = compiler.file.resolvePath({path: dir});
                    inObj[key] = addDataFromFilesAsArray(dirpath);
                }
                return;
            }
        }

        inObj[key] = value;
    });
};
