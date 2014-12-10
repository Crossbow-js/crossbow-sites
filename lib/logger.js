"use strict";

var logger   = require("eazy-logger").Logger({
    prefix: "{magenta:Crossbow:{blue: ⇰ }",
    useLevelPrefixes: true,
    level: "warn",
    custom: {
        file: function (string) {
            return this.compile("{cyan:" + string + "}");
        }
    }
});

module.exports = function (emitter) {

    var memo;
    var timer;

    emitter.on("log", function (data) {
        //logger[data.type](data.msg);
    });

    emitter.on("_error", function (data) {
        //if (data.error.message && data.error.message !== memo) {
        //    logger.error(data.error.message);
        //    //console.log(data.error.stack);
        //    memo = data.error.message;
        //    setTimeout(function () {
        //        memo = "";
        //    }, 2000);
        //}
    });

    return logger;
};

module.exports.logger = logger;
