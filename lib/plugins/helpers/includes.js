var utils     = require("../../utils");
var markdown  = require("../markdown");
var path      = require("path");
var parse     = require("./include.parse");

/**
 * @param file
 * @param log
 * @param dust
 * @returns {Function}
 */
module.exports = function (file, log, dust) {

    /**
     * This is accessed each time compileOne is called
     */
    return function (data) {

        return function (chunk, context, bodies, params) {

            var incl = parse(chunk, context, params, data, log);
            
            if (incl.saved || incl.error) {
                return chunk;
            }
            
            var fileContents;

            if (fileContents = file.getFile(incl.partialPath)) {
                
                if (params.filter) {
                    
                    if (dust.filters[params.filter]) {
                        
                        dust.loadSource(dust.compile(dust.filters[params.filter](fileContents), incl.partialPath + ".compiled"));
                        
                        return chunk.partial(incl.partialPath + ".compiled", dust.makeBase(incl.sandBox));
                        
                    } else if (params.filter === "hl") {

                        dust.loadSource(dust.compile(fileContents, incl.partialPath + ".compiled"));
                        
                        var lang = params.lang;
                        
                        if (!params.lang) {
                            lang = path.extname(params.src).replace(".", "");
                        }

                        return chunk.map(function (chunk) {
                            dust.render(incl.partialPath + ".compiled", incl.sandBox, function (err, out) {
                                chunk.end(utils.wrapCode(
                                    markdown.highlight(out, lang), lang
                                ));
                            });
                        });
                        
                    } else {
                        
                        log("warn", "filter not found: " + params.filter, incl.templateName);
                        
                    }
                    
                } else {
                    
                    return chunk.partial(incl.partialPath, dust.makeBase(incl.sandBox));
                    
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