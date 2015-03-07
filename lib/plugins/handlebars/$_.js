/**
 * $_ (lodash) string helper.
 *
 * Check the docs here https://lodash.com/docs#camelCase
 *
 * EG:
 *
 * {{$_ 'startCase' 'node js'}}
 *
 * OUTPUT:
 *
 * Node Js
 *
 * @param {Compiler} compiler
 * @returns {function}
 */
module.exports = function (compiler) {

    return function $_Helper() {

        var _           = require("lodash");
        var args        = _.toArray(arguments);
        var paramErrors = "$_ (lodash) helper requires at least 2 params (method and value)";
        var err;

        if (args.length < 3) {
            err = new Error(paramErrors);
            err._type     = "lodash:string:params";
            err._crossbow = {
                file: compiler.item.get("filepath"),
                message: paramErrors
            };
            compiler.error(err);
            return "";
        }

        var lodashArgs = _.dropRight(args, 1);
        var lodashFn   = _[lodashArgs[0]];

        if (!lodashFn) {
            var msg = "`" + lodashArgs[0] + "` is not a lodash string helper. Check the docs here https://lodash.com/docs#camelCase";
            err = new Error(msg);
            err._type     = "lodash:string:params";
            err._crossbow = {
                file: compiler.item.get("filepath"),
                message: msg
            };
            compiler.error(err);
            return "";
        }

        return lodashFn.apply(null, lodashArgs.slice(1));
    };
};