/**
 * Global error handler
 * @param {Error} err
 * @returns {*}
 */
module.exports = function handleGlobalError (err) {

    var compiler = this;

    return compiler.config.get("errorHandler")(err, compiler);
};