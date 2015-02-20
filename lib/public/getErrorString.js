/**
 * @param {Error} err
 * @returns {*}
 */
module.exports = function getErrorString (err) {
    var errors = require("../errors").fails;
    if (errors[err._type]) {
        return errors[err._type]({error: err});
    }
    return err.message || err;
};