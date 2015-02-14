"use strict";

module.exports.plugin = function (compiler) {

    /**
     * Create logger that anyone can use
     */
    var logger   = require("eazy-logger").Logger({
        prefix: "{magenta:Crossbow:{blue: ⇰ }",
        useLevelPrefixes: true,
        level: compiler.config.get("logLevel"),
        custom: {
            file: function (string) {
                return this.compile("{yellow:" + string + "}");
            },
            fs: function (string) {
                return this.compile("{yellow:[FS]} " + string);
            },
            fssuccess: function (string) {
                return this.compile("{green:[FS] " + string);
            }
        }
    });

    return logger;
};