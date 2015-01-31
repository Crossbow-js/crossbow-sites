var utils = require("./utils");
var yaml  = require("./yaml");

/**
 * Allow layouts to have layouts.
 * Recursively render layout from the inside out (allows any number of nested layouts until the current
 * one does not specify a layout)
 *
 */
function addLayout(compiler, item, cb) {

    var defaultLayout = compiler.config.get("defaultLayout");
    var layout;

    if (!item.front.layout && !defaultLayout) {
        return emptyReturn();
    }

    var layoutPath = utils.getLayoutPath(item.front.layout || defaultLayout, compiler.config.getIn(["dirs", "layouts"]));
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

    //cb(null, {
    //    content: "shane"
    //});
    //if (layoutFile && yaml.hasFrontMatter(layoutFile.content)) {

        //console.log("Has layout");
    //
    //    // nested layout
    //    var _data   = yaml.readFrontMatter({
    //        file:     layoutFile.content,
    //        context:  data.item,
    //        filePath: data.item.paths.filePath
    //    });
    //
    //    return renderTemplate(_data.content, data, function (err, out) {
    //
    //        data = compiler.addContent({
    //            context: data,
    //            content: out,
    //            config: data.config
    //        });
    //
    //        addLayout(_data.front.layout, data, cb);
    //    });
    //}

    compiler.hb.addContent({
        content: item.content,
        config:  compiler.config,
        context: compiler.globalData
    });

    var out = compiler.hb.renderTemplate(layoutFile.content);

    cb(null, {
        content: out
    });
}

module.exports = addLayout;