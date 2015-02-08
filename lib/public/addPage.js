var yaml        = require("../yaml");
var Page        = require("../page");

/**
 * @param {Compiler} compiler
 * @returns {Function}
 */
module.exports = function (compiler) {

    return function addPage (key, string) {

        var page;

        //if (page = compiler.cache.find(key, "pages")) {
        //
        //    compiler.logger.debug("Updating page: {yellow:%s}", page.key);
        //
        //    page.addData(key, string);
        //
        //    utils.prepareFrontVars({
        //        items: page,
        //        config: compiler.config,
        //        override: true
        //    });
        //    return page;
        //}

        //var front = yaml.readFrontMatter({
        //    content: string,
        //    compiler: compiler,
        //    key: key
        //});
        //
        //page = new Page({
        //    key: key,
        //    content: front.content,
        //    front: front.front
        //}, compiler.config);
        //
        // compiler.logger.debug("Adding page {yellow:%s} as {cyan:%s}", page.key, page.url);
        // compiler.cache.addPage(page);
        //
        //return page;
    };
};