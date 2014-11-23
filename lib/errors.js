var objPath = require("object-path");
var errors    = {
    "yaml": function (data) {
        return ["{red:[ ERROR ]} The YAML in {yellow:%s} is mal-formed and will be ignored", data.file];
    },
    "compile": function (data) {

        var hash     = objPath.get(data, "error.hash", {});
        var position = objPath.get(hash, "position", {});
        var out = [];
        var str = "";

        if (hash && position) {
            str += "{red:[Compile error]}\n";
            str += "\n";
            str += "File:     {yellow:" + objPath.get(data, "_ctx.key", "") + "}\n";
            str += "Line:     {yellow:" + hash.line + "}\n";
            str += "Expected: {yellow:" + hash.expected.join(",") + "}\n";
            str += "Got:      {yellow:" + hash.token + "}";
            str += "\n";
            str += "\n";
            str += "{green:" + escapeCurlies(position.string[0]) + "}";
            str += "\n";
            str += "{cyan:" + escapeCurlies(position.string[1]) + "}";
            str += "\n";
            str += "\n";
        }

        return [str];
    }
};

function escapeCurlies(str) {
    return str.replace(/\{/g, "\\{").replace(/\}/g, "\\}");
}

module.exports = errors;