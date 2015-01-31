var utils = require("./utils");
var yaml  = require("./yaml");

/**
 * Allow layouts to have layouts.
 * Recursively render layout from the inside out (allows any number of nested layouts until the current
 * one does not specify a layout)
 *
 */
function addLayout(compiler, layout, item, cb) {

    var layoutPath = utils.getLayoutPath(layout, compiler.config.getIn(["dirs", "layouts"]));
    var layoutFile = compiler.file.getFile(layoutPath);

    if (!layoutFile) {

        compiler.logger.warn("The layout file {red:%s} does not exist", layoutPath);
        compiler.logger.warn("Check the file exists and that you've set the {magenta:cwd} property");

        return emptyReturn();
    }

    function emptyReturn () {
        return cb(null, {
            content: item.content
        });
    }

    if (layoutFile && yaml.hasFrontMatter(layoutFile.content)) {

        var _data   = yaml.readFrontMatter({
            file:     layoutFile.content,
            context:  item,
            filePath: item.paths.filePath
        });

        return compiler.hb.renderTemplate(_data.content, compiler.globalData, function (err, out) {

            compiler.hb.addContent({
                content: out,
                config:  compiler.config,
                context: compiler.globalData
            });

            item.content = out;

            addLayout(compiler, _data.front.layout, item, cb);
        });
    }

    cb(null, {
        content: compiler.hb.renderTemplate(layoutFile.content)
    });
}

module.exports = addLayout;