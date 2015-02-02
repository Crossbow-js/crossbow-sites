"use strict";

/**
 * Create logger that anyone can use
 */
var logger   = require("eazy-logger").Logger({
    prefix: "{magenta:Crossbow:{blue: ⇰ }",
    useLevelPrefixes: true,
    level: "debug",
    custom: {
        file: function (string) {
            return this.compile("{cyan:" + string + "}");
        }
    }
});

/**
 * Export default logger
 */
module.exports.logger = logger;

/**
 * @param compiler
 */
module.exports.getLogger = function (compiler) {

    if (compiler.config.get("logLevel")) {
        logger.setLevel(compiler.config.get("logLevel"));
    }
    return logger;
};
