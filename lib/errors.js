var objPath = require("object-path");
var prefix  = "{red:[ ERROR ]}";

var fails    = {
    "include": function (data) {
        var hash = objPath.get(data.error, "_params", {});
        if (hash.src) {
            return ["File not found: {yellow:%s}", hash.src];
        }
        return [prefix + " %s", data.error.message];
    },
    "include:src": function (data) {
        var crossbow = objPath.get(data, "error._crossbow", {});
        if (crossbow.message) {
            var str = crossbow.message;
            str += "\n";
            str += "\n";
            str += "File:     {yellow:" + crossbow.file + "}\n";
            str += "Line:     {yellow:" + crossbow.line + "}\n";
            return [str];
        }
    },
    "yaml": function (data) {
        return ["{red:[ ERROR ]} The YAML in {yellow:%s} is mal-formed and will be ignored", data.file];
    },
    "compile": function (data) {

        var hash     = objPath.get(data, "error.hash", {});
        var position = objPath.get(hash, "position", {});
        var context  = objPath.get(data, "error._ctx", {});
        var crossbow = objPath.get(data, "error._crossbow", {});

        var out = [];
        var str = data.error.message;

        if (hash && hash.position) {
            str = "";
            str += "{red:[Compile error]}\n";
            str += "\n";
            str += "File:     {yellow:" + context.key + "}\n";
            str += "Line:     {yellow:" + crossbow.line + "}\n";
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

module.exports.fails = fails;

var wrapper = "<span style=\"color: red\">Crossbow WARNING:</span> %s";

var inline = {
    "file:notfound" : function (file) {
        return wrapper.replace("%s", "File not found: " + file);
    }
};
module.exports.inline = inline;


