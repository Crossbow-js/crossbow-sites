var utils     = require("../../utils");
var markdown  = require("../markdown");
var dust      = require("crossbow-helpers");
var path      = require("path");

/**
 * @param getFile
 * @param log
 */
module.exports = function (file, log) {

    return function (data) {
        
        /**
         * @param chunk
         * @param context
         * @param bodies
         * @param params
         * @returns {*}
         */
        return function (chunk, context, bodies, params) {
    
            var fileContents;
            var lang         = params.lang;
            var templateName = context.getTemplateName();
    
            if (params.src) {
                
                var sections;
                
                if (sections = params.src.match(/^saved:(.+)/)) {
                    fileContents = data.saved[sections[1]];
                } else {
                    fileContents = file.getFile(params.src);
                }
                
                if (!fileContents) {
                    log("warn", "File not found: " + params.src, templateName);
                    return chunk;
                }
                
                if (!params.lang) {
                    lang = path.extname(params.src).replace(".", "");
                }
                
                return chunk.write(
                    utils.wrapCode(
                        markdown.highlight(fileContents, lang), lang
                    )
                );
            } else {
    
                if (bodies.block) {
                    return chunk.capture(
                        bodies.block,
                        context,
                        captureBlock.bind(null, params.lang)
                    );
                }
            }
    
            // If there's no block, just return the chunk
            return chunk;
        };
    };
};

/**
 *
 * @param string
 * @param chunk
 * @param lang
 * @returns {*}
 */
function captureBlock(lang, string, chunk) {

    var out;
    // If no lang, just escape the content and wrap in pre+code
    if (!lang) {
        out = dust.filters["h"](string);
    } else {
        out = markdown.highlight(string, lang);
    }

    // If a lang, just highlight it
    chunk.end(
        utils.wrapCode(
            out, lang
        )
    );
}