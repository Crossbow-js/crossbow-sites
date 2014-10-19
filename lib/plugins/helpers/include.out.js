var _    = require("lodash");
var dust = require("crossbow-helpers");

module.exports = function (chunk, content, sandbox, transform) {

    return chunk.map(function (chunk) {

        dust.renderSource(content, sandbox, function (err, out) {

            if (_.isFunction(transform)) {
                out = transform(out);
            }

            chunk.end(out);
        });
    });
};