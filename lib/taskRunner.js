module.exports = function (compiler) {

    return function (task, cb) {

        task(compiler, compiler.item, function executeTask(err, out) {

            /**
             * Exit early if any task returned an error.
             */
            if (err) {
                return cb(err);
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
        });
    };
};

