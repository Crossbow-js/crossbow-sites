var fs = require('fs');
var path = require('path');
var whitelist = ['.json', '.yaml', '.yml'];

module.exports = function mergeData (inData, inObj) {

    var compiler = this;

    function addDataToObject (dirpath, obj) {
        var stat = fs.lstatSync(dirpath);
        if (stat.isFile()) {
            var parsed = path.parse(dirpath);
            if (whitelist.indexOf(parsed.ext) > -1) {
                obj[parsed.name] = compiler.file.getFile({path: dirpath}).data;
                return;
            }
        }
        if (stat.isDirectory()) {
            var files = fs.readdirSync(dirpath);
            //console.log(files);
            obj[path.basename(dirpath)] = {};
            files.forEach(function (item) {
                addDataToObject(path.join(dirpath, item), obj[path.basename(dirpath)]);
            });
        }
    }

    Object.keys(inData).forEach(function (key) {
        var value = inData[key];
        if (typeof value === "string") {
            // files
            if (value.match(/^file:/)) {
                var filepath = value.replace(/^file:/, "");
                inObj[key] = compiler.file.getFile({path: filepath}).data;
                return;
            }
            if (value.match(/^all:/)) {
                var name    = value.replace(/^all:/, "");
                var dirpath = compiler.file.resolvePath({path: name});
                var input   = {};
                var parsed   = path.parse(dirpath);
                addDataToObject(dirpath, input);
                inObj[key] = input[parsed.name];
                return;
            }
            // directory
            if (value.match(/^dir:/)) {
                var dir = value.replace(/^dir:/, "");
                var dirpath = compiler.file.resolvePath({path: dir});
                if (dirpath) {
                    var files = fs.readdirSync(dirpath)
                        .filter(function (x) {
                            return x.match(/(json|ya?ml)$/i);
                        })
                        .map(function (x) {
                            return path.join(dirpath, x);
                        })
                        .map(function (path) {
                            return compiler.file.getFile({path: path}).data;
                        });

                    if (files.length) {
                        inObj[key] = files;
                    }
                }
                return;
            }
        }

        inObj[key] = value;
    });
};
