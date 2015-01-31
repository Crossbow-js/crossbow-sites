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

module.exports.logger = logger;
