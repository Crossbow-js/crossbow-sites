module.exports = function (compiler) {

    return function (task, cb) {

        compiler.logger.debug("Running task: {cyan:%s", task.name);

        task(compiler, compiler.item, executeTask);

        function executeTask(err, out) {

            /**
             * Exit early if any task returned an error.
             */
            if (err) {
                return cb(err);
            }

            if (!out) {
                return cb(null);
            }

            /**
             * Modify item
             */
            if (out.item) {
                Object.keys(out.item).forEach(function (key) {
                    compiler.item[key] = out.item[key];
                });
            }

            /**
             * Modify globalData
             */
            if (out.globalData) {
                compiler.globalData = out.globalData;
            }

            cb(null);
        }
    };
};

