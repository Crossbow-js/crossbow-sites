/**
 * @param config
 * @constructor
 */
function Compiler (config) {

    /**
     * Avoid using `this`
     * @type {Compiler}
     */
    var compiler = this;

    /**
     * Allow usage without `new`
     */
    if (!(compiler instanceof Compiler)) {
        return new Compiler(config);
    }

    /**
     * Save configuration
     */
    compiler.userConfig = config;

    /**
     * Set some state on this object before returning
     */
    return compiler;
}

Compiler.prototype.getErrorString = require("./public/getErrorString");
Compiler.prototype.parseContent   = require("./public/parseContent");
Compiler.prototype.preProcess     = require("./public/preProcess");
Compiler.prototype.mergeData      = require("./public/mergeData");
Compiler.prototype.getType        = require("./public/getType");
Compiler.prototype.freeze         = require("./public/freeze");
Compiler.prototype.error          = require("./public/error");
Compiler.prototype.add            = require("./public/add");
Compiler.prototype.compile        = require("./public/compile");

module.exports = Compiler;