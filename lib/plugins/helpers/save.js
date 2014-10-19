var utils    = require("../../utils");
var markdown = require("../markdown");
var path     = require("path");
var parse    = require("./include.parse");

/**
 * @param {File} file
 * @param {Function} log
 * @param {Dust} dust
 * @returns {Function}
 */
module.exports = function (file, log, dust) {

    /**
     * @param {Object} data - the global data object
     */
    return function (data) {

        /**
         * This is the @save helper that is called for each occurrence
         */
        return function (chunk, context, bodies, params) {

            var incl = parse(chunk, context, params, data, log);
            var fileContents;

            /**
             * 
             * Return the chunk if an error occurred
             * 
             */
            if (incl.error) {
                return chunk;
            }

            if (fileContents = file.getFile(incl.partialPath)) {

                /**
                 * 
                 * Save the content & return an empty chunk
                 * 
                 */
                return save(chunk, incl.partialPath, incl.sandBox);
                
            } else {

                /**
                 * 
                 * If file is not found, attempt a simple lookup
                 * 
                 */
                fileContents = file.getFile(params.src);
                
                if (fileContents) {
                    return save(chunk, params.src, incl.sandBox);
                } else {
                    log("warn", "Include not found: " + params.src, incl.templateName);
                }
            }
            return chunk;
        };

        /**
         * Render an include, save it to the data object and don't 
         * output anything.
         * @param {Dust.Chunk} chunk
         * @param {String} partialPath
         * @param {Object} sandBox
         * @returns {Dust.Chunk}
         */
        function save (chunk, partialPath, sandBox) {
            
            return chunk.map(function (chunk) {
                
                if (!data.saved) {
                    data.saved = {};
                }

                dust.render(partialPath, sandBox, function (err, out) {
                    data.saved[partialPath] = out;
                    chunk.end("");
                });
            });
        }
    };
};