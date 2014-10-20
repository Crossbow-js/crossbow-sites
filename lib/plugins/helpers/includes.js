var utils           = require("../../utils");
var markdown        = require("../markdown");
var path            = require("path");
var dust            = require("crossbow-helpers");
var parse           = require("./include.parse");
var transformOut    = require("./include.out");

/**
 * 
 * The `@include` helper. (can be used as `@inc`)
 * 
 * @param {File} file
 * @param {Function} log
 * @param {Dust} dust
 * @returns {Function}
 */
module.exports = function (file, log) {

    /**
     * This is accessed each time compileOne is called
     */
    return function (data) {

        return function (chunk, context, bodies, params, after) {
            
            var incl = parse(chunk, context, params, data, log);
            var fileContents;
            
            if (incl.saved || incl.error) {
                return chunk;
            }

            if (fileContents = file.getFile(incl.partialPath)) {
                
                if (params.filter) {
                    
                    if (dust.filters[params.filter]) {

                        /**
                         * 
                         * Return the rendered content after putting through a dust
                         * filter
                         * 
                         */
                        return transformOut(chunk, dust.filters[params.filter](fileContents), incl.sandBox);
                        
                    } else if (params.filter === "hl") {
                        
                        var lang = params.lang;
                        
                        if (!lang) {
                            lang = path.extname(params.src).replace(".", "");
                        }

                        /**
                         * 
                         * Returned a rendered chunk, highlighted
                         * 
                         */
                        return transformOut(chunk, fileContents, incl.sandBox, function (out) {
                            return utils.wrapCode(
                                markdown.highlight(out, lang), lang
                            );
                        });
                        
                    } else {
                        log("warn", "filter not found: " + params.filter, incl.templateName);
                    }
                    
                } else {

                    /**
                     * 
                     * Return the partial
                     * 
                     */
                    return chunk.map(function (chunk) {
                        dust.renderSource(fileContents, incl.sandBox, function (err, out) {
                            chunk.end(out + after);
                        });
                    });
                }
            } else {
                // Final straw - try to grab ANY file from root
                fileContents = file.getFile(params.src);
                
                if (fileContents) {
                    
                    return chunk.partial(params.src, dust.makeBase(incl.sandBox));
                    
                } else {
                    
                    log("warn", "Include not found: " + params.src, incl.templateName);
                    
                }
            }
            return chunk;
        };
    };
};