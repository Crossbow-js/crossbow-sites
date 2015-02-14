var utils = require("./utils");
var yaml  = require("./yaml");

/**
 * Allow layouts to have layouts.
 * Recursively render layout from the inside out (allows any number of nested layouts until the current
 * one does not specify a layouts
 */
function addLayout(compiler, layout, item, cb) {

    var layoutPath = utils.getLayoutPath(layout, compiler.config.getIn(["dirs", "layouts"]));
    var layoutFile = compiler.file.getFile({path: layoutPath});
    var data       = compiler.frozen;

    if (!layoutFile) {

        compiler.logger.warn("The layout file {red:%s} does not exist", layoutPath);
        compiler.logger.warn("Check the file exists and that you've set the {magenta:cwd} property");

        return emptyReturn();
    }

    function emptyReturn () {
        return cb(null, {
            content: item.get("content")
        });
    }

    if (layoutFile && yaml.hasFrontMatter(layoutFile.content)) {

        var _data   = yaml.readFrontMatter({
            content:     layoutFile.content,
            compiler:    compiler,
            key:         compiler.item.get("key")
        });

        return compiler.template.render(_data.content, data, function (err, out) {

            compiler.template.addContent({
                content: out,
                config:  compiler.config,
                context: data
            });

            var itemout = item.set("content", out);

            addLayout(compiler, _data.front.layout, itemout, cb);
        });
    }

    cb(null, {
        content: compiler.template.render(layoutFile.content, data)
    });
}

module.exports = addLayout;