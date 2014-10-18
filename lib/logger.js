"use strict";

var logger   = require("eazy-logger").Logger({
    prefix: "[{magenta:Crossbow}] ",
    useLevelPrefixes: true,
    level: "info"
});

module.exports = function (emitter) {

    emitter.on("log", function (data) {
        logger[data.type](data.msg);
    });

    return logger;
};

module.exports.logger = logger;
