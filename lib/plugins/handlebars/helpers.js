var Handlebars = require("handlebars");

module.exports = function (logger, emitter) {
    Handlebars.registerHelper("math", mathHelper);
};

function mathHelper(lvalue, operator, rvalue, options) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);
    return {
        "+": lvalue + rvalue,
        "-": lvalue - rvalue,
        "*": lvalue * rvalue,
        "/": lvalue / rvalue,
        "%": lvalue % rvalue
    }[operator];
}

