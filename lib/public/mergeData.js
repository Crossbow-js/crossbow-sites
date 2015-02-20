module.exports = function mergeData (inData, inObj) {

    var compiler = this;

    Object.keys(inData).forEach(function (key) {

        var value = inData[key];

        if (typeof value === "string" && value.match(/^file:/)) {
            var filepath = value.replace(/^file:/, "");
            inObj[key] = compiler.file.getFile({path: filepath}).data;
        } else {
            inObj[key] = value;
        }
    });
};