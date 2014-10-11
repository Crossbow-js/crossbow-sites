"use strict";

var logger   = require("eazy-logger").Logger({
    prefix: "[{magenta:Crossbow}] ",
    useLevelPrefixes: false
});

module.exports = function (emitter) {

    emitter.on("log", function (data) {
        logger[data.type](data.msg);
    });

    return logger;
};

module.exports.logger = logger;
