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

    emitter.on("error", function (data) {
        logger.error(data.error.message);
        //console.log(data);
        //console.log(data.error.stack);
    });

    return logger;
};

module.exports.logger = logger;
