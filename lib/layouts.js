var utils = require("./utils");
var yaml  = require("./yaml");

/**
 * Allow layouts to have layouts.
 * Recursively render layout from the inside out (allows any number of nested layouts until the current
 * one does not specify a layouts
 * @param {{compiler: Compiler, item: Compiler.item, content: string, layout: string}} opts
 */
function addLayout(opts) {

    var compiler   = opts.compiler;
    var layoutPath = utils.getLayoutPath(opts.layout, compiler.config.getIn(["dirs", "layouts"]));
    var layoutFile = compiler.file.getFile({path: layoutPath});
    var data       = compiler.frozen;

    if (!layoutFile) {

        compiler.logger.warn("The layout file {red:%s} does not exist", layoutPath);
        compiler.logger.warn("Check the file exists and that you've set the {magenta:base} property");

        return emptyReturn();
    }

    function emptyReturn () {
        return opts.cb(null, {
            content: opts.content
        });
    }

    if (layoutFile && yaml.hasFrontMatter(layoutFile.content)) {

        var _data   = yaml.readFrontMatter({
            content:     layoutFile.content,
            compiler:    compiler,
            key:         opts.item.get("key")
        });

        return compiler.template.render(_data.content, data, function (err, out) {

            compiler.template.addContent({
                content: out,
                config:  compiler.config,
                context: data
            });

            opts.layout = _data.front.layout;
            opts.content = out;

            addLayout(opts);
        });
    }

    opts.cb(null, {
        content: compiler.template.render(layoutFile.content, data)
    });
}

module.exports = addLayout;