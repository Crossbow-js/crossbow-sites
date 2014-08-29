/**
 * tfunk for terminal colours
 * @type {addLayout|exports}
 */
var tfunk    = require("tfunk");

var compiler = new tfunk.Compiler({
    prefix: "[%Cmagenta:CoderBlog%R] ",
    custom: {
        "error": "chalk.bgRed.white",
        "warn": "chalk.red"
    }
});

var logLevel = "warn";

var debugPrefix = ":%Ccyan:DEBUG%R] - ";
var infoPrefix  = ":%Ccyan:INFO%R] - ";
var warnPrefix  = ":%Cred:WARNING%R] - ";

//
module.exports = function (level, msg) {

    var args = Array.prototype.slice.call(arguments);
    args = args.slice(2);
    msg = tfunk(msg);

    if (level === "warn") {
        args.unshift(warnPrefix + msg);
        return console.log.apply(console, args);
    }

    if (level === "debug" && logLevel === "debug") {
        args.unshift(debugPrefix + msg);
        return console.log.apply(console, args);
    }

    if (level === "info") {
        args.unshift(infoPrefix + msg);
        return console.log.apply(console, args);
    }
};

/**
 * @param level
 */
module.exports.setLogLevel = function (level) {
    logLevel = level;
};

/**
 * @param name
 */
module.exports.setName = function (name) {

    var prefix = "[" + name;

    debugPrefix = tfunk(prefix + ":%Ccyan:DEBUG%R] - ");
    infoPrefix  = tfunk(prefix + ":%Ccyan:INFO%R] - ");
    warnPrefix  = tfunk(prefix + ":%Cred:WARNING%R] - ");
};