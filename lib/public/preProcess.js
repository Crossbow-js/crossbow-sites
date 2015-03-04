var url   = require("../url");
var Immutable = require("immutable");

module.exports = function preProcess (opts) {

    var compiler = this;

    var parsed      = compiler.parseContent(opts);

    parsed.filepath = url.makeFilepath(opts.key, compiler.config);
    parsed.stat     = opts.stat ? Immutable.Map(opts.stat) : false;

    return Immutable
        .fromJS(parsed);
};