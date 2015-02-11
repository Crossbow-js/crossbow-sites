var fs      = require("fs");
var path    = require("path");
var yaml    = require("./yaml");
var utils   = require("./utils");
var _       = require("lodash");

/**
 * @param compiler
 * @returns {{getFile: Function, resolvePath: Function, getOneFromFileSystem: Function, getJsonData: Function, getYamlData: Function}}
 */
module.exports = function (compiler) {

    var file = {
        /**
         * {{path: string}} opts
         */
        getFile: function (opts) {

            compiler.logger.debug("{fs:Looking for file: {file:%s}", opts.path);

            var filepath = file.resolvePath(opts);

            if (!filepath) {
                compiler.logger.warn("{fs:Failed to load the file: {file:%s} from the file system", opts.path);
                return false;
            }

            compiler.logger.debug("{fs:Returning file: {file:%s}", filepath);

            return file.getOneFromFileSystem(filepath);
        },
        /**
         * @param opts
         * @returns {*}
         */
        resolvePath: function (opts) {

            var filepath = path.join(compiler.config.get("cwd"), opts.path);

            if (!fs.existsSync(filepath)) {

                // always try relative path first
                if (fs.existsSync(opts.path)) {
                    return opts.path;
                } else {

                    var resolved = file.resolver(compiler.config)(opts.path);

                    if (fs.existsSync(resolved)) {
                        compiler.logger.debug("{fssuccess:Resolved from File System: {file:%s}", resolved);
                        return resolved;
                    }

                    compiler.logger.warn("{fs:Tried (failed) to resolve file: {file:%s}", resolved);
                    compiler.logger.warn("{fs:Perhaps you should set your {magenta:CWD}? It's currently {magenta:%s}", compiler.config.get("cwd"));

                    return false;
                }
            } else {
                return filepath;
            }
        },
        /**
         * @param filepath
         * @returns {{data: {}, content: *}}
         */
        getOneFromFileSystem: function (filepath) {

            var data    = {};
            var absPath = require("path").resolve(filepath);
            var content = fs.readFileSync(absPath, "utf-8");

            if (filepath.match(/\.json$/i)) {
                data = file.getJsonData(filepath, content);
            }
            if (filepath.match(/\.ya?ml$/i)) {
                data = file.getYamlData(filepath, content);
            }

            return {
                data:         data,
                content:      content,
                absolutePath: absPath
            };
        },
        /**
         * @param filepath
         * @param content
         * @returns {{}}
         */
        getJsonData: function getJsonData (filepath, content) {
            try {
                return JSON.parse(content);
            } catch (e) {
                e._crossbow = {
                    file: filepath,
                    line: 0,
                    message: "Could not parse JSON"
                };
                e._type = "json";
                compiler.error(e);
                return {};
            }
        },
        /**
         * @param filepath
         * @param content
         * @returns {*}
         */
        getYamlData: function getYamlData (filepath, content) {
            try {
                return yaml.parseYaml(content);
            } catch (e) {
                e._crossbow = {
                    line:    e.mark.line + 1,
                    file:    filepath,
                    message: e.message
                };
                e._type = "yaml";
                compiler.error(e);
                return {};
            }
        },
        /**
         * @param config
         * @returns {Function}
         */
        resolver: function (config) {
            return function (filep) {
                return utils.makeFsPath(
                    utils.getLayoutPath(
                        filep,
                        config.get("dirs").get("includes")
                    ),
                    config.get("cwd")
                );
            };
        }
    };

    return file;
};