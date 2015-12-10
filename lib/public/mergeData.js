var fs = require('fs');
var path = require('path');
module.exports = function mergeData (inData, inObj) {

    var compiler = this;

    Object.keys(inData).forEach(function (key) {
        var value = inData[key];
        if (typeof value === "string") {
            // files
            if (value.match(/^file:/)) {
                var filepath = value.replace(/^file:/, "");
                inObj[key] = compiler.file.getFile({path: filepath}).data;
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
                        })

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
