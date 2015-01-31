/**
 * Allow layouts to have layouts.
 * Recursively render layout from the inside out (allows any number of nested layouts until the current
 * one does not specify a layout)
 * @param {String} layout
 * @param {Object} data
 * @param {Function} cb
 */
function addLayout(layout, data, cb) {

    var layoutPath = utils.getLayoutPath(layout, data.config.get("dirs").get("layouts"));
    var layoutFile = file.getFile(layoutPath);

    if (!layoutFile) {
        logger.warn("The layout file {red:%s} does not exist", layoutPath);
        logger.warn("Check the file exists and that you've set the {magenta:cwd} property");
        return cb(null, data.item.content);
    }

    if (layoutFile && yaml.hasFrontMatter(layoutFile.content)) {

        // nested layout
        var _data   = yaml.readFrontMatter({
            file:     layoutFile.content,
            context:  data.item,
            filePath: data.item.paths.filePath
        });

        return renderTemplate(_data.content, data, function (err, out) {

            data = compiler.addContent({
                context: data,
                content: out,
                config: data.config
            });

            addLayout(_data.front.layout, data, cb);
        });
    }

    return renderTemplate(layoutFile.content, data, cb);
}


/**
 * Compile a single file
 * @param {String|Object} item
 * @param {Object} userConfig
 * @param {Function} cb
 */
function compileOne(item, userConfig, cb) {

    /**
     * Merge configs
     */
    var config = defaults.merge(userConfig);

    /**
     * Set CWD on the fly
     */
    if (config.has("cwd")) {
        file.config.cwd = config.get("cwd");
    }

    /**
     * Setup data + look for _config.yml if needed
     * @type {{site: (siteConfig|*), config: *}}
     */
    var data = {
        config: config
    };

    /**
     * Get the current item from the cache
     * @type {*}
     */
    var match = getMatch(item);

    /**
     * Don't continue if there's no match or front-matter.
     * Posts & Pages should have already been added with .addPost or .addPage
     */
    if (!match || !match.front) {
        return cb(null, item);
    }

    /**
     * Compile 1, or with pagination
     */
    if (match.front.paginate) {
        doPagination(match, data, config, cb);
    } else {
        constructItem(match, data, config, function (err, item) {
            if (err) {
                return cb(err);
            } else {
                cb(null, item);
            }
        });
    }
}

/**
 * @param cb
 * @param config
 * @param items
 */
function compileMany(items, config, cb) {

    var compiled = [];
    var count    = 0;

    items.forEach(function (post) {
        compileOne(post, config, function (err, out) {
            if (err) {
                cb(err);
            }
            count += 1;
            if (Array.isArray(out)) {
                compiled.concat(out);
            } else {
                compiled.push(out);
            }
            if (count === items.length) {
                cb(null, compiled);
            }
        });
    });
}

/**
 * @param {Post|Page} item
 * @param {Object} data
 * @param {Object} config
 * @param {Function} cb
 */
function doPagination(item, data, config, cb) {

    var meta           = utils.splitMeta(item.front.paginate);
    var collection     = cache.getCollection(meta[0]);

    var paginator      = new Paginator(collection, item, meta[1], config);
    var paginatorPages = paginator.pages();

    var compiledItems  = [];

    paginatorPages.forEach(function (item, i) {

        data.paged = paginator.getMetaData(item, data.config, i);

        constructItem(item.page, data, config, function (err, item) {
            if (err) {
                return cb(err);
            } else {
                compiledItems.push(item);
                if (compiledItems.length === paginatorPages.length) {
                    cb(null, compiledItems);
                }
            }
        });
    });
}

/**
 * @param err
 * @param out
 * @param data
 * @param item
 * @param config
 * @param cb
 * @returns {*}
 */
function handleSuccess(item, data, config, cb, err, out) {

    if (err) {
        return cb(err);
    }

    var fullContent = applyContentTransforms("before item render", out, data, config);

    // Just write the body content without parsing (already done);
    data = compiler.addContent({
        content: fullContent,
        context: data,
        config:  config
    });

    var layout = getLayoutName(data.page.front.layout, config);

    if (layout) {
        return appendLayout(layout, item, data, cb);
    }

    item.compiled = fullContent;

    return cb(null, item);
}

/**
 * @param layout
 * @param {Immutable.Map} config
 * @returns {*}
 */
function getLayoutName(layout, config) {
    if (_.isUndefined(layout)) {
        if (config.get("defaultLayout") !== false) {
            return config.get("defaultLayout");
        }
    }
    return layout;
}

/**
 * @param layout
 * @param item
 * @param data
 * @param cb
 */
function appendLayout(layout, item, data, cb) {
    addLayout(layout, data, function (err, out) {
        if (err) {
            cb(err);
        } else {
            item.compiled = out;
            cb(null, item);
        }
    });
}