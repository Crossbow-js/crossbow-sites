var compiler = require("./plugins/handlebars")(file, logger, emitter);

/**
 * @param config
 * @constructor
 */
function Compiler (config) {

    if (!(this instanceof Compiler)){
        return new Compiler(config);
    }

    var compiler = this;
    compiler.compile = getCompiler(config);
}

/**
 * Return a compiling function
 * @param config
 * @returns {Function}
 */
function getCompiler (config) {

    return function (opts) {
        return opts.cb(null, "<pre><code class=\"js\"><span class=\"hljs-keyword\">var</span>");
    }
}

module.exports.Compiler = Compiler;